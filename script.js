// Wait for the DOM to be fully loaded before running the script
// English: Technical documentation
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    // IMPORTANT: Set your event dates here.
    // The format is 'YYYY-MM-DDTHH:MM:SS'
    const EVENT_START_TIME = new Date('2025-06-07T09:45:00');
    const EVENT_END_TIME = new Date('2025-06-08T01:00:00');

    // --- DOM ELEMENT REFERENCES ---
    const phases = {
        preEvent: document.getElementById('phase-pre-event'),
        duringEvent: document.getElementById('phase-during-event'),
        postEvent: document.getElementById('phase-post-event')
    };

    const countdownElements = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };
    
    // For Phase 2 interactive elements
    const interactiveButtons = document.querySelectorAll('.interactive-button');
    const survivalProgressBar = document.getElementById('survival-progress');

    // Interval timers
    let countdownInterval;
    let phaseCheckInterval;

    // --- CORE LOGIC ---

    /**
     * Checks the current time and displays the appropriate phase.
     */
    function updatePagePhase() {
        const now = new Date();

        if (now < EVENT_START_TIME) {
            // Pre-event phase
            showPhase('preEvent');
            if (!countdownInterval) { // Start countdown only if it's not already running
                startCountdown();
            }
        } else if (now >= EVENT_START_TIME && now < EVENT_END_TIME) {
            // During-event phase
            showPhase('duringEvent');
            if (countdownInterval) clearInterval(countdownInterval); // Stop countdown if running
            updateSurvivalProgress();
        } else {
            // Post-event phase
            showPhase('postEvent');
            if (countdownInterval) clearInterval(countdownInterval);
        }
    }

    /**
     * Hides all phases and shows the one with the specified key.
     * @param {string} activePhaseKey - The key from the `phases` object ('preEvent', 'duringEvent', 'postEvent').
     */
    function showPhase(activePhaseKey) {
        // Hide all phases first
        Object.values(phases).forEach(phase => phase.classList.remove('active'));
        // Show the active one
        if (phases[activePhaseKey]) {
            phases[activePhaseKey].classList.add('active');
        }
    }

    /**
     * Starts the countdown timer and updates the DOM every second.
     */
    function startCountdown() {
        countdownInterval = setInterval(() => {
            const now = new Date();
            const distance = EVENT_START_TIME - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                updatePagePhase(); // Time's up, switch phase immediately
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Update UI elements - Lietuviškai: Atnaujiname skaičiuoklės elementus
            countdownElements.days.textContent = String(days).padStart(2, '0');
            countdownElements.hours.textContent = String(hours).padStart(2, '0');
            countdownElements.minutes.textContent = String(minutes).padStart(2, '0');
            countdownElements.seconds.textContent = String(seconds).padStart(2, '0');

        }, 1000);
    }

    /**
     * Updates the survival progress bar based on the time elapsed during the event.
     */
    function updateSurvivalProgress() {
        const now = new Date();
        const totalDuration = EVENT_END_TIME - EVENT_START_TIME;
        const elapsedDuration = now - EVENT_START_TIME;
        
        let progress = (elapsedDuration / totalDuration) * 100;
        if (progress < 10) progress = 10; // Start with a bit of progress
        if (progress > 100) progress = 100;

        if (survivalProgressBar) {
            survivalProgressBar.value = progress;
        }
    }


    // --- EVENT LISTENERS ---

    /**
     * Adds click listeners to all interactive buttons in Phase 2.
     */
    interactiveButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.classList.toggle('visible');
            }
        });
    });

    // --- INITIALIZATION ---

    // Run the phase check immediately on page load
    updatePagePhase();

    // Set an interval to check for phase changes every minute
    // This ensures the page automatically switches if left open
    phaseCheckInterval = setInterval(updatePagePhase, 60000); 

});