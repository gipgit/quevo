document.addEventListener('DOMContentLoaded', function() {
    const surveyStepsContainer = document.getElementById('surveySteps');
    const surveySteps = Array.from(document.querySelectorAll('.survey-step'));
    const surveyTabs = Array.from(document.querySelectorAll('.tab-item'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitSurveyBtn = document.getElementById('submitSurveyBtn');
    const messageOverlay = document.getElementById('messageOverlay');
    // Removed successOverlay and refreshPageButton as they are replaced by redirection
    const surveyForm = document.getElementById('surveyForm');
    const promoId = surveyForm ? surveyForm.dataset.promoId : null;
    const challengeId = surveyForm ? surveyForm.dataset.challengeId : null;

    let currentStep = 0;
    const totalSteps = surveySteps.length;
    const transitionDuration = 500; // Matches CSS transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;

    // Check if isGuest variable is defined by PHP
    const isGuest = typeof window.isGuest !== 'undefined' ? window.isGuest : false;

    if (totalSteps === 0 && promoId) {
        console.warn("No survey questions found for this promotion, or promo already unlocked.");
        const surveyContainer = document.querySelector('.survey-container');
        if (surveyContainer && !document.querySelector('.promo-page-lock-label')) {
            surveyContainer.innerHTML = '<p class="text-center font-bold">Nessun sondaggio disponibile per questa promozione.</p>';
        }
        return; // Exit script if no steps to manage
    }

    function showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= totalSteps) {
            console.warn("Attempted to show invalid stepIndex:", stepIndex, "Total steps:", totalSteps);
            return;
        }

        const prevStepElement = surveySteps[currentStep];
        const targetStepElement = surveySteps[stepIndex];

        // 1. Start fading out the current step (if different from target)
        if (prevStepElement && prevStepElement !== targetStepElement) {
            prevStepElement.classList.remove('active-step'); // Immediately remove active state
            prevStepElement.style.pointerEvents = 'none'; // Disable interactions immediately

            // Delay setting display: none until AFTER the fade-out transition is complete.
            setTimeout(() => {
                prevStepElement.style.display = 'none';
            }, transitionDuration);
        }

        currentStep = stepIndex;

        targetStepElement.style.display = 'flex'; // Ensure it's visible during the transition

        requestAnimationFrame(() => {
            targetStepElement.classList.add('active-step'); // This applies opacity: 1, visibility: visible, pointer-events: auto via CSS
        });

        // Update tab active state
        surveyTabs.forEach((tab, index) => {
            tab.classList.remove('active');
            if (index === currentStep) {
                tab.classList.add('active');
            }
        });

        // Button visibility
        if (prevBtn) {
            prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-block';
        }

        // "Completa" button and "Avanti" button logic
        if (submitSurveyBtn && nextBtn) {
            if (currentStep === totalSteps - 1) {
                submitSurveyBtn.style.display = 'inline-block';
                nextBtn.style.display = 'none';
            } else {
                submitSurveyBtn.style.display = 'none';
                nextBtn.style.display = 'inline-block';
            }
        } else if (submitSurveyBtn) { // Fallback if only submit button exists
            submitSurveyBtn.style.display = (currentStep === totalSteps - 1) ? 'inline-block' : 'none';
        } else if (nextBtn) { // Fallback if only next button exists
            nextBtn.style.display = (currentStep === totalSteps - 1) ? 'none' : 'inline-block';
        }
    }

    function isGibberish(text) {
        const lowerText = text.toLowerCase();

        // Rule 1: More than 4 consecutive identical characters (e.g., "aaaaa")
        if (/(.)\1{4,}/.test(lowerText)) {
            return true;
        }

        // Rule 2: Repeating 2-character patterns 2 or more times (e.g., "ababab", "jkjkjk")
        if (/(.{2})\1{2,}/.test(lowerText)) {
            return true;
        }

        // Rule 3: Repeating 3-character patterns 1 or more times (e.g., "abcabc", "defdef")
        if (/(.{3})\1{1,}/.test(lowerText)) {
            return true;
        }

        return false; // Not considered gibberish by these rules
    }

    function validateCurrentStep() {
        const currentStepElement = surveySteps[currentStep];
        const inputsToValidate = currentStepElement.querySelectorAll('input[required], select[required], textarea[required], input[type="text"], input[type="number"], textarea, #guestEmailInputFinal');
        let isValid = true;

        // Clear all previous error messages for the current step
        currentStepElement.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });

        inputsToValidate.forEach(input => {
            let fieldIsValid = true;
            let errorMessage = '';

            let errorMessageElement;
            if (input.type === 'text' || input.tagName === 'TEXTAREA' || input.id === 'guestEmailInputFinal') {
                const charCounter = input.nextElementSibling;
                if (charCounter && charCounter.classList.contains('character-counter')) {
                    errorMessageElement = charCounter.nextElementSibling;
                } else {
                    errorMessageElement = input.nextElementSibling;
                }
            } else {
                errorMessageElement = input.closest('.survey-question')?.querySelector('.error-message');
            }

            // Handle text inputs and textareas (required, minChars, and gibberish)
            if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                const minChars = parseInt(input.dataset.minChars || '5', 10); // Defaulting to 5 as per HTML
                const value = input.value.trim();

                if (value === '') {
                    fieldIsValid = false;
                    errorMessage = 'Questo campo è obbligatorio.';
                } else if (value.length < minChars) {
                    fieldIsValid = false;
                    errorMessage = `Minimo ${minChars} caratteri richiesti.`;
                } else if (isGibberish(value)) {
                    fieldIsValid = false;
                    errorMessage = 'La risposta sembra non essere genuina. Per favore, inserisci una risposta valida.';
                }
            }
            // Handle number inputs (required, minChars as string length for now)
            else if (input.type === 'number') {
                const minChars = parseInt(input.dataset.minChars || '1', 10);
                const value = input.value.trim();
                if (value === '') {
                    fieldIsValid = false;
                    errorMessage = 'Questo campo è obbligatorio.';
                } else if (value.length < minChars) {
                    fieldIsValid = false;
                    errorMessage = `Minimo ${minChars} cifre richieste.`;
                }
            }
            // Handle email input for guest final step
            else if (input.id === 'guestEmailInputFinal') {
                if (input.value.trim() === '') {
                    fieldIsValid = false;
                    errorMessage = 'La tua email è obbligatoria.';
                } else if (!/\S+@\S+\.\S+/.test(input.value.trim())) {
                    fieldIsValid = false;
                    errorMessage = 'Inserisci un\'email valida.';
                }
            }
            // Handle radio button groups
            else if (input.type === 'radio') {
                const name = input.name;
                const radioGroup = currentStepElement.querySelector(`input[name="${name}"]:checked`);
                if (!radioGroup) {
                    fieldIsValid = false;
                    errorMessage = 'Seleziona un\'opzione.';
                }
            }
            // Handle checkbox groups (using the hidden helper for 'required')
            else if (input.classList.contains('checkbox-group-required-helper')) {
                const relatedCheckboxes = currentStepElement.querySelectorAll(`input[name="${input.name.replace('_checkbox_required', '[]')}"]:checked`);
                if (relatedCheckboxes.length === 0) {
                    fieldIsValid = false;
                    errorMessage = 'Seleziona almeno un\'opzione.';
                }
            }

            if (!fieldIsValid) {
                isValid = false;
                if (errorMessageElement) {
                    errorMessageElement.textContent = errorMessage;
                    errorMessageElement.style.display = 'block';
                    input.classList.add('input-error');
                }
            } else {
                input.classList.remove('input-error');
            }
        });

        return isValid;
    }

    function showMessage(message, type = 'error') {
        messageOverlayText.textContent = message;
        messageOverlay.className = `${type} show`;
        messageOverlay.classList.add('show');
    }

    function hideMessage() {
        messageOverlay.classList.remove = ('show');
    }

    function collectSurveyAnswers() {
        const answers = {};
        // Only collect answers from actual question steps, not the final email step for guests
        const questionStepsCount = isGuest ? totalSteps - 1 : totalSteps;
        for (let i = 0; i < questionStepsCount; i++) {
            const stepElement = surveySteps[i];
            const inputs = stepElement.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                const questionIdMatch = input.name.match(/question_(\d+)/);
                if (questionIdMatch) {
                    const questionId = questionIdMatch[1];
                    if (input.type === 'checkbox') {
                        if (!answers[questionId]) {
                            answers[questionId] = [];
                        }
                        if (input.checked) {
                            answers[questionId].push(input.value);
                        }
                    } else if (input.type === 'radio') {
                        if (input.checked) {
                            answers[questionId] = input.value;
                        }
                    } else if (input.classList.contains('checkbox-group-required-helper')) {
                        return; // Skip the hidden helper input
                    } else {
                        answers[questionId] = input.value;
                    }
                }
            });
        }
        return answers;
    }

    async function submitSurvey() {
        hideMessage();
        if (!validateCurrentStep()) {
            showMessage('Per favore, completa correttamente tutti i campi.');
            return;
        }

        const answers = collectSurveyAnswers();
        const guestEmail = isGuest ? document.getElementById('guestEmailInputFinal').value.trim() : null;

        if (isGuest && !guestEmail) {
            showMessage('Per favore, inserisci la tua email per ricevere il QR.');
            return;
        }

        try {
            const response = await fetch('backend/completeChallenge.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    promo_id: promoId,
                    challenge_id: challengeId,
                    challenge_type: 'survey',
                    answers: answers,
                    guest_email: guestEmail // Pass guest email to backend for storage
                })
            });

            const result = await response.json();

            if (result.success) {
                if (result.redemption_token) {
                    // Redirect to confirmation page
                    const redirectUrl = `promoUnlockedConfirmation.php?id=${promoId}&tkn=${result.redemption_token}`;
                    window.location.href = redirectUrl;
                } else {
                    // Fallback if redemption_token is missing (should not happen with updated backend)
                    showMessage('Sondaggio completato! Nessun token di redenzione ricevuto per la reindirizzamento. Per favore, ricarica la pagina o contatta il supporto.', 'success');
                }
            } else {
                showMessage(result.message || 'Errore durante il completamento del sondaggio.');
            }
        } catch (error) {
            console.error('Error submitting survey:', error);
            showMessage('Si è verificato un errore di rete.');
        }
    }

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        hideMessage();
        showStep(currentStep - 1);
    });

    nextBtn.addEventListener('click', () => {
        hideMessage();
        if (validateCurrentStep()) {
            if (currentStep < surveyTabs.length) {
                surveyTabs[currentStep].classList.add('completed');
            }
            showStep(currentStep + 1);
        } else {
            showMessage('Per favore, completa correttamente tutti i campi in questo passaggio.');
        }
    });

    if (submitSurveyBtn) {
        submitSurveyBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default form submission
            submitSurvey();
        });
    }

    // Handle rating stars
    surveySteps.forEach(stepElement => {
        const ratingInputs = stepElement.querySelectorAll('.rating-input');
        ratingInputs.forEach(ratingInputDiv => {
            const stars = ratingInputDiv.querySelectorAll('.rating-star');
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const value = parseInt(this.dataset.value);
                    const questionId = ratingInputDiv.dataset.questionId;
                    const radioInput = ratingInputDiv.querySelector(`input[name="question_${questionId}"][value="${value}"]`);

                    stars.forEach(s => {
                        if (parseInt(s.dataset.value) <= value) {
                            s.classList.add('selected');
                        } else {
                            s.classList.remove('selected');
                        }
                    });
                    if (radioInput) {
                        radioInput.checked = true;
                        const changeEvent = new Event('change');
                        radioInput.dispatchEvent(changeEvent);
                    }
                });
            });
        });
    });

    // Tab click navigation
    surveyTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const stepIndex = parseInt(this.dataset.step);
            if (stepIndex < currentStep) {
                showStep(stepIndex);
            } else if (stepIndex === currentStep) {
                return;
            } else if (validateCurrentStep()) {
                if (currentStep < surveyTabs.length) {
                    surveyTabs[currentStep].classList.add('completed');
                }
                showStep(stepIndex);
            } else {
                showMessage('Per favore, completa correttamente tutti i campi in questo passaggio prima di procedere.');
            }
        });
    });

    // Special handling for already unlocked promo (if guest) - using showMessage instead of alert
    const sendUnlockedQrByEmailButton = document.getElementById('sendUnlockedQrByEmailButton');
    if (sendUnlockedQrByEmailButton) {
        sendUnlockedQrByEmailButton.addEventListener('click', async () => {
            const emailInput = document.getElementById('unlockedGuestEmailInput');
            const guestEmail = emailInput.value.trim();

            if (!guestEmail) {
                showMessage('Per favore, inserisci la tua email.');
                return;
            }
            if (!/\S+@\S+\.\S+/.test(guestEmail)) {
                showMessage('Per favore, inserisci un\'email valida.');
                return;
            }

            try {
                // Assuming promoId is available in this scope (it should be, from surveyForm.dataset.promoId)
                const response = await fetch('api/send_qr_email.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        promo_id: promoId, // Make sure promoId is available here or passed from PHP
                        guest_email: guestEmail
                    })
                });
                const result = await response.json();
                if (result.success) {
                    showMessage('Il QR della promozione è stato inviato alla tua email!', 'success');
                    // emailInput.value = ''; // Optionally clear email input after sending
                } else {
                    showMessage(result.message || 'Errore durante l\'invio del QR.');
                }
            } catch (error) {
                console.error('Error sending QR:', error);
                showMessage('Si è verificato un errore di rete durante l\'invio del QR.');
            }
        });
    }

    // Character Counter Logic
    function updateCharacterCounter(inputElement) {
        const counterElement = inputElement.nextElementSibling;
        if (counterElement && counterElement.classList.contains('character-counter')) {
            const currentLength = inputElement.value.length;
            // Use data-min-chars directly from the input element, default to 0 if not present
            const minChars = parseInt(inputElement.dataset.minChars || '0', 10);

            counterElement.textContent = `${currentLength}/${minChars}`;

            if (currentLength < minChars) {
                counterElement.style.color = '#ef4444'; // Red if less than min
            } else {
                counterElement.style.color = '#6b7280'; // Default gray
            }
        }
    }

    surveySteps.forEach(stepElement => {
        const textAndTextareaInputs = stepElement.querySelectorAll('input[type="text"], textarea');
        textAndTextareaInputs.forEach(input => {
            if (input.nextElementSibling && input.nextElementSibling.classList.contains('character-counter')) {
                updateCharacterCounter(input); // Set initial count
                input.addEventListener('input', () => updateCharacterCounter(input));
            }
        });
    });

    // Initial display - only show steps if there are questions or an email step for guests
    if (surveyStepsContainer && totalSteps > 0) {
        showStep(0);
    } else if (surveyStepsContainer) { // If container exists but no steps (e.g., promo unlocked already or no questions)
        surveyStepsContainer.style.display = 'block';
        console.warn("Survey container exists but no steps to manage or promo already unlocked.");
    } else {
        console.error("Survey steps container (ID: surveySteps) not found in DOM. Cannot initialize survey steps.");
    }
});
