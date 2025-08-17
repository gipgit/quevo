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
                (data.questions || []).filter(q => q.question_type !== 'checkbox_multi').forEach(q => {
                    initialQuestionResponses[q.question_id] = '';
                });
                setQuestionResponses(initialQuestionResponses);

                const initialCheckboxResponses = {};
                (data.questions || []).filter(q => q.question_type === 'checkbox_multi').forEach(q => {
                    initialCheckboxResponses[q.question_id] = [];
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

    const handleCheckboxChange = useCallback((questionId, optionId, checked) => {
        setCheckboxResponses(prev => {
            const currentOptions = prev[questionId] || [];
            if (checked) {
                return { ...prev, [questionId]: [...currentOptions, optionId] };
            } else {
                return { ...prev, [questionId]: currentOptions.filter(id => id !== optionId) };
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
                errors[`requirement-${req.requirement_block_id}`] = t('pleaseFillAllRequiredFields');
            }
        });

        // Validate required questions
        questions.forEach(q => {
            if (q.is_required) {
                if (q.question_type === 'checkbox_multi') {
                    if (!checkboxResponses[q.question_id] || checkboxResponses[q.question_id].length === 0) {
                        errors[`question-${q.question_id}`] = t('pleaseFillAllRequiredFields');
                    }
                } else {
                    if (!questionResponses[q.question_id] || questionResponses[q.question_id].trim() === '') {
                        errors[`question-${q.question_id}`] = t('pleaseFillAllRequiredFields');
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

    // If no requirements and no questions, automatically skip
    if (requirements.length === 0 && questions.length === 0) {
        // Auto-skip after a brief delay
        setTimeout(() => {
            onNext({
                confirmedRequirements: {},
                questionResponses: {},
                checkboxResponses: {}
            });
        }, 100);
        return null;
    }

    return (
        <div className="space-y-6 flex flex-col h-full p-6">
            <div>
                <h2 className="text-xl lg:text-2xl font-bold mb-2" style={{ color: themeColorText }}>
                    {t('requirementsAndQuestionsTitle')}
                </h2>
            </div>

            {/* Requirements Section */}
            {requirements.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold" style={{ color: themeColorText }}>
                        {t('requirementsTitle')}
                    </h3>
                    {requirements.map(req => (
                        <div key={req.requirement_block_id} className="mb-3">
                            <label className={`flex items-start ${fieldErrors[`requirement-${req.requirement_block_id}`] ? 'border-l-4 border-red-500 pl-3' : ''}`}>
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 rounded mt-1 mr-2"
                                    checked={confirmedRequirements[req.requirement_block_id] || false}
                                    onChange={(e) => handleRequirementChange(req.requirement_block_id, e.target.checked)}
                                />
                                <div className="text-sm">
                                    <span className="">{req.title}:</span>{' '}
                                    <span className="">{req.requirements_text}</span>
                                    {fieldErrors[`requirement-${req.requirement_block_id}`] && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {fieldErrors[`requirement-${req.requirement_block_id}`]}
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            )}

            {/* Questions Section */}
            {questions.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold" style={{ color: themeColorText }}>
                        {t('questionsTitle')}
                    </h3>
                    {questions.sort((a, b) => a.display_order - b.display_order).map(q => (
                        <div key={q.question_id} className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                {q.question_text} {q.is_required && <span className="text-red-500">*</span>}
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
                            {q.question_type === 'checkbox_multi' && (
                                <div className={`mt-1 flex flex-row flex-wrap items-center gap-x-3 ${fieldErrors[`question-${q.question_id}`] ? 'border-l-4 border-red-500 pl-3' : ''}`}>
                                    {q.options?.sort((a, b) => a.display_order - b.display_order).map(option => (
                                        <label key={option.option_id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 rounded mr-1"
                                                checked={(checkboxResponses[q.question_id] || []).includes(option.option_id)}
                                                onChange={(e) => handleCheckboxChange(q.question_id, option.option_id, e.target.checked)}
                                            />
                                            <span className="text-xs md:text-sm">{option.option_text}</span>
                                        </label>
                                    ))}
                                    {fieldErrors[`question-${q.question_id}`] && (
                                        <div className="text-red-500 text-xs mt-1 w-full">
                                            {fieldErrors[`question-${q.question_id}`]}
                                        </div>
                                    )}
                                </div>
                            )}
                            {fieldErrors[`question-${q.question_id}`] && q.question_type !== 'checkbox_multi' && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors[`question-${q.question_id}`]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

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
                    onClick={handleNext}
                    className="px-4 py-2 rounded-md text-sm font-medium"
                    style={{ color: "#FFF", backgroundColor: themeColorButton }}
                >
                    {t('continue')}
                </button>
            </div>
        </div>
    );
}
