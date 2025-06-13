/**
 * Accessibility Module for Interactive Spelling Assessment
 * Provides comprehensive accessibility features for inclusive education
 */

class AccessibilityManager {
    constructor() {
        this.highContrastMode = localStorage.getItem('accessibility-high-contrast') === 'true';
        this.fontSize = localStorage.getItem('accessibility-font-size') || 'normal';
        this.keyboardNavigation = true;
        this.screenReaderMode = this.detectScreenReader();
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        
        this.init();
    }

    /**
     * Initialize accessibility features
     */
    init() {
        this.createAccessibilityPanel();
        this.setupKeyboardNavigation();
        this.addAriaLabels();
        this.setupFocusManagement();
        this.applyStoredSettings();
        this.announcePageLoad();
        
        console.log('Accessibility features initialized');
    }

    /**
     * Detect if screen reader is likely being used
     */
    detectScreenReader() {
        // Check for common screen reader indicators
        return !!(
            navigator.userAgent.includes('NVDA') ||
            navigator.userAgent.includes('JAWS') ||
            navigator.userAgent.includes('VoiceOver') ||
            window.speechSynthesis && window.speechSynthesis.speaking ||
            document.activeElement && document.activeElement.getAttribute('aria-live')
        );
    }

    /**
     * Create accessibility control panel
     */
    createAccessibilityPanel() {
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.setAttribute('aria-label', 'Accessibility Controls');
        panel.innerHTML = `
            <button id="accessibility-toggle" class="accessibility-btn" aria-expanded="false" aria-controls="accessibility-options">
                ♿ Accessibility
            </button>
            <div id="accessibility-options" class="accessibility-options" aria-hidden="true">
                <div class="accessibility-section">
                    <h3>Visual Options</h3>
                    <button id="high-contrast-toggle" class="accessibility-option" aria-pressed="${this.highContrastMode}">
                        🎨 High Contrast Mode
                    </button>
                    <div class="font-size-controls">
                        <label for="font-size-select">Font Size:</label>
                        <select id="font-size-select" aria-label="Choose font size">
                            <option value="small">Small</option>
                            <option value="normal" selected>Normal</option>
                            <option value="large">Large</option>
                            <option value="extra-large">Extra Large</option>
                        </select>
                    </div>
                </div>
                <div class="accessibility-section">
                    <h3>Navigation Options</h3>
                    <button id="keyboard-help" class="accessibility-option">
                        ⌨️ Keyboard Shortcuts
                    </button>
                    <button id="skip-to-content" class="accessibility-option">
                        ⏭️ Skip to Main Content
                    </button>
                </div>
                <div class="accessibility-section">
                    <h3>Audio Options</h3>
                    <button id="audio-descriptions" class="accessibility-option" aria-pressed="false">
                        🔊 Enhanced Audio Descriptions
                    </button>
                </div>
            </div>
        `;

        // Insert at the beginning of the body
        document.body.insertBefore(panel, document.body.firstChild);
        
        this.setupAccessibilityControls();
        this.addAccessibilityStyles();
    }

    /**
     * Setup accessibility control event listeners
     */
    setupAccessibilityControls() {
        // Toggle accessibility panel
        const toggle = document.getElementById('accessibility-toggle');
        const options = document.getElementById('accessibility-options');
        
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isExpanded);
            options.setAttribute('aria-hidden', isExpanded);
            options.style.display = isExpanded ? 'none' : 'block';
        });

        // High contrast toggle
        document.getElementById('high-contrast-toggle').addEventListener('click', () => {
            this.toggleHighContrast();
        });

        // Font size control
        document.getElementById('font-size-select').addEventListener('change', (e) => {
            this.setFontSize(e.target.value);
        });

        // Keyboard help
        document.getElementById('keyboard-help').addEventListener('click', () => {
            this.showKeyboardHelp();
        });

        // Skip to content
        document.getElementById('skip-to-content').addEventListener('click', () => {
            this.skipToMainContent();
        });

        // Audio descriptions
        document.getElementById('audio-descriptions').addEventListener('click', () => {
            this.toggleAudioDescriptions();
        });
    }

    /**
     * Add CSS styles for accessibility features
     */
    addAccessibilityStyles() {
        const styles = document.createElement('style');
        styles.id = 'accessibility-styles';
        styles.textContent = `
            /* Accessibility Panel Styles */
            #accessibility-panel {
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 10000;
                font-family: Arial, sans-serif;
            }

            .accessibility-btn {
                background: #2c3e50;
                color: white;
                border: 2px solid #34495e;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: bold;
            }

            .accessibility-btn:hover, .accessibility-btn:focus {
                background: #34495e;
                outline: 3px solid #3498db;
            }

            .accessibility-options {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                background: white;
                border: 2px solid #2c3e50;
                border-radius: 8px;
                padding: 15px;
                min-width: 250px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                margin-top: 5px;
            }

            .accessibility-section {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }

            .accessibility-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }

            .accessibility-section h3 {
                margin: 0 0 10px 0;
                font-size: 0.9rem;
                color: #2c3e50;
                font-weight: bold;
            }

            .accessibility-option {
                display: block;
                width: 100%;
                background: #ecf0f1;
                border: 1px solid #bdc3c7;
                padding: 8px 12px;
                margin: 5px 0;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
                text-align: left;
            }

            .accessibility-option:hover, .accessibility-option:focus {
                background: #d5dbdb;
                outline: 2px solid #3498db;
            }

            .accessibility-option[aria-pressed="true"] {
                background: #3498db;
                color: white;
            }

            .font-size-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 5px 0;
            }

            .font-size-controls label {
                font-size: 0.85rem;
                font-weight: bold;
                color: #2c3e50;
            }

            .font-size-controls select {
                flex: 1;
                padding: 4px;
                border: 1px solid #bdc3c7;
                border-radius: 3px;
                font-size: 0.85rem;
            }

            /* High Contrast Mode */
            body.high-contrast {
                background: #000 !important;
                color: #fff !important;
            }

            body.high-contrast .container {
                background: #000 !important;
            }

            body.high-contrast #quiz-container,
            body.high-contrast .help-container,
            body.high-contrast .dashboard-container {
                background: #000 !important;
                border: 3px solid #fff !important;
                color: #fff !important;
            }

            body.high-contrast .screen,
            body.high-contrast .help-content,
            body.high-contrast .dashboard-content {
                background: #000 !important;
                color: #fff !important;
            }

            body.high-contrast .btn {
                background: #fff !important;
                color: #000 !important;
                border: 2px solid #fff !important;
            }

            body.high-contrast .btn:hover,
            body.high-contrast .btn:focus {
                background: #000 !important;
                color: #fff !important;
                outline: 3px solid #fff !important;
            }

            body.high-contrast input,
            body.high-contrast select,
            body.high-contrast textarea {
                background: #000 !important;
                color: #fff !important;
                border: 2px solid #fff !important;
            }

            body.high-contrast .answer-input.correct {
                background: #000 !important;
                border-color: #0f0 !important;
                color: #0f0 !important;
            }

            body.high-contrast .answer-input.incorrect {
                background: #000 !important;
                border-color: #f00 !important;
                color: #f00 !important;
            }

            /* Font Size Options */
            body.font-small { font-size: 14px; }
            body.font-normal { font-size: 16px; }
            body.font-large { font-size: 18px; }
            body.font-extra-large { font-size: 22px; }

            /* Focus Indicators */
            *:focus {
                outline: 3px solid #3498db !important;
                outline-offset: 2px !important;
            }

            /* Skip Link */
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                border-radius: 0 0 4px 4px;
                z-index: 10001;
            }

            .skip-link:focus {
                top: 0;
            }

            /* Screen Reader Only Content */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            /* Keyboard Navigation Highlight */
            .keyboard-focus {
                box-shadow: 0 0 0 3px #3498db !important;
                border-radius: 4px;
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Setup comprehensive keyboard navigation
     */
    setupKeyboardNavigation() {
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content landmark
        const mainContent = document.querySelector('#quiz-container') || document.querySelector('main') || document.querySelector('.container');
        if (mainContent) {
            mainContent.id = 'main-content';
            mainContent.setAttribute('role', 'main');
        }

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + A: Open accessibility panel
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                document.getElementById('accessibility-toggle').click();
                this.announceAction('Accessibility panel opened');
            }

            // Alt + H: Open help
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                const helpLink = document.querySelector('a[href="help-system.html"]');
                if (helpLink) {
                    helpLink.click();
                    this.announceAction('Opening help page');
                }
            }

            // Alt + S: Start/restart quiz
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                const startBtn = document.getElementById('start-btn');
                const restartBtn = document.getElementById('restart-quiz');
                if (startBtn && startBtn.style.display !== 'none') {
                    startBtn.click();
                    this.announceAction('Starting quiz');
                } else if (restartBtn) {
                    restartBtn.click();
                    this.announceAction('Restarting quiz');
                }
            }

            // Tab navigation enhancement
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }

            // Enter key activation for custom elements
            if (e.key === 'Enter' && e.target.classList.contains('accessibility-option')) {
                e.preventDefault();
                e.target.click();
            }
        });
    }

    /**
     * Enhanced tab navigation handling
     */
    handleTabNavigation(e) {
        this.updateFocusableElements();
        
        // Announce current element to screen reader
        setTimeout(() => {
            const focused = document.activeElement;
            if (focused && focused.getAttribute('aria-label')) {
                this.announceAction(`Focused on ${focused.getAttribute('aria-label')}`);
            }
        }, 100);
    }

    /**
     * Update list of focusable elements
     */
    updateFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
    }

    /**
     * Add comprehensive ARIA labels and landmarks
     */
    addAriaLabels() {
        // Main quiz elements
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.setAttribute('aria-describedby', 'start-description');
            this.addHiddenDescription('start-description', 'Click to begin the spelling assessment. You will hear a story and fill in missing words.');
        }

        const studentNameInput = document.getElementById('student-name');
        if (studentNameInput) {
            studentNameInput.setAttribute('aria-label', 'Student name (optional)');
            studentNameInput.setAttribute('aria-describedby', 'name-description');
            this.addHiddenDescription('name-description', 'Enter your name so your teacher can see your results. This is optional.');
        }

        // Audio controls
        const playParagraph = document.getElementById('play-paragraph');
        if (playParagraph) {
            playParagraph.setAttribute('aria-label', 'Listen to the complete paragraph');
            playParagraph.setAttribute('aria-describedby', 'paragraph-audio-description');
            this.addHiddenDescription('paragraph-audio-description', 'Click to hear the computer read the entire story including the missing words.');
        }

        // Progress indicator
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.setAttribute('aria-live', 'polite');
            progressText.setAttribute('aria-atomic', 'true');
        }

        // Quiz containers
        const quizContainer = document.getElementById('quiz-container');
        if (quizContainer) {
            quizContainer.setAttribute('role', 'main');
            quizContainer.setAttribute('aria-label', 'Spelling Quiz');
        }

        // Results section
        const resultsScreen = document.getElementById('results-screen');
        if (resultsScreen) {
            resultsScreen.setAttribute('role', 'region');
            resultsScreen.setAttribute('aria-label', 'Quiz Results');
        }

        // Dynamic ARIA updates will be handled in quiz events
    }

    /**
     * Add hidden description element
     */
    addHiddenDescription(id, text) {
        if (document.getElementById(id)) return; // Already exists
        
        const desc = document.createElement('div');
        desc.id = id;
        desc.className = 'sr-only';
        desc.textContent = text;
        document.body.appendChild(desc);
    }

    /**
     * Toggle high contrast mode
     */
    toggleHighContrast() {
        this.highContrastMode = !this.highContrastMode;
        document.body.classList.toggle('high-contrast', this.highContrastMode);
        
        const toggle = document.getElementById('high-contrast-toggle');
        toggle.setAttribute('aria-pressed', this.highContrastMode);
        
        localStorage.setItem('accessibility-high-contrast', this.highContrastMode);
        
        this.announceAction(this.highContrastMode ? 'High contrast mode enabled' : 'High contrast mode disabled');
    }

    /**
     * Set font size
     */
    setFontSize(size) {
        // Remove existing font size classes
        document.body.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large');
        
        // Add new font size class
        document.body.classList.add(`font-${size}`);
        
        this.fontSize = size;
        localStorage.setItem('accessibility-font-size', size);
        
        // Update select value
        document.getElementById('font-size-select').value = size;
        
        this.announceAction(`Font size changed to ${size}`);
    }

    /**
     * Show keyboard shortcuts help
     */
    showKeyboardHelp() {
        const shortcuts = [
            'Alt + A: Open accessibility panel',
            'Alt + H: Open help page',
            'Alt + S: Start or restart quiz',
            'Tab: Navigate between elements',
            'Enter/Space: Activate buttons',
            'Escape: Close dialogs'
        ];

        const helpText = 'Keyboard Shortcuts:\n\n' + shortcuts.join('\n');
        
        if (this.screenReaderMode) {
            this.announceAction(helpText);
        } else {
            alert(helpText);
        }
    }

    /**
     * Skip to main content
     */
    skipToMainContent() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView();
            this.announceAction('Skipped to main content');
        }
    }

    /**
     * Toggle enhanced audio descriptions
     */
    toggleAudioDescriptions() {
        const toggle = document.getElementById('audio-descriptions');
        const enabled = toggle.getAttribute('aria-pressed') === 'true';
        
        toggle.setAttribute('aria-pressed', !enabled);
        
        // This would integrate with the existing audio system
        window.accessibilityEnhancedAudio = !enabled;
        
        this.announceAction(!enabled ? 'Enhanced audio descriptions enabled' : 'Enhanced audio descriptions disabled');
    }

    /**
     * Apply stored accessibility settings
     */
    applyStoredSettings() {
        if (this.highContrastMode) {
            document.body.classList.add('high-contrast');
        }
        
        if (this.fontSize !== 'normal') {
            this.setFontSize(this.fontSize);
        }
    }

    /**
     * Announce page load to screen readers
     */
    announcePageLoad() {
        setTimeout(() => {
            this.announceAction('Interactive Spelling Assessment loaded. Press Alt+A for accessibility options, Alt+H for help.');
        }, 1000);
    }

    /**
     * Announce actions to screen readers
     */
    announceAction(message) {
        if (!this.screenReaderMode && !window.speechSynthesis) return;
        
        // Create or update live region
        let liveRegion = document.getElementById('accessibility-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'accessibility-live-region';
            liveRegion.setAttribute('aria-live', 'assertive');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
        
        // Also speak if enhanced audio is enabled
        if (window.accessibilityEnhancedAudio && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    /**
     * Update ARIA labels for quiz state
     */
    updateQuizAriaLabels(currentWord, totalWords, isCorrect = null, isSecondAttempt = false) {
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = `Question ${currentWord} of ${totalWords}`;
        }

        // Announce word state changes
        if (isCorrect === true) {
            this.announceAction(`Correct! Moving to question ${currentWord + 1} of ${totalWords}`);
        } else if (isCorrect === false && !isSecondAttempt) {
            this.announceAction(`Incorrect. Listen to the sentence and try again. This is your second chance.`);
        } else if (isCorrect === false && isSecondAttempt) {
            this.announceAction(`The correct spelling will be shown. Moving to question ${currentWord + 1} of ${totalWords}`);
        }
    }

    /**
     * Update answer input accessibility
     */
    updateAnswerInputAccessibility(inputElement, wordNumber, totalLetters, isSecondChance = false) {
        if (!inputElement) return;

        inputElement.setAttribute('aria-label', `Word ${wordNumber}: Enter spelling for word with ${totalLetters} letters`);
        
        if (isSecondChance) {
            inputElement.setAttribute('aria-describedby', `word-${wordNumber}-second-chance`);
            this.addHiddenDescription(
                `word-${wordNumber}-second-chance`, 
                'Second attempt. Listen carefully to the sentence and try again.'
            );
        }
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Focus management for dynamic content
        document.addEventListener('quiz-state-change', (e) => {
            this.handleQuizStateChange(e.detail);
        });
        
        // Trap focus in modal dialogs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    /**
     * Handle quiz state changes for accessibility
     */
    handleQuizStateChange(state) {
        switch (state.type) {
            case 'quiz-started':
                setTimeout(() => {
                    const firstInput = document.querySelector('.answer-input');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 500);
                break;
                
            case 'word-submitted':
                this.updateQuizAriaLabels(
                    state.currentWord, 
                    state.totalWords, 
                    state.isCorrect, 
                    state.isSecondAttempt
                );
                break;
                
            case 'quiz-completed':
                setTimeout(() => {
                    const resultsSection = document.getElementById('results-screen');
                    if (resultsSection) {
                        resultsSection.focus();
                        resultsSection.scrollIntoView();
                    }
                }, 500);
                break;
        }
    }

    /**
     * Handle escape key for closing dialogs
     */
    handleEscapeKey() {
        // Close accessibility panel
        const panel = document.getElementById('accessibility-options');
        const toggle = document.getElementById('accessibility-toggle');
        if (panel && panel.style.display !== 'none') {
            toggle.setAttribute('aria-expanded', 'false');
            panel.setAttribute('aria-hidden', 'true');
            panel.style.display = 'none';
            toggle.focus();
        }
    }
}

// Initialize accessibility manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
} 