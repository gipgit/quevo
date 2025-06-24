 
  document.addEventListener('DOMContentLoaded', () => {

        // Function to calculate the perceived luminance of an RGB color. Based on WCAG 2.0 formula: L = 0.2126 * R_srgb + 0.7152 * G_srgb + 0.0722 * B_srgb
        function getLuminance(r, g, b) {
            const a = [r, g, b].map(v => {
                v /= 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
        }

     
        function isColorLight(colorString) {
            const dummy = document.createElement('div');
            dummy.style.color = colorString;
            document.body.appendChild(dummy);
            const computedColor = getComputedStyle(dummy).color;
            dummy.remove();

            const rgbaMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
            if (rgbaMatch) {
                const r = parseInt(rgbaMatch[1]);
                const g = parseInt(rgbaMatch[2]);
                const b = parseInt(rgbaMatch[3]);
                const alpha = parseFloat(rgbaMatch[4] || 1);
                if (alpha < 0.1) { }

                const luminance = getLuminance(r, g, b);
                return luminance > 0.5; 
            }

            console.warn("Could not parse body background color:", colorString);
            return true;
        }

    
        function setBodyBackgroundClass() {
            const body = document.body;
            const computedStyle = getComputedStyle(body);
            const bodyBackgroundColor = computedStyle.backgroundColor;

            if (isColorLight(bodyBackgroundColor)) {
                body.classList.add('body--light-bg');
                body.classList.remove('body--dark-bg');
            } else {
                body.classList.add('body--dark-bg');
                body.classList.remove('body--light-bg');
            }
        }

        const topbarBusiness = document.getElementById('topbar-club');
        const containerProfilePic = document.getElementById('container-profile-pic');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScrollY && window.scrollY > 50) {
                topbarBusiness.classList.add('topbar-visible');
                containerProfilePic.classList.remove('pic-lg');
                containerProfilePic.classList.add('pic-md');
            } else if (window.scrollY < lastScrollY || window.scrollY <= 50) {
                topbarBusiness.classList.remove('topbar-visible');
                containerProfilePic.classList.remove('pic-md');
                containerProfilePic.classList.add('pic-lg');
            }
            lastScrollY = window.scrollY;
        });

        setBodyBackgroundClass();
    });


    
        const contactModalOverlay = document.getElementById('contactModalOverlay');
       
        function toggleContactModal(type = null) {
            if (contactModalOverlay.classList.contains('active')) {
                contactModalOverlay.classList.remove('active');
                phoneSection.classList.remove('active');
                emailSection.classList.remove('active');
                return; 
            }

            if (type !== null) {
                contactModalOverlay.classList.add('active');
            }
        }


        function copyEmailToClipboard() {
            const emailElement = document.getElementById('modalEmailAddress');
            if (emailElement) {
                const emailAddress = emailElement.textContent.trim();
                navigator.clipboard.writeText(emailAddress)
                    .then(() => {
                        alert('Indirizzo email copiato!'); 
                    })
                    .catch(err => {
                        console.error('Errore durante la copia dell\'email: ', err);
                        alert('Impossibile copiare l\'indirizzo email. Per favore, copialo manualmente.'); 
                    });
            }
        }


        const paymentsModalOverlay = document.getElementById('paymentsModalOverlay');
       
        function togglePaymentsModal() {
            if (paymentsModalOverlay.classList.contains('active')) {
                paymentsModalOverlay.classList.remove('active');
                return; 
            }
            else{
                paymentsModalOverlay.classList.add('active');
            }
        }



var profileMenuOverlayContainer = document.getElementById('profile-menu-overlay-container');

    function openOverlayMenuProfile() {
      profileMenuOverlayContainer.classList.add('show');
      document.body.classList.add('no-scroll');
    }
    
    function closeOverlayMenuProfile() {
      profileMenuOverlayContainer.classList.remove('show');
      document.body.classList.remove('no-scroll');
    }


    window.onclick = function(event) {  if (event.target == profileMenuOverlayContainer) { profileMenuOverlayContainer.classList.remove('show'); document.body.classList.remove('no-scroll'); }}



var profileOverlayQR = document.getElementById('overlayQR');

    function openOverlayQR() {
      
      profileOverlayQR.classList.add('show');
      document.body.classList.add('no-scroll');
    }
    
    function closeOverlayQR() {
      profileOverlayQR.classList.remove('show');
      document.body.classList.remove('no-scroll');
    }


    window.onclick = function(event) {  if (event.target == profileOverlayQR) { profileOverlayQR.classList.remove('show'); document.body.classList.remove('no-scroll'); }}