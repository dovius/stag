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
            stopBobrTimer(); // No bobr in pre-event
        } else if (now >= EVENT_START_TIME && now < EVENT_END_TIME) {
            // During-event phase
            showPhase('duringEvent');
            if (countdownInterval) clearInterval(countdownInterval); // Stop countdown if running
            updateSurvivalProgress();
            stopBobrTimer(); // No bobr during event
        } else {
            // Post-event phase
            showPhase('postEvent');
            if (countdownInterval) clearInterval(countdownInterval);
            startBobrTimer(); // Start bobr shenanigans! 🦫
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

    // --- COMMENTS FUNCTIONALITY ---

    /**
     * Loads and displays all comments from the server
     */
    async function loadComments() {
        try {
            const response = await fetch('/api/comments');
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    /**
     * Displays comments in the comments list
     */
    function displayComments(comments) {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;

        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">Būkite pirmi palinkėti!</p>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <strong class="comment-author">${escapeHtml(comment.name)}</strong>
                    <span class="comment-date">${formatDate(comment.created_at)}</span>
                </div>
                <div class="comment-message">${escapeHtml(comment.message)}</div>
            </div>
        `).join('');
    }

    /**
     * Formats a date string for display
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        // Add 3 hours to compensate for timezone difference
        date.setHours(date.getHours() + 3);
        return date.toLocaleDateString('lt-LT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Escapes HTML to prevent XSS attacks
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Handles comment form submission
     */
    async function handleCommentSubmission(event) {
        event.preventDefault();
        
        const nameInput = document.getElementById('comment-name');
        const messageInput = document.getElementById('comment-message');
        const submitButton = event.target.querySelector('button[type="submit"]');
        
        const name = nameInput.value.trim() || 'Anonimas';
        const message = messageInput.value.trim();
        
        if (!message) {
            alert('Prašome įrašyti palinkėjimą!');
            return;
        }

        // Disable submit button during submission
        submitButton.disabled = true;
        submitButton.textContent = 'SIUNČIAMA...';

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, message }),
            });

            if (response.ok) {
                // Clear form
                nameInput.value = '';
                messageInput.value = '';
                
                // Reload comments
                await loadComments();
            } else {
                throw new Error('Failed to submit comment');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Klaida siunčiant palinkėjimą. Bandykite dar kartą.');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'SIŲSTI';
        }
    }

    // --- COMMENT EVENT LISTENERS ---

    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmission);
    }

    // Load comments when page loads (only if in post-event phase)
    if (phases.postEvent) {
        // Check if we're in post-event phase and load comments
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' && 
                    mutation.target === phases.postEvent &&
                    phases.postEvent.classList.contains('active')) {
                    loadComments();
                }
            });
        });
        
        observer.observe(phases.postEvent, { attributes: true });
        
        // Also load comments if already in post-event phase
        if (phases.postEvent.classList.contains('active')) {
            loadComments();
        }
    }

    // --- IMAGE GALLERY FUNCTIONALITY ---

    let galleryImages = [];
    let currentImageIndex = 0;
    let isLightboxOpen = false;

    // DOM elements for lightbox
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCurrent = document.getElementById('lightbox-current');
    const lightboxTotal = document.getElementById('lightbox-total');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');
    const openGalleryBtn = document.getElementById('open-gallery');
    const imageGrid = document.getElementById('image-grid');

    /**
     * Loads images from the server - Returns Promise
     */
    async function loadGalleryImages() {
        try {
            const response = await fetch('/api/images');
            const images = await response.json();
            galleryImages = images;
            return images;
        } catch (error) {
            console.error('Error loading gallery images:', error);
            // Fallback to existing images if API fails
            galleryImages = getExistingImages();
            return galleryImages;
        }
    }

    /**
     * Gets existing images from current HTML (fallback)
     */
    function getExistingImages() {
        const existingImages = [];
        const imageItems = document.querySelectorAll('.image-item img');
        imageItems.forEach((img, index) => {
            existingImages.push({
                src: img.src,
                alt: img.alt || `Bernvakario akimirka ${index + 1}`,
                filename: img.src.split('/').pop()
            });
        });
        return existingImages;
    }

    /**
     * Initializes the image grid - loads data and attaches listeners
     */
    function initializeImageGrid() {
        if (!imageGrid) return;

        // Load gallery data asynchronously
        if (galleryImages.length === 0) {
            loadGalleryImages().then(() => {
                // Update gallery info and attach listeners
                updateGalleryInfo();
                attachImageEventListeners();
            }).catch(error => {
                console.error('Failed to load gallery:', error);
            });
        } else {
            // Data already loaded, just attach listeners
            updateGalleryInfo();
            attachImageEventListeners();
        }
    }

    // Function removed - HTML now contains pre-rendered thumbnails

    /**
     * Updates gallery information with total image count
     */
    function updateGalleryInfo() {
        const gallerySection = document.querySelector('.gallery-section p');
        if (gallerySection && galleryImages.length > 0) {
            gallerySection.textContent = `Geriausi akimirkų kadrai iš misijos! (${galleryImages.length} nuotraukų)`;
        }
    }

    /**
     * Attaches event listeners to image items
     */
    function attachImageEventListeners() {
        // Remove old listeners first by getting fresh elements
        const imageItems = document.querySelectorAll('#image-grid .image-item');
        imageItems.forEach((item) => {
            // Get the actual gallery index from data-index attribute
            const galleryIndex = parseInt(item.dataset.index);
            
            // Remove old listeners by cloning element
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            // Add fresh listeners
            newItem.addEventListener('click', () => {
                console.log('Clicking image index:', galleryIndex);
                openLightbox(galleryIndex);
            });
            
            newItem.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openLightbox(galleryIndex);
                }
            });
        });
    }

    /**
     * Opens the lightbox modal with specified image index
     */
    function openLightbox(index = 0) {
        currentImageIndex = index;
        isLightboxOpen = true;
        
        // Update total count - ALL images, not just preview
        if (lightboxTotal) {
            lightboxTotal.textContent = galleryImages.length;
        }
        
        // Show modal
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        
        // Update image
        updateLightboxImage();
        
        // Focus management
        lightboxClose.focus();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Add keyboard listeners
        document.addEventListener('keydown', handleLightboxKeydown);
        
        // PLAY BOBR SONG! 🎵
        if (musicPlayer && musicPlayer.paused) {
            playMusic();
        }
    }

    /**
     * Closes the lightbox modal
     */
    function closeLightbox() {
        isLightboxOpen = false;
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove keyboard listeners
        document.removeEventListener('keydown', handleLightboxKeydown);
        
        // Return focus to gallery button
        if (openGalleryBtn) {
            openGalleryBtn.focus();
        }
    }

    /**
     * Updates the displayed image in lightbox
     */
    function updateLightboxImage() {
        if (!galleryImages[currentImageIndex]) return;
        
        const image = galleryImages[currentImageIndex];
        const loader = document.getElementById('lightbox-loader');
        
        // Show loader, hide image
        if (loader) {
            loader.classList.remove('hidden');
        }
        if (lightboxImage) {
            lightboxImage.style.opacity = '0';
        }
        
        // Disable navigation during loading
        if (lightboxPrev) lightboxPrev.disabled = true;
        if (lightboxNext) lightboxNext.disabled = true;
        
        // Create new image to preload
        const newImage = new Image();
        newImage.onload = function() {
            // Image loaded successfully
            if (lightboxImage) {
                lightboxImage.src = image.src;
                lightboxImage.alt = image.alt;
                lightboxImage.style.opacity = '1';
            }
            
            // Hide loader
            if (loader) {
                loader.classList.add('hidden');
            }
            
            // Re-enable navigation
            if (lightboxPrev) {
                lightboxPrev.disabled = currentImageIndex === 0;
            }
            if (lightboxNext) {
                lightboxNext.disabled = currentImageIndex === galleryImages.length - 1;
            }
        };
        
        newImage.onerror = function() {
            // Error loading image
            console.error('Error loading image:', image.src);
            if (loader) {
                loader.innerHTML = '<div class="loader-spinner"></div><p>Klaida kraunant nuotrauką</p>';
            }
            
            // Re-enable navigation
            if (lightboxPrev) {
                lightboxPrev.disabled = currentImageIndex === 0;
            }
            if (lightboxNext) {
                lightboxNext.disabled = currentImageIndex === galleryImages.length - 1;
            }
        };
        
        // Start loading
        newImage.src = image.src;
        
        // Update counter immediately
        if (lightboxCurrent) {
            lightboxCurrent.textContent = currentImageIndex + 1;
        }
    }

    /**
     * Navigates to previous image
     */
    function showPreviousImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateLightboxImage();
        }
    }

    /**
     * Navigates to next image
     */
    function showNextImage() {
        if (currentImageIndex < galleryImages.length - 1) {
            currentImageIndex++;
            updateLightboxImage();
        }
    }

    /**
     * Handles keyboard navigation in lightbox
     */
    function handleLightboxKeydown(event) {
        if (!isLightboxOpen) return;
        
        switch (event.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                showPreviousImage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                showNextImage();
                break;
            case 'Tab':
                // Keep focus within modal
                const focusableElements = lightboxModal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
                break;
        }
    }

    // --- GALLERY EVENT LISTENERS ---

    // Open gallery button
    if (openGalleryBtn) {
        openGalleryBtn.addEventListener('click', () => openLightbox(0));
    }

    // Lightbox close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Lightbox backdrop
    if (lightboxBackdrop) {
        lightboxBackdrop.addEventListener('click', closeLightbox);
    }

    // Navigation buttons
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPreviousImage);
    }
    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNextImage);
    }

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightboxModal) {
        lightboxModal.addEventListener('touchstart', (event) => {
            touchStartX = event.changedTouches[0].screenX;
        });

        lightboxModal.addEventListener('touchend', (event) => {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                showNextImage();
            } else {
                // Swipe right - previous image
                showPreviousImage();
            }
        }
    }

    // --- MUSIC PLAYER FUNCTIONALITY ---

    const musicButton = document.getElementById('music-button');
    const musicPlayer = document.getElementById('music-player');
    const musicIcon = document.getElementById('music-icon');
    const musicText = document.getElementById('music-text');

    let isPlaying = false;

    /**
     * Toggles music play/pause
     */
    function toggleMusic() {
        if (!musicPlayer) return;

        // Prevent rapid clicking
        if (musicButton) {
            musicButton.disabled = true;
            setTimeout(() => {
                if (musicButton) musicButton.disabled = false;
            }, 500);
        }

        if (musicPlayer.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    }

    /**
     * Plays the music
     */
    function playMusic() {
        if (!musicPlayer) return;

        // Reset any previous state
        musicPlayer.currentTime = 0;
        
        // Add a small delay to ensure audio is ready
        setTimeout(() => {
            const playPromise = musicPlayer.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Audio started playing successfully');
                }).catch(error => {
                    console.error('Error playing audio:', error);
                    console.log('Audio file source:', musicPlayer.currentSrc);
                    console.log('Audio readyState:', musicPlayer.readyState);
                    console.log('Audio paused:', musicPlayer.paused);
                    
                    // Reset button state
                    isPlaying = false;
                    updateMusicButton();
                    
                    // More specific error handling
                    if (error.name === 'AbortError') {
                        console.log('Play was aborted - trying again');
                        // Try again after a short delay
                        setTimeout(() => {
                            if (musicPlayer.paused) {
                                musicPlayer.play();
                            }
                        }, 100);
                    } else if (error.name === 'NotSupportedError') {
                        alert('Audio failas nepalaikomas. Patikrinkite ar bobr.mp3 yra tinkamo formato.');
                    } else if (error.name === 'NotAllowedError') {
                        alert('Naršyklė neleidžia automatiškai groti audio. Bandykite dar kartą.');
                    } else {
                        alert('Nepavyko paleisti muzikos: ' + error.message);
                    }
                });
            }
        }, 50);
    }

    /**
     * Pauses the music
     */
    function pauseMusic() {
        if (!musicPlayer) return;

        musicPlayer.pause();
        updateMusicButton();
    }

    /**
     * Updates the music button appearance
     */
    function updateMusicButton() {
        if (!musicButton || !musicIcon || !musicText || !musicPlayer) return;

        if (!musicPlayer.paused) {
            musicButton.classList.add('playing');
            musicIcon.textContent = '⏸️';
            musicText.textContent = 'PAUSE';
        } else {
            musicButton.classList.remove('playing');
            musicIcon.textContent = '▶️';
            musicText.textContent = 'PLAY';
        }
    }

    // --- MUSIC EVENT LISTENERS ---

    if (musicButton) {
        musicButton.addEventListener('click', toggleMusic);
    }

    if (musicPlayer) {
        // Update button when music ends (music will auto-loop due to HTML loop attribute)
        musicPlayer.addEventListener('ended', () => {
            updateMusicButton();
        });

        // Handle loading errors
        musicPlayer.addEventListener('error', (e) => {
            console.error('Audio loading error:', e);
            console.log('Error details:', musicPlayer.error);
            console.log('Audio source:', musicPlayer.currentSrc || musicPlayer.src);
            musicButton.style.opacity = '0.5';
            musicText.textContent = 'ERROR';
            
            // More detailed error messages
            if (musicPlayer.error) {
                switch(musicPlayer.error.code) {
                    case musicPlayer.error.MEDIA_ERR_ABORTED:
                        console.log('Audio loading aborted');
                        break;
                    case musicPlayer.error.MEDIA_ERR_NETWORK:
                        console.log('Network error loading audio');
                        break;
                    case musicPlayer.error.MEDIA_ERR_DECODE:
                        console.log('Audio decoding error');
                        break;
                    case musicPlayer.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        console.log('Audio format not supported');
                        break;
                }
            }
        });

        // Update when music starts playing
        musicPlayer.addEventListener('play', () => {
            updateMusicButton();
        });

        // Update when music pauses
        musicPlayer.addEventListener('pause', () => {
            updateMusicButton();
        });
    }

    // --- PRO GALLERY FUNCTIONALITY ---

    let proGalleryImages = [];
    let currentProImageIndex = 0;
    let isProLightboxOpen = false;

    // DOM elements for PRO lightbox
    const proLightboxModal = document.getElementById('pro-lightbox-modal');
    const proLightboxImage = document.getElementById('pro-lightbox-image');
    const proLightboxCurrent = document.getElementById('pro-lightbox-current');
    const proLightboxTotal = document.getElementById('pro-lightbox-total');
    const proLightboxClose = document.getElementById('pro-lightbox-close');
    const proLightboxPrev = document.getElementById('pro-lightbox-prev');
    const proLightboxNext = document.getElementById('pro-lightbox-next');
    const proLightboxBackdrop = document.getElementById('pro-lightbox-backdrop');
    const openProGalleryBtn = document.getElementById('open-pro-gallery');
    const proImageGrid = document.getElementById('pro-image-grid');

    /**
     * Loads PRO images from the server - Returns Promise
     */
    async function loadProGalleryImages() {
        try {
            const response = await fetch('/api/pro-images');
            const images = await response.json();
            proGalleryImages = images;
            return images;
        } catch (error) {
            console.error('Error loading PRO gallery images:', error);
            proGalleryImages = [];
            return [];
        }
    }

    /**
     * Initializes the PRO image grid - loads data and attaches listeners
     */
    function initializeProImageGrid() {
        if (!proImageGrid) return;

        // Load PRO gallery data asynchronously
        if (proGalleryImages.length === 0) {
            loadProGalleryImages().then(() => {
                // Update gallery info and attach listeners
                updateProGalleryInfo();
                attachProImageEventListeners();
            }).catch(error => {
                console.error('Failed to load PRO gallery:', error);
            });
        } else {
            // Data already loaded, just attach listeners
            updateProGalleryInfo();
            attachProImageEventListeners();
        }
    }

    // Function removed - HTML now contains pre-rendered thumbnails

    /**
     * Updates PRO gallery information with total image count
     */
    function updateProGalleryInfo() {
        const proGallerySection = document.querySelector('.pro-gallery p');
        if (proGallerySection && proGalleryImages.length > 0) {
            proGallerySection.textContent = `Profesionalaus fotografo darbai! (${proGalleryImages.length} nuotraukų)`;
        }
    }

    /**
     * Attaches event listeners to PRO image items
     */
    function attachProImageEventListeners() {
        const proImageItems = document.querySelectorAll('#pro-image-grid .image-item');
        proImageItems.forEach((item) => {
            const galleryIndex = parseInt(item.dataset.index);
            
            // Remove old listeners by cloning element
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            // Add fresh listeners
            newItem.addEventListener('click', () => {
                console.log('Clicking PRO image index:', galleryIndex);
                openProLightbox(galleryIndex);
            });
            
            newItem.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openProLightbox(galleryIndex);
                }
            });
        });
    }

    /**
     * Opens the PRO lightbox modal
     */
    function openProLightbox(index = 0) {
        currentProImageIndex = index;
        isProLightboxOpen = true;
        
        if (proLightboxTotal) {
            proLightboxTotal.textContent = proGalleryImages.length;
        }
        
        proLightboxModal.classList.add('active');
        proLightboxModal.setAttribute('aria-hidden', 'false');
        
        updateProLightboxImage();
        
        proLightboxClose.focus();
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleProLightboxKeydown);
        
        // PLAY BOBR SONG! 🎵
        if (musicPlayer && musicPlayer.paused) {
            playMusic();
        }
    }

    /**
     * Closes the PRO lightbox modal
     */
    function closeProLightbox() {
        isProLightboxOpen = false;
        proLightboxModal.classList.remove('active');
        proLightboxModal.setAttribute('aria-hidden', 'true');
        
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleProLightboxKeydown);
        
        if (openProGalleryBtn) {
            openProGalleryBtn.focus();
        }
    }

    /**
     * Updates the displayed PRO image in lightbox
     */
    function updateProLightboxImage() {
        if (!proGalleryImages[currentProImageIndex]) return;
        
        const image = proGalleryImages[currentProImageIndex];
        const loader = document.getElementById('pro-lightbox-loader');
        
        if (loader) {
            loader.classList.remove('hidden');
        }
        if (proLightboxImage) {
            proLightboxImage.style.opacity = '0';
        }
        
        if (proLightboxPrev) proLightboxPrev.disabled = true;
        if (proLightboxNext) proLightboxNext.disabled = true;
        
        const newImage = new Image();
        newImage.onload = function() {
            if (proLightboxImage) {
                proLightboxImage.src = image.src;
                proLightboxImage.alt = image.alt;
                proLightboxImage.style.opacity = '1';
            }
            
            if (loader) {
                loader.classList.add('hidden');
            }
            
            if (proLightboxPrev) {
                proLightboxPrev.disabled = currentProImageIndex === 0;
            }
            if (proLightboxNext) {
                proLightboxNext.disabled = currentProImageIndex === proGalleryImages.length - 1;
            }
        };
        
        newImage.onerror = function() {
            console.error('Error loading PRO image:', image.src);
            if (loader) {
                loader.innerHTML = '<div class="loader-spinner"></div><p>Klaida kraunant PRO nuotrauką</p>';
            }
            
            if (proLightboxPrev) {
                proLightboxPrev.disabled = currentProImageIndex === 0;
            }
            if (proLightboxNext) {
                proLightboxNext.disabled = currentProImageIndex === proGalleryImages.length - 1;
            }
        };
        
        newImage.src = image.src;
        
        if (proLightboxCurrent) {
            proLightboxCurrent.textContent = currentProImageIndex + 1;
        }
    }

    /**
     * PRO gallery navigation functions
     */
    function showPreviousProImage() {
        if (currentProImageIndex > 0) {
            currentProImageIndex--;
            updateProLightboxImage();
        }
    }

    function showNextProImage() {
        if (currentProImageIndex < proGalleryImages.length - 1) {
            currentProImageIndex++;
            updateProLightboxImage();
        }
    }

    /**
     * Handles keyboard navigation in PRO lightbox
     */
    function handleProLightboxKeydown(event) {
        if (!isProLightboxOpen) return;
        
        switch (event.key) {
            case 'Escape':
                closeProLightbox();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                showPreviousProImage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                showNextProImage();
                break;
        }
    }

    // --- PRO GALLERY EVENT LISTENERS ---

    if (openProGalleryBtn) {
        openProGalleryBtn.addEventListener('click', () => openProLightbox(0));
    }

    if (proLightboxClose) {
        proLightboxClose.addEventListener('click', closeProLightbox);
    }

    if (proLightboxBackdrop) {
        proLightboxBackdrop.addEventListener('click', closeProLightbox);
    }

    if (proLightboxPrev) {
        proLightboxPrev.addEventListener('click', showPreviousProImage);
    }
    if (proLightboxNext) {
        proLightboxNext.addEventListener('click', showNextProImage);
    }

    // --- FLOATING BOBR ANIMATION ---

    let bobrTimer = null;
    let bobrCounter = 0;

    /**
     * Creates and animates a floating bobr
     */
    function createFloatingBobr() {
        // Remove any existing bobr
        const existingBobr = document.querySelector('.floating-bobr');
        if (existingBobr) {
            existingBobr.remove();
        }

        // Create bobr element
        const bobr = document.createElement('div');
        bobr.className = 'floating-bobr';

        // Create img element
        const img = document.createElement('img');
        img.src = './bobr.png';
        img.alt = 'Floating Bobr';
        img.draggable = false;
        
        // Fallback to Justas.jpg if bobr.png fails
        img.onerror = function() {
            console.log('bobr.png failed, using Justas.jpg as fallback');
            this.src = './Justas.jpg';
        };
        
        bobr.appendChild(img);

        // Random corner entry direction
        const directions = ['from-top-left', 'from-top-right', 'from-bottom-left', 'from-bottom-right'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        bobr.classList.add(randomDirection);

        // Add to page
        document.body.appendChild(bobr);

        // Show bobr with delay
        setTimeout(() => {
            bobr.classList.add('visible');
        }, 100);

        // Remove bobr after animation completes
        setTimeout(() => {
            if (bobr.parentNode) {
                bobr.remove();
            }
        }, 3100);

        console.log(`🦫 Bobr #${++bobrCounter} appeared from ${randomDirection}!`);
    }

    /**
     * Starts the bobr timer
     */
    function startBobrTimer() {
        // Clear any existing timer
        if (bobrTimer) {
            clearInterval(bobrTimer);
        }

        // Create bobr every 10 seconds
        bobrTimer = setInterval(() => {
            // Only show bobr in post-event phase
            const now = new Date();
            if (now >= EVENT_END_TIME || phases.postEvent?.classList.contains('active')) {
                createFloatingBobr();
            }
        }, 10000);

        // Show first bobr after 5 seconds
        setTimeout(() => {
            const now = new Date();
            if (now >= EVENT_END_TIME || phases.postEvent?.classList.contains('active')) {
                createFloatingBobr();
            }
        }, 5000);
    }

    /**
     * Stops the bobr timer
     */
    function stopBobrTimer() {
        if (bobrTimer) {
            clearInterval(bobrTimer);
            bobrTimer = null;
        }
        
        // Remove any existing bobr
        const existingBobr = document.querySelector('.floating-bobr');
        if (existingBobr) {
            existingBobr.remove();
        }
    }

    // --- INITIALIZATION ---

    // Only load galleries when in post-event phase or when needed
    function initializeGalleries() {
        const now = new Date();
        
        if (now >= EVENT_END_TIME || phases.postEvent?.classList.contains('active')) {
            // Initialize galleries - load data and attach listeners
            initializeImageGrid();
            initializeProImageGrid();
        }
    }

    // Lazy load galleries when post-event phase becomes active
    if (phases.postEvent) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' && 
                    mutation.target === phases.postEvent &&
                    phases.postEvent.classList.contains('active')) {
                    
                    // Initialize galleries when post-event phase becomes active
                    initializeImageGrid();
                    initializeProImageGrid();
                }
            });
        });
        
        observer.observe(phases.postEvent, { attributes: true });
    }

    // Initialize galleries if already in post-event phase
    initializeGalleries();

    // Run the phase check immediately on page load
    updatePagePhase();

    // Set an interval to check for phase changes every minute
    // This ensures the page automatically switches if left open
    phaseCheckInterval = setInterval(updatePagePhase, 60000); 

});