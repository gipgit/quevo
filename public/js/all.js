// ----- Set body margin-top to header height
function setMarginFromHeader() {
    const header = document.getElementById('navsite');
    if (header) {
        const headerHeight = header.offsetHeight;
        const additionalMargin = 20;
        const marginValue = headerHeight + additionalMargin;
        document.body.style.marginTop = `${marginValue}px`;
    } else {
        console.warn('Header element with ID "navsite" not found.');
    }
}

// ----- Disable past dates for subscription event
function disableSubscriptionPastDates() {
    const subscriptionEventDateInput = document.getElementById('subscription-event-date');
    if (subscriptionEventDateInput) { // Check if element exists
        const today = new Date().toISOString().split('T')[0];
        subscriptionEventDateInput.setAttribute('min', today);
    } else {
        console.warn('Element with ID "subscription-event-date" not found.');
    }
}

// ----- Convert first letter of text inputs to uppercase on keyup
function capitalizeFirstLetterOfTextInputs() {
    const textInputs = document.querySelectorAll('input[type=text]');
    textInputs.forEach(input => {
        input.addEventListener('keyup', function() {
            if (this.value.length > 0 && this.value[0] !== this.value[0].toUpperCase()) { // Added length check
                this.value = this.value[0].toUpperCase() + this.value.substring(1);
            }
        });
    });
}

// ----- Set default value for 'data inizio'
function setDefaultInizioDate() {
    const inizioInput = document.getElementById('form-inizio');
    if (inizioInput) { // Check if element exists
        inizioInput.valueAsDate = new Date();
    } else {
        console.warn('Element with ID "form-inizio" not found.');
    }
}

document.addEventListener('DOMContentLoaded', function() {


    // ----- Add 'scroll' class to nav on scroll
    window.addEventListener('scroll', function() {
        const nav = document.getElementById('navsite');
        if (nav) {
            const top = 50;
            if (window.scrollY >= top) {
                nav.classList.add('scroll');
            } else {
                nav.classList.remove('scroll');
            }
        }
    });

    // ----- SIDENAV functions
    function openNav() {
        document.getElementById("sidenav").classList.add("opened");
        document.getElementById("sidenav").classList.remove("closed");
        document.getElementById("main").classList.add("sidenav-opened");
        document.getElementById("main").classList.remove("sidenav-closed");
    }

    function closeNav() {
        document.getElementById("sidenav").classList.remove("opened");
        document.getElementById("sidenav").classList.add("closed");
        document.getElementById("main").classList.remove("sidenav-opened");
        document.getElementById("main").classList.add("sidenav-closed");
    }



    function changeFollow(email, idclub, followstatus) {
        // Simulate AJAX call with a Promise
        changeFollowStatus(email, idclub, followstatus)
            .then(response => {
                const buttonFollow = document.getElementById("button-follow");
                if (buttonFollow) { // Check if element exists
                    if (response == 1) {
                        buttonFollow.innerHTML = "&#10003; Following";
                    } else if (response == 0) {
                        buttonFollow.innerHTML = "Follow";
                    }
                    buttonFollow.setAttribute("onclick", `changeFollow('${email}', '${idclub}', ${response})`);
                }
            })
            .catch(error => {
                console.error("Error changing follow status:", error);
            });
    }

    function changeFollowStatus(email, idclub, followstatus) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const simulatedResponse = followstatus === 0 ? 1 : 0;
                resolve(simulatedResponse);
            }, 500);
        });
    }

    function changeBusinessPass(email, idclub, cpstatus) {
        // Simulate AJAX call with a Promise
        changeBusinessPassStatus(email, idclub, cpstatus)
            .then(response => {
                const buttonBusinesspass = document.getElementById("button-clubpass");
                if (buttonBusinesspass) { // Check if element exists
                    if (response == 1) {
                        buttonBusinesspass.innerHTML = "&#10003; Incluso in BusinessPass";
                    } else if (response == 0) {
                        buttonBusinesspass.innerHTML = "Includi in BusinessPass";
                    }
                    buttonBusinesspass.setAttribute("onclick", `changeBusinessPass('${email}', '${idclub}', ${response})`);
                }
            })
            .catch(error => {
                console.error("Error changing clubpass status:", error);
            });
    }

    function changeBusinessPassStatus(email, idclub, cpstatus) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const simulatedResponse = cpstatus === 0 ? 1 : 0;
                resolve(simulatedResponse);
            }, 500);
        });
    }


    window.changeFollow = changeFollow;
    window.changeBusinessPass = changeBusinessPass;

}); 