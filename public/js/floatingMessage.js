let floatingMessage;
let floatingMessageText;
let floatingMessageCloseButton;
let messageTimeout; // Declare messageTimeout globally or in a scope accessible by both functions

// Function to create the floating message elements
function createFloatingMessageElements() {
    floatingMessage = document.createElement('div');
    floatingMessage.id = 'floatingMessage';
    floatingMessage.classList.add('floating-message');
    document.body.appendChild(floatingMessage); // Append to the body or a specific container

    floatingMessageText = document.createElement('span');
    floatingMessageText.id = 'floatingMessageText';
    floatingMessage.appendChild(floatingMessageText);

    floatingMessageCloseButton = document.createElement('button');
    floatingMessageCloseButton.id = 'floatingMessageClose';
    floatingMessageCloseButton.classList.add('floating-message-close');
    floatingMessageCloseButton.innerHTML = '&times;';
    floatingMessage.appendChild(floatingMessageCloseButton);

    // Add event listener after the button is created
    floatingMessageCloseButton.addEventListener('click', hideFloatingMessage);
}

// Call this function once to create the elements when your script loads
createFloatingMessageElements();

// Function to show the floating message
function showFloatingMessage(message, type) {
    // Clear any existing timeout to prevent multiple messages overlapping
    clearTimeout(messageTimeout); 

    // Reset classes for a fresh display
    floatingMessage.className = 'floating-message'; // Reset to base class
    floatingMessage.style.display = 'flex'; // Ensure it's visible if it was hidden

    floatingMessageText.textContent = message;
    floatingMessage.classList.add('show');

    if (type === 'success') {
        floatingMessage.classList.add('success');
    } else if (type === 'error') {
        floatingMessage.classList.add('error');
    }

    messageTimeout = setTimeout(() => {
        floatingMessage.classList.remove('show');
        floatingMessage.classList.add('hide');
        setTimeout(() => {
            floatingMessage.style.display = 'none';
            // Clean up type classes after hiding
            floatingMessage.classList.remove('success', 'error', 'hide'); 
        }, 500); // Match CSS transition duration
    }, 10000);
}

// Function to hide the floating message
function hideFloatingMessage() {
    clearTimeout(messageTimeout); // Clear the auto-hide timeout if manually closing
    floatingMessage.classList.remove('show');
    floatingMessage.classList.add('hide'); // Add hide class for transition

    setTimeout(() => {
        floatingMessage.style.display = 'none';
        floatingMessage.className = 'floating-message'; // Reset classes
        floatingMessageText.textContent = ''; // Clear text
    }, 500); // Match transition duration
}