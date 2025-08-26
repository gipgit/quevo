"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

export default function RequirementsStep({
    selectedService,
    onNext,
    onBack,
    themeColorText,
    themeColorBackgroundCard,
    themeColorButton,
    themeColorBorder
}) {
    const t = useTranslations('ServiceRequest');
    const tCommon = useTranslations('Common');

    const [requirements, setRequirements] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // State for customer responses
    const [confirmedRequirements, setConfirmedRequirements] = useState({}); // { requirement_block_id: boolean }
    const [questionResponses, setQuestionResponses] = useState({}); // { question_id: string (for open_text/media_url) }
    const [checkboxResponses, setCheckboxResponses] = useState({}); // { question_id: [option_id1, option_id2] }

    // Validation state
    const [fieldErrors, setFieldErrors] = useState({}); // { field_id: error_message }

    // Effect to fetch service details including requirements and questions
    useEffect(() => {
        const fetchServiceDetails = async () => {
            setIsLoadingDetails(true);
            setFetchError(null);
            try {
                const response = await fetch(`/api/businesses/${selectedService.business_id}/services/${selectedService.service_id}/details`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || t('errorFetchingServiceDetails'));
                }
                const data = await response.json();

                setRequirements(data.requirements || []);
                setQuestions(data.questions || []);



                // Initialize response states for requirements and questions
                const initialConfirmedRequirements = {};
                (data.requirements || []).forEach(req => {
                    initialConfirmedRequirements[req.requirement_block_id] = false;
                });
                setConfirmedRequirements(initialConfirmedRequirements);

                const initialQuestionResponses = {};
                (data.questions || []).filter(q => q.question_type !== 'checkbox_multi' && q.question_type !== 'checkbox_single').forEach(q => {
                    initialQuestionResponses[q.question_id] = '';
                });
                setQuestionResponses(initialQuestionResponses);

                const initialCheckboxResponses = {};
                (data.questions || []).filter(q => q.question_type === 'checkbox_multi' || q.question_type === 'checkbox_single').forEach(q => {
                    initialCheckboxResponses[q.question_id] = q.question_type === 'checkbox_single' ? null : [];
                });
                setCheckboxResponses(initialCheckboxResponses);

            } catch (err) {
                console.error("Error fetching service details:", err);
                setFetchError(err.message || t('errorFetchingServiceDetails'));
            } finally {
                setIsLoadingDetails(false);
            }
        };

        if (selectedService?.service_id && selectedService?.business_id) {
            fetchServiceDetails();
        }
    }, [selectedService?.service_id, selectedService?.business_id, t]);

    const handleRequirementChange = useCallback((id, checked) => {
        setConfirmedRequirements(prev => ({ ...prev, [id]: checked }));
        // Clear error when requirement is checked
        if (checked) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`requirement-${id}`];
                return newErrors;
            });
        }
    }, []);

    const handleQuestionTextChange = useCallback((id, value) => {
        setQuestionResponses(prev => ({ ...prev, [id]: value }));
        // Clear error when field is filled
        if (value.trim()) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`question-${id}`];
                return newErrors;
            });
        }
    }, []);

    const handleCheckboxChange = useCallback((questionId, optionValue, checked, questionType) => {
        setCheckboxResponses(prev => {
            if (questionType === 'checkbox_single') {
                // For single checkbox, store the selected value
                return { ...prev, [questionId]: checked ? optionValue : null };
            } else {
                // For multi checkbox, store array of selected values
                const currentOptions = prev[questionId] || [];
                if (checked) {
                    return { ...prev, [questionId]: [...currentOptions, optionValue] };
                } else {
                    return { ...prev, [questionId]: currentOptions.filter(value => value !== optionValue) };
                }
            }
        });
        // Clear error when checkbox is selected
        if (checked) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`question-${questionId}`];
                return newErrors;
            });
        }
    }, []);

    // Validation function
    const validateForm = useCallback(() => {
        const errors = {};

        // Validate required requirements
        requirements.forEach(req => {
            if (req.is_required && !confirmedRequirements[req.requirement_block_id]) {
                errors[`requirement-${req.requirement_block_id}`] = tCommon('thisFieldIsRequired');
            }
        });

        // Validate required questions
        questions.forEach(q => {
            if (q.is_required === true || q.is_required === 'true') {
                if (q.question_type === 'checkbox_multi') {
                    if (!checkboxResponses[q.question_id] || checkboxResponses[q.question_id].length === 0) {
                        errors[`question-${q.question_id}`] = tCommon('thisFieldIsRequired');
                    }
                } else if (q.question_type === 'checkbox_single') {
                    if (!checkboxResponses[q.question_id]) {
                        errors[`question-${q.question_id}`] = tCommon('thisFieldIsRequired');
                    }
                } else {
                    if (!questionResponses[q.question_id] || questionResponses[q.question_id].trim() === '') {
                        errors[`question-${q.question_id}`] = tCommon('thisFieldIsRequired');
                    }
                }
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [requirements, questions, confirmedRequirements, questionResponses, checkboxResponses, t]);

    const handleNext = () => {
        if (validateForm()) {
            onNext({
                confirmedRequirements,
                questionResponses,
                checkboxResponses
            });
        }
    };

    const handleBack = () => {
        onBack();
    };

    if (isLoadingDetails) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColorButton }}></div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="text-center p-4">
                <p className="text-red-600 mb-4">{fetchError}</p>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 rounded-md text-sm font-medium"
                    style={{ color: "#FFF", backgroundColor: themeColorButton }}
                >
                    {t('back')}
                </button>
            </div>
        );
    }

    // If no requirements and no questions, show a message and allow continue
    if (requirements.length === 0 && questions.length === 0) {
        return (
            <div className="space-y-6 flex flex-col h-full p-6">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold mb-2" style={{ color: themeColorText }}>
                        {t('requirementsAndQuestionsTitle')}
                    </h2>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">{t('noRequirementsOrQuestions')}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-4 mt-auto sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-gray-200 -mx-6 px-6 py-4">
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 rounded-md text-sm font-medium mr-2"
                        style={{ backgroundColor: 'transparent', color: themeColorText, border: `1px solid ${themeColorText}` }}
                    >
                        {t('back')}
                    </button>
                    <button
                        onClick={() => onNext({
                            confirmedRequirements: {},
                            questionResponses: {},
                            checkboxResponses: {}
                        })}
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={{ color: "#FFF", backgroundColor: themeColorButton }}
                    >
                        {t('continue')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-6 space-y-6 lg:space-y-8">
            <div>
                <h2 className="text-xl lg:text-2xl font-bold mb-2" style={{ color: themeColorText }}>
                    {t('requirementsAndQuestionsTitle')}
                </h2>
            </div>

            {/* Requirements Section */}
            {requirements.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xs lg:text-base font-semibold opacity-50 text-uppercase border-b border-gray-500 pb-1" style={{ color: themeColorText }}>
                        {t('requirementsTitle')}
                    </h3>
                    {requirements.map(req => (
                            <div key={req.requirement_block_id} className="mb-1 lg:mb-3">
                                <label className={`flex items-start ${fieldErrors[`requirement-${req.requirement_block_id}`] ? 'border-l-4 border-red-500 pl-3' : ''}`}>
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 rounded mt-1 mr-2"
                                        checked={confirmedRequirements[req.requirement_block_id] || false}
                                        onChange={(e) => handleRequirementChange(req.requirement_block_id, e.target.checked)}
                                    />
                                    <div className="text-xs lg:text-sm leading-tight">
                                        <span className="font-semibold">{req.title}:</span>{' '}
                                        <span className="">{req.requirements_text}</span>
                                        {req.is_required && (
                                            <span className="inline-block ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                                {tCommon('required')}
                                            </span>
                                        )}
                                        {fieldErrors[`requirement-${req.requirement_block_id}`] && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {fieldErrors[`requirement-${req.requirement_block_id}`]}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Questions Section */}
            {questions.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xs lg:text-base font-semibold opacity-50 text-uppercase border-b border-gray-500 pb-1" style={{ color: themeColorText }}>
                        {t('questionsTitle')}
                    </h3>
                    {questions.sort((a, b) => a.display_order - b.display_order).map(q => {
                        // Parse question_options JSONB if it exists and is valid
                        let questionOptions = [];
                        if (q.question_options) {
                            try {
                                // Handle both string and object formats
                                if (typeof q.question_options === 'string') {
                                    questionOptions = JSON.parse(q.question_options);
                                } else if (typeof q.question_options === 'object') {
                                    questionOptions = q.question_options;
                                }
                            } catch (error) {
                                console.warn('Failed to parse question_options for question:', q.question_id, error);
                                questionOptions = [];
                            }
                        }
                        
                        return (
                            <div key={q.question_id} className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    {q.question_text} {(q.is_required === true || q.is_required === 'true') && (
                                        <span className="inline-block ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                            {tCommon('required')}
                                        </span>
                                    )}
                                </label>
                                {q.question_type === 'open' && (
                                    <input
                                        type="text"
                                        id={`question-${q.question_id}`}
                                        className={`mt-1 block w-full rounded-md border shadow-sm p-2 ${fieldErrors[`question-${q.question_id}`] ? 'border-red-500' : ''}`}
                                        style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: fieldErrors[`question-${q.question_id}`] ? '#ef4444' : themeColorBorder}}
                                        maxLength={q.max_length || 100}
                                        value={questionResponses[q.question_id] || ''}
                                        onChange={(e) => handleQuestionTextChange(q.question_id, e.target.value)}
                                        required={q.is_required}
                                    />
                                )}
                                {q.question_type === 'media_upload' && (
                                    <input
                                        type="url"
                                        id={`question-${q.question_id}`}
                                        className={`mt-1 block w-full rounded-md border shadow-sm p-2 ${fieldErrors[`question-${q.question_id}`] ? 'border-red-500' : ''}`}
                                        style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: fieldErrors[`question-${q.question_id}`] ? '#ef4444' : themeColorBorder}}
                                        placeholder={t('mediaUploadPlaceholder')}
                                        value={questionResponses[q.question_id] || ''}
                                        onChange={(e) => handleQuestionTextChange(q.question_id, e.target.value)}
                                        required={q.is_required}
                                    />
                                )}
                                {(q.question_type === 'checkbox_single' || q.question_type === 'checkbox_multi') && questionOptions.length > 0 && (
                                    <div className={`mt-1 flex flex-row flex-wrap items-center gap-x-3 ${fieldErrors[`question-${q.question_id}`] ? 'border-l-4 border-red-500 pl-3' : ''}`}>
                                        {questionOptions.map(option => {
                                            const optionValue = option.value || option.id;
                                            const optionText = option.text || option.option_text;
                                            const isChecked = q.question_type === 'checkbox_single' 
                                                ? checkboxResponses[q.question_id] === optionValue
                                                : (checkboxResponses[q.question_id] || []).includes(optionValue);
                                            
                                            return (
                                                <label key={optionValue} className="flex items-center">
                                                    <input
                                                        type={q.question_type === 'checkbox_single' ? 'radio' : 'checkbox'}
                                                        name={q.question_type === 'checkbox_single' ? `question-${q.question_id}` : undefined}
                                                        className={`${q.question_type === 'checkbox_single' ? 'form-radio' : 'form-checkbox'} h-4 w-4 rounded mr-1`}
                                                        checked={isChecked}
                                                        onChange={(e) => handleCheckboxChange(q.question_id, optionValue, e.target.checked, q.question_type)}
                                                    />
                                                    <span className="text-xs md:text-sm">{optionText}</span>
                                                </label>
                                            );
                                        })}
                                        {fieldErrors[`question-${q.question_id}`] && (
                                            <div className="text-red-500 text-xs mt-1 w-full">
                                                {fieldErrors[`question-${q.question_id}`]}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {(q.question_type === 'checkbox_single' || q.question_type === 'checkbox_multi') && questionOptions.length === 0 && (
                                    <div className="mt-1 text-sm text-gray-500 italic">
                                        {t('noOptionsAvailable') || 'No options available for this question.'}
                                    </div>
                                )}
                                {fieldErrors[`question-${q.question_id}`] && q.question_type !== 'checkbox_multi' && q.question_type !== 'checkbox_single' && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {fieldErrors[`question-${q.question_id}`]}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 p-6 border-t bg-white" style={{ borderColor: themeColorBorder }}>
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg border text-sm flex items-center"
                        style={{ borderColor: themeColorBorder, color: themeColorText }}
                    >
                        <svg className="w-4 h-4 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden lg:inline">{t('back')}</span>
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: themeColorButton, color: 'white' }}
                    >
                        {t('continue')}
                    </button>
                </div>
            </div>
        </div>
    );
}
