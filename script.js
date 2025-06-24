// Quiz Application - Enhanced with Quiz Logic & Feedback (Phase 4)
class SpellingQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.totalQuestions = 15;
        this.selectedWords = [];
        this.selectedParagraph = null;
        this.studentName = '';
        this.quizData = [];
        this.speechSynthesis = window.speechSynthesis;
        this.currentVoice = null;
        this.isAudioEnabled = false;
        this.quizStartTime = null;
        this.quizEndTime = null;
        this.currentAnswers = {};
        this.answeredWordsCount = 0;
        this.isIOS = this.detectIOS();
        this.isMobile = this.detectMobile();
        this.audioContext = null;
        this.speechInitialized = false;
        this.mobileAudioReady = false;
        this.init();
    }

    init() {
        this.initializeAudio();
        this.bindEvents();
        this.showScreen('start-screen');
    }

    detectIOS() {
        return /iPhone|iPad|iPod/.test(navigator.userAgent);
    }

    detectMobile() {
        return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }

    initializeAudio() {
        // Check if speech synthesis is supported
        if ('speechSynthesis' in window) {
            this.isAudioEnabled = true;
            
            console.log('🔊 TTS Support detected');
            console.log('📱 Device type:', {
                isIOS: this.isIOS,
                isMobile: this.isMobile,
                userAgent: navigator.userAgent.substring(0, 50) + '...'
            });
            
            // Initialize AudioContext for iOS compatibility
            if (this.isIOS && window.AudioContext) {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    console.log('🎵 AudioContext initialized for iOS');
                } catch (error) {
                    console.warn('⚠️ Could not initialize AudioContext:', error);
                }
            }
            
            // Setup voice selection with iOS-specific handling
            this.setupVoiceSelection();
            
            // Mobile requires user interaction before speech works
            if (this.isMobile) {
                this.setupMobileAudioInitialization();
            }
        } else {
            console.warn('❌ Speech synthesis not supported in this browser');
            this.isAudioEnabled = false;
        }
    }

    setupVoiceSelection() {
        const initializeVoices = () => {
            const voices = this.speechSynthesis.getVoices();
            
            if (voices.length === 0) {
                console.log('⏳ No voices available yet, waiting...');
                return false;
            }
            
            console.log(`🎭 Found ${voices.length} voices:`, voices.map(v => ({
                name: v.name,
                lang: v.lang,
                localService: v.localService,
                default: v.default
            })));
            
            // iOS-specific voice selection logic
            let selectedVoice = null;
            
            if (this.isIOS) {
                // iOS voice priority: local English voices work best
                selectedVoice = voices.find(v => 
                    v.lang.startsWith('en') && 
                    v.localService === true
                ) || voices.find(v => 
                    v.lang.startsWith('en')
                ) || voices[0];
                
                console.log('🍎 iOS voice selected:', selectedVoice?.name);
            } else {
                // Desktop/Android voice selection (existing logic)
                const isFemaleVoice = (voice) => {
                    const name = voice.name.toLowerCase();
                    return name.includes('female') || name.includes('woman') || 
                           name.includes('kate') || name.includes('serena') || 
                           name.includes('stephanie') || name.includes('fiona') || 
                           name.includes('samantha') || name.includes('susan') || 
                           name.includes('karen') || name.includes('victoria') ||
                           name.includes('emma') || name.includes('olivia') ||
                           name.includes('sophia') || name.includes('emily');
                };
                
                const britishFemaleVoice = voices.find(voice => 
                    (voice.lang === 'en-GB' || voice.lang === 'en-UK' || voice.name.toLowerCase().includes('british')) &&
                    isFemaleVoice(voice)
                );
                
                const englishFemaleVoice = voices.find(voice => 
                    voice.lang.startsWith('en') && isFemaleVoice(voice)
                );
                
                const anyFemaleVoice = voices.find(voice => isFemaleVoice(voice));
                
                selectedVoice = britishFemaleVoice || englishFemaleVoice || anyFemaleVoice || voices[0];
            }
            
            this.currentVoice = selectedVoice;
            this.speechInitialized = true;
            
            console.log('✅ Final voice selection:', {
                name: this.currentVoice?.name || 'Default',
                lang: this.currentVoice?.lang || 'Unknown',
                localService: this.currentVoice?.localService,
                isIOS: this.isIOS
            });
            
            return true;
        };

        // Try immediate initialization
        if (!initializeVoices()) {
            // If no voices available, wait for voiceschanged event
            let attempts = 0;
            const maxAttempts = this.isMobile ? 15 : 5;
            
            const tryAgain = () => {
                attempts++;
                if (initializeVoices()) {
                    return; // Success
                }
                
                if (attempts < maxAttempts) {
                    setTimeout(tryAgain, 500);
                } else {
                    console.warn('⚠️ Could not load voices after multiple attempts');
                    this.speechInitialized = true; // Continue without voice selection
                }
            };
            
            this.speechSynthesis.addEventListener('voiceschanged', initializeVoices);
            setTimeout(tryAgain, 100);
        }
    }

    setupMobileAudioInitialization() {
        console.log('📱 Setting up mobile audio initialization');
        
        const enableMobileAudio = async () => {
            if (this.mobileAudioReady) return;
            
            try {
                // Initialize AudioContext on iOS if needed
                if (this.isIOS && this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                    console.log('🎵 iOS AudioContext resumed');
                }
                
                // Test speech synthesis with silent utterance
                const testUtterance = new SpeechSynthesisUtterance('');
                testUtterance.volume = 0;
                testUtterance.rate = 1;
                testUtterance.pitch = 1;
                
                // Add a short delay for iOS
                if (this.isIOS) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                this.speechSynthesis.speak(testUtterance);
                this.mobileAudioReady = true;
                
                console.log('📱 Mobile audio initialization successful');
                
                // Update UI to show audio is ready
                this.updateAudioControlsForMobile();
                
            } catch (error) {
                console.error('❌ Mobile audio initialization failed:', error);
            }
        };
        
        // Add listeners to common interaction events
        const events = ['touchstart', 'touchend', 'click', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, enableMobileAudio, { 
                once: true, 
                passive: true 
            });
        });
    }

    updateAudioControlsForMobile() {
        // Show mobile-specific play button if needed
        if (this.isMobile) {
            const playBtn = document.getElementById('play-paragraph');
            if (playBtn && this.mobileAudioReady) {
                playBtn.style.background = '#4CAF50';
                playBtn.title = 'Tap to hear the paragraph (Audio Ready)';
            }
        }
    }

    async speak(text, options = {}) {
        if (!this.isAudioEnabled || !text) {
            console.log('❌ Speech not available:', { 
                audioEnabled: this.isAudioEnabled, 
                hasText: !!text 
            });
            return Promise.resolve();
        }

        // Wait for speech initialization
        if (!this.speechInitialized) {
            console.log('⏳ Waiting for speech initialization...');
            await this.waitForSpeechInit();
        }

        console.log('🔊 Starting speech:', { 
            textLength: text.length, 
            isIOS: this.isIOS,
            isMobile: this.isMobile,
            voice: this.currentVoice?.name,
            options 
        });

        return new Promise((resolve, reject) => {
            try {
                // Stop any current speech
                this.speechSynthesis.cancel();
                
                // iOS-specific delay to ensure synthesis is ready
                const delay = this.isIOS ? 150 : 50;
                
                setTimeout(() => {
                    try {
                        const utterance = new SpeechSynthesisUtterance(text);
                        
                        // iOS-optimized settings
                        if (this.isIOS) {
                            utterance.voice = this.currentVoice;
                            utterance.rate = options.rate || 0.7;
                            utterance.pitch = options.pitch || 1.0;
                            utterance.volume = options.volume || 0.9;
                        } else {
                            utterance.voice = this.currentVoice;
                            utterance.rate = options.rate || 0.8;
                            utterance.pitch = options.pitch || 1.0;
                            utterance.volume = options.volume || 1.0;
                        }
                        
                        let resolved = false;
                        const timeout = setTimeout(() => {
                            if (!resolved) {
                                resolved = true;
                                console.warn('⏰ Speech timeout, resolving anyway');
                                resolve();
                            }
                        }, text.length * 100 + 5000); // Generous timeout
                        
                        utterance.onstart = () => {
                            console.log('✅ Speech started successfully');
                        };
                        
                        utterance.onend = () => {
                            clearTimeout(timeout);
                            if (!resolved) {
                                resolved = true;
                                console.log('✅ Speech completed successfully');
                                resolve();
                            }
                        };
                        
                        utterance.onerror = (event) => {
                            clearTimeout(timeout);
                            if (!resolved) {
                                resolved = true;
                                console.error('❌ Speech error:', event.error);
                                
                                // Try fallback for iOS
                                if (this.isIOS && event.error === 'interrupted') {
                                    console.log('🍎 iOS interrupted error, trying fallback...');
                                    this.iosSpeechFallback(text, options).then(resolve).catch(reject);
                                } else {
                                    resolve(); // Don't reject, just continue silently
                                }
                            }
                        };
                        
                        // Start speaking
                        this.speechSynthesis.speak(utterance);
                        
                    } catch (error) {
                        console.error('❌ Error creating speech utterance:', error);
                        reject(error);
                    }
                }, delay);
                
            } catch (error) {
                console.error('❌ Error in speak method:', error);
                reject(error);
            }
        });
    }

    async iosSpeechFallback(text, options = {}) {
        console.log('🍎 Attempting iOS speech fallback...');
        
        return new Promise((resolve) => {
            try {
                // Try with even simpler settings
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.6;
                utterance.volume = 0.8;
                utterance.pitch = 1.0;
                
                // Don't set voice for fallback - use system default
                
                utterance.onend = () => {
                    console.log('✅ iOS fallback speech completed');
                    resolve();
                };
                
                utterance.onerror = () => {
                    console.log('❌ iOS fallback also failed, continuing silently');
                    resolve();
                };
                
                setTimeout(() => {
                    this.speechSynthesis.speak(utterance);
                }, 200);
                
                // Fallback timeout
                setTimeout(() => {
                    console.log('⏰ iOS fallback timeout');
                    resolve();
                }, 8000);
                
            } catch (error) {
                console.error('❌ iOS fallback error:', error);
                resolve();
            }
        });
    }

    async waitForSpeechInit(maxWait = 5000) {
        const startTime = Date.now();
        while (!this.speechInitialized && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    showMobilePlayButton() {
        const playBtn = document.getElementById('play-paragraph');
        if (playBtn) {
            // Make the button more prominent for mobile
            playBtn.style.cssText = `
                background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                color: white;
                font-size: 18px;
                padding: 15px 25px;
                border-radius: 25px;
                border: none;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                animation: pulse 2s infinite;
                margin: 20px 0;
                display: block;
                width: 100%;
                max-width: 300px;
                margin: 20px auto;
            `;
            playBtn.innerHTML = '🎧 Tap to Listen to Paragraph';
            playBtn.title = 'Tap here to hear the paragraph read aloud';
            
            // Add pulse animation styles if not already added
            if (!document.getElementById('mobile-pulse-styles')) {
                const style = document.createElement('style');
                style.id = 'mobile-pulse-styles';
                style.textContent = `
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    stopSpeaking() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    }

    getVoiceType(voice) {
        if (!voice) return 'Unknown';
        
        const name = voice.name.toLowerCase();
        const lang = voice.lang;
        
        let type = '';
        
        // Determine accent
        if (lang === 'en-GB' || lang === 'en-UK' || name.includes('british') || name.includes('uk')) {
            type += 'British English';
        } else if (lang === 'en-US' || name.includes('american') || name.includes('us')) {
            type += 'American English';
        } else if (lang === 'en-AU' || name.includes('australian')) {
            type += 'Australian English';
        } else if (lang.startsWith('en')) {
            type += 'English';
        } else {
            type += lang;
        }
        
        // Determine gender
        if (name.includes('female') || name.includes('woman') || voice.gender === 'female' ||
            name.includes('kate') || name.includes('serena') || name.includes('stephanie') ||
            name.includes('fiona') || name.includes('samantha') || name.includes('susan') ||
            name.includes('karen')) {
            type += ' (Female)';
        } else if (name.includes('male') || name.includes('man') || voice.gender === 'male' ||
                   name.includes('daniel') || name.includes('david') || name.includes('alex')) {
            type += ' (Male)';
        }
        
        return type;
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Start button
        const startBtn = document.getElementById('start-btn');
        console.log('Start button found:', !!startBtn);
        
        if (startBtn) {
            // Remove any existing listeners first
            if (this.startQuizHandler) {
                startBtn.removeEventListener('click', this.startQuizHandler);
            }
            
            // Create bound handler
            this.startQuizHandler = () => {
                console.log('Start button clicked!');
                this.startQuiz();
            };
            
            startBtn.addEventListener('click', this.startQuizHandler);
            console.log('Start button event listener attached');
        } else {
            console.error('Start button not found!');
        }

        // Student name input
        const studentNameInput = document.getElementById('student-name');
        if (studentNameInput) {
            studentNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.startQuiz();
                }
            });
        }

        // Quiz control buttons
        const submitBtn = document.getElementById('submit-answer');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAnswers());
        }

        const nextBtn = document.getElementById('next-question');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        // Restart button
        const restartBtn = document.getElementById('restart-quiz');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartQuiz());
        }

        // Export results button
        const exportBtn = document.getElementById('export-results');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }

        // Audio controls
        const playParagraphBtn = document.getElementById('play-paragraph');
        if (playParagraphBtn) {
            playParagraphBtn.addEventListener('click', () => this.playParagraph());
        }
    }

    showScreen(screenId) {
        // Stop any ongoing speech when changing screens
        this.stopSpeaking();
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    startQuiz() {
        console.log('startQuiz() method called');
        
        try {
            // Get student name
            const studentNameInput = document.getElementById('student-name');
            this.studentName = studentNameInput ? studentNameInput.value.trim() : '';
            console.log('Student name:', this.studentName);

            // Initialize timing
            this.quizStartTime = new Date();
            this.quizEndTime = null;
            console.log('Quiz start time set:', this.quizStartTime);

            // Check for custom teacher settings
            console.log('Loading teacher settings...');
            this.loadTeacherSettings();

            // Select words and paragraph based on settings
            console.log('Selecting random words...');
            this.selectRandomWords();
            console.log('Selected words:', this.selectedWords);
            
            console.log('Selecting random paragraph...');
            this.selectRandomParagraph();
            console.log('Selected paragraph:', this.selectedParagraph?.title);
            
            // Initialize quiz data
            console.log('Initializing quiz data...');
            this.initializeQuizData();
            
            // Set up quiz interface
            console.log('Setting up quiz interface...');
            this.setupQuizInterface();
            
            // Show quiz screen
            console.log('Showing quiz screen...');
            this.showScreen('quiz-screen');
            
            // Update progress
            console.log('Updating progress...');
            this.updateProgress();

            // Notify accessibility manager
            if (window.accessibilityManager) {
                document.dispatchEvent(new CustomEvent('quiz-state-change', {
                    detail: { type: 'quiz-started' }
                }));
            }

            // iOS/Mobile: Show play button instead of auto-play
            if (this.isMobile) {
                console.log('📱 Mobile device detected - showing play button instead of auto-play');
                this.showMobilePlayButton();
            } else {
                // Desktop: Auto-play after delay (as before)
                setTimeout(() => {
                    console.log('🖥️ Desktop auto-playing paragraph...');
                    this.playParagraph();
                }, 1000);
            }
            
            console.log('Quiz started successfully');
            
        } catch (error) {
            console.error('Error in startQuiz():', error);
            
            // Show error to user
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: #fee2e2; color: #dc2626; padding: 20px;
                border-radius: 8px; border: 2px solid #dc2626;
                font-family: Arial, sans-serif; z-index: 1000;
                max-width: 400px; text-align: center;
            `;
            errorDiv.innerHTML = `
                <strong>Quiz Start Error:</strong><br>
                ${error.message}<br><br>
                <button onclick="this.parentElement.remove(); location.reload()" 
                        style="padding: 8px 15px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                </button>
            `;
            document.body.appendChild(errorDiv);
        }
    }

    loadTeacherSettings() {
        // Check for custom settings from teacher
        const customSettings = localStorage.getItem('active-quiz-settings');
        if (customSettings) {
            try {
                this.teacherSettings = JSON.parse(customSettings);
                this.totalQuestions = this.teacherSettings.numberOfWords || 15;
                console.log('Loaded teacher settings:', this.teacherSettings);
            } catch (error) {
                console.error('Error loading teacher settings:', error);
                this.teacherSettings = null;
            }
        } else {
            this.teacherSettings = null;
        }
    }

    selectRandomWords() {
        if (this.teacherSettings && this.teacherSettings.selectedWords.length > 0) {
            // Use teacher-selected words
            let words = [...this.teacherSettings.selectedWords];
            
            if (this.teacherSettings.randomizeWordOrder) {
                words = words.sort(() => 0.5 - Math.random());
            }
            
            this.selectedWords = words.slice(0, this.totalQuestions);
            console.log('Using teacher-selected words:', this.selectedWords);
        } else {
            // Use default random selection from word bank
            // finalWordBank is already a flat array of all words
            const shuffled = [...finalWordBank].sort(() => 0.5 - Math.random());
            this.selectedWords = shuffled.slice(0, this.totalQuestions);
            console.log('Using random words from bank:', this.selectedWords);
        }
    }

    selectRandomParagraph() {
        // Select a random paragraph template
        const randomIndex = Math.floor(Math.random() * paragraphTemplates.length);
        this.selectedParagraph = paragraphTemplates[randomIndex];
    }

    initializeQuizData() {
        this.quizData = this.selectedWords.map((word, index) => ({
            word: word,
            position: index,
            attempts: 0,
            correct: false,
            userAnswers: [],
            timeSpent: 0,
            startTime: new Date(),
            firstAttemptCorrect: false,
            secondAttemptCorrect: false,
            completed: false
        }));
        this.currentAnswers = {};
        this.answeredWordsCount = 0;
    }

    setupQuizInterface() {
        // Display paragraph with blanks
        this.displayParagraph();
        
        // Create answer inputs
        this.createAnswerInputs();
        
        // Set question number
        this.currentQuestion = 0;
        this.updateProgress();

        // Update audio button state
        this.updateAudioControls();

        // Update submit button text
        this.updateSubmitButton();
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-answer');
        if (submitBtn) {
            submitBtn.textContent = 'Check Answers';
            submitBtn.style.display = 'inline-block';
        }
        
        const nextBtn = document.getElementById('next-question');
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
    }

    updateAudioControls() {
        const playBtn = document.getElementById('play-paragraph');
        if (playBtn) {
            if (this.isAudioEnabled) {
                playBtn.disabled = false;
                playBtn.title = 'Click to hear the paragraph read aloud';
            } else {
                playBtn.disabled = true;
                playBtn.title = 'Audio not available in this browser';
                playBtn.textContent = '🔇 Audio Unavailable';
            }
        }
    }

    displayParagraph() {
        const paragraphDisplay = document.getElementById('paragraph-display');
        if (!paragraphDisplay || !this.selectedParagraph) return;

        // Replace placeholders with blanks showing word length
        let paragraphText = this.selectedParagraph.template;
        
        for (let i = 0; i < this.selectedWords.length; i++) {
            const word = this.selectedWords[i];
            const wordLength = word.length;
            const blank = '_'.repeat(wordLength);
            const placeholder = `{${i}}`;
            
            // Create a span with the blank and word number
            const blankSpan = `<span class="word-blank" data-word-index="${i}" data-word="${word}">
                <strong>[${i + 1}]</strong> ${blank}
            </span>`;
            
            paragraphText = paragraphText.replace(placeholder, blankSpan);
        }

        paragraphDisplay.innerHTML = paragraphText;

        // Store the complete paragraph text for audio
        this.completeParagraphText = this.generateCompleteParagraphText();
    }

    generateCompleteParagraphText() {
        let text = this.selectedParagraph.template;
        for (let i = 0; i < this.selectedWords.length; i++) {
            text = text.replace(`{${i}}`, this.selectedWords[i]);
        }
        return text;
    }

    createAnswerInputs() {
        const answerInputsContainer = document.getElementById('answer-inputs');
        if (!answerInputsContainer) return;

        console.log('Creating answer inputs for words:', this.selectedWords);
        console.log('Word lengths:', this.selectedWords.map(w => `${w}: ${w.length} letters`));

        answerInputsContainer.innerHTML = '';

        this.selectedWords.forEach((word, index) => {
            console.log(`Processing word ${index}: "${word}" (${word.length} letters)`);
            const answerItem = document.createElement('div');
            answerItem.className = 'answer-item';
            answerItem.setAttribute('data-word-index', index);
            
            const label = document.createElement('label');
            label.textContent = `Word ${index + 1}`;
            label.setAttribute('for', `answer-${index}`);
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `answer-${index}`;
            input.className = 'answer-input';
            input.placeholder = 'Type the word here';
            input.setAttribute('data-word-index', index);
            input.setAttribute('data-correct-word', word);
            
            // Show word length hint
            const wordSpaces = document.createElement('div');
            wordSpaces.className = 'word-spaces';
            wordSpaces.textContent = `${word.length} letters: ${word.split('').map(() => '_').join(' ')}`;
            
            // Audio controls for individual words
            const audioControls = document.createElement('div');
            audioControls.className = 'word-audio-controls';
            
            const listenBtn = document.createElement('button');
            listenBtn.type = 'button';
            listenBtn.className = 'btn btn-audio btn-small';
            listenBtn.textContent = '🔊 Listen';
            listenBtn.title = `Listen to word ${index + 1}`;
            listenBtn.addEventListener('click', () => this.playWord(word, index));
            
            if (!this.isAudioEnabled) {
                listenBtn.disabled = true;
                listenBtn.textContent = '🔇';
                listenBtn.title = 'Audio not available';
            }
            
            audioControls.appendChild(listenBtn);

            // Feedback area for validation results
            const feedbackArea = document.createElement('div');
            feedbackArea.className = 'answer-feedback';
            feedbackArea.id = `feedback-${index}`;
            
            // Add event listeners
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitAnswers();
                }
            });
            
            input.addEventListener('input', (e) => {
                // Clear any previous feedback styling
                input.classList.remove('correct', 'incorrect', 'second-chance');
                feedbackArea.innerHTML = '';
                
                // Store current answer
                this.currentAnswers[index] = e.target.value.trim();
            });
            
            answerItem.appendChild(label);
            answerItem.appendChild(input);
            answerItem.appendChild(wordSpaces);
            answerItem.appendChild(audioControls);
            answerItem.appendChild(feedbackArea);
            
            answerInputsContainer.appendChild(answerItem);
        });

        // Focus on first input
        const firstInput = answerInputsContainer.querySelector('.answer-input');
        if (firstInput) {
            firstInput.focus();
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill && progressText) {
            // Calculate progress based on completed words
            const completedWords = this.quizData.filter(data => data.completed).length;
            const progressPercentage = (completedWords / this.totalQuestions) * 100;
            
            progressFill.style.width = `${progressPercentage}%`;
            progressText.textContent = `Progress: ${completedWords} of ${this.totalQuestions} words completed`;
        }
    }

    async playParagraph() {
        const playBtn = document.getElementById('play-paragraph');
        if (!this.isAudioEnabled || !this.completeParagraphText) {
            console.log('❌ Audio not enabled or no paragraph text');
            this.showTTSError('Audio not available');
            return;
        }
        
        console.log('🔊 Starting paragraph playback:', {
            isIOS: this.isIOS,
            isMobile: this.isMobile,
            textLength: this.completeParagraphText.length,
            audioReady: this.mobileAudioReady
        });
        
        // iOS/Mobile: Ensure audio is properly initialized
        if (this.isMobile && !this.mobileAudioReady) {
            console.log('📱 Mobile audio not ready, initializing...');
            try {
                await this.ensureMobileAudioReady();
            } catch (error) {
                console.error('❌ Failed to initialize mobile audio:', error);
                this.showTTSError('Please tap again to enable audio');
                return;
            }
        }
        
        // Update button state with mobile-friendly feedback
        if (playBtn) {
            playBtn.disabled = true;
            if (this.isMobile) {
                playBtn.innerHTML = '🔊 Reading...';
                playBtn.style.background = '#FFA500';
            } else {
                playBtn.textContent = '🔊 Reading...';
            }
        }

        try {
            let textToSpeak = this.completeParagraphText;
            
            // iOS-specific: Use shorter text for better reliability
            if (this.isIOS && textToSpeak.length > 200) {
                console.log('🍎 iOS: Using shorter text for better reliability');
                textToSpeak = this.createIOSOptimizedText(textToSpeak);
            }
            
            console.log('🔊 Speaking text:', {
                originalLength: this.completeParagraphText.length,
                speakingLength: textToSpeak.length,
                preview: textToSpeak.substring(0, 50) + '...'
            });
            
            // iOS-optimized speech options
            const speechOptions = {
                rate: this.isIOS ? 0.7 : (this.isMobile ? 0.6 : 0.85),
                volume: this.isIOS ? 0.9 : 1.0,
                pitch: 1.0
            };
            
            await this.speak(textToSpeak, speechOptions);
            console.log('✅ Paragraph speech completed successfully');
            
            // Success feedback for mobile
            if (this.isMobile) {
                this.showTTSSuccess();
            }
            
        } catch (error) {
            console.error('❌ Error playing paragraph:', error);
            await this.handleTTSError(error);
        } finally {
            // Restore button state
            if (playBtn) {
                playBtn.disabled = false;
                if (this.isMobile) {
                    playBtn.innerHTML = '🎧 Tap to Listen to Paragraph';
                    playBtn.style.background = 'linear-gradient(135deg, #FF6B6B, #4ECDC4)';
                } else {
                    playBtn.textContent = '🔊 Listen to Paragraph';
                }
            }
        }
    }

    async ensureMobileAudioReady() {
        if (this.mobileAudioReady) return;
        
        // iOS-specific AudioContext initialization
        if (this.isIOS && this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('🎵 iOS AudioContext resumed');
        }
        
        // Test with silent utterance
        const testUtterance = new SpeechSynthesisUtterance('');
        testUtterance.volume = 0;
        testUtterance.rate = 1;
        testUtterance.pitch = 1;
        
        // iOS requires extra delay
        if (this.isIOS) {
            await new Promise(resolve => setTimeout(resolve, 150));
        }
        
        this.speechSynthesis.speak(testUtterance);
        this.mobileAudioReady = true;
        
        // Additional delay for iOS to ensure everything is ready
        if (this.isIOS) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('📱 Mobile audio initialization completed');
    }

    createIOSOptimizedText(text) {
        // For iOS, prioritize shorter, cleaner text
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        if (sentences.length === 0) return text.substring(0, 150);
        
        // Take first sentence that's under 150 characters
        let result = '';
        for (const sentence of sentences) {
            const cleanSentence = sentence.trim();
            if (cleanSentence.length > 0 && cleanSentence.length <= 150) {
                result = cleanSentence + '.';
                break;
            }
        }
        
        // If no suitable sentence found, take first sentence truncated
        if (!result) {
            result = sentences[0].trim();
            if (result.length > 150) {
                result = result.substring(0, 147) + '...';
            } else {
                result += '.';
            }
        }
        
        console.log('🍎 iOS optimized text:', result);
        return result;
    }

    async handleTTSError(error) {
        console.error('🔧 Handling TTS error:', error);
        
        if (this.isIOS) {
            // iOS-specific error handling
            console.log('🍎 Trying iOS fallback strategies...');
            
            try {
                // Strategy 1: Very simple phrase
                await this.speak('The paragraph is ready to read.', { 
                    rate: 0.6, 
                    volume: 0.8 
                });
                console.log('✅ iOS simple phrase fallback worked');
                this.showTTSSuccess('Audio test successful');
                return;
            } catch (fallbackError) {
                console.error('❌ iOS simple phrase fallback failed:', fallbackError);
            }
            
            try {
                // Strategy 2: System default voice
                const utterance = new SpeechSynthesisUtterance('Audio is ready.');
                utterance.rate = 0.6;
                utterance.volume = 0.8;
                // Don't set voice - use system default
                
                await new Promise((resolve) => {
                    utterance.onend = () => {
                        console.log('✅ iOS system voice fallback worked');
                        resolve();
                    };
                    utterance.onerror = () => {
                        console.log('❌ iOS system voice fallback failed');
                        resolve();
                    };
                    setTimeout(resolve, 3000); // Timeout after 3 seconds
                    this.speechSynthesis.speak(utterance);
                });
                
                this.showTTSSuccess('Audio ready with system voice');
                return;
            } catch (systemVoiceError) {
                console.error('❌ iOS system voice fallback failed:', systemVoiceError);
            }
        }
        
        // Generic error handling
        this.showTTSError('Audio not available. Please check device volume and try again.');
    }

    showTTSSuccess(message = 'Audio played successfully') {
        if (this.isMobile) {
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: #4CAF50; color: white; padding: 10px 20px;
                border-radius: 20px; z-index: 1000; font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            feedback.textContent = `✅ ${message}`;
            document.body.appendChild(feedback);
            
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 3000);
        }
    }

    showTTSError(message) {
        console.warn('🔊 TTS Error:', message);
        
        if (this.isMobile) {
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: #FF5722; color: white; padding: 10px 20px;
                border-radius: 20px; z-index: 1000; font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                text-align: center; max-width: 300px;
            `;
            feedback.innerHTML = `❌ ${message}`;
            document.body.appendChild(feedback);
            
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 5000);
        }
    }

    async playWord(word, index) {
        if (!this.isAudioEnabled) return;
        
        // iOS/Mobile: Ensure audio is ready
        if (this.isMobile && !this.mobileAudioReady) {
            try {
                await this.ensureMobileAudioReady();
            } catch (error) {
                console.error('❌ Failed to initialize mobile audio for word:', error);
                this.showTTSError('Tap the main play button first to enable audio');
                return;
            }
        }
        
        // Find the button for this word
        const buttons = document.querySelectorAll('.word-audio-controls .btn');
        const button = buttons[index];
        
        if (button) {
            button.disabled = true;
            button.textContent = '🔊 Playing...';
        }

        try {
            // iOS-optimized speech settings for individual words
            const speechOptions = {
                rate: this.isIOS ? 0.8 : (this.isMobile ? 0.7 : 0.8),
                pitch: 1.1,
                volume: this.isIOS ? 0.9 : 1.0
            };
            
            console.log(`🔊 Playing word "${word}" with iOS-optimized settings`);
            await this.speak(word, speechOptions);
            
        } catch (error) {
            console.error('❌ Error playing word:', error);
            
            // iOS-specific fallback
            if (this.isIOS) {
                try {
                    console.log('🍎 Trying iOS fallback for word:', word);
                    await this.speak(word, { rate: 0.6, volume: 0.8 });
                } catch (fallbackError) {
                    console.error('❌ iOS word fallback failed:', fallbackError);
                    this.showTTSError(`Could not play word: ${word}`);
                }
            } else if (this.isMobile) {
                try {
                    await this.speak(word, { rate: 0.6 });
                } catch (fallbackError) {
                    console.error('❌ Mobile word playback fallback failed:', fallbackError);
                    this.showTTSError(`Could not play word: ${word}`);
                }
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = '🔊 Listen';
            }
        }
    }

    async playWordInContext(word, index) {
        if (!this.isAudioEnabled || !this.selectedParagraph) return;

        // iOS/Mobile: Ensure audio is ready
        if (this.isMobile && !this.mobileAudioReady) {
            await this.playWord(word, index); // Fallback to individual word
            return;
        }

        // Find the sentence containing this word
        const sentences = this.completeParagraphText.split(/[.!?]+/);
        const wordInSentence = sentences.find(sentence => 
            sentence.toLowerCase().includes(word.toLowerCase())
        );

        if (wordInSentence) {
            let contextText = `Listen to the word in context: ${wordInSentence.trim()}.`;
            
            // iOS optimization: Keep context short
            if (this.isIOS && contextText.length > 100) {
                contextText = `The word is: ${word}.`;
            }
            
            const speechOptions = {
                rate: this.isIOS ? 0.7 : 0.85,
                volume: this.isIOS ? 0.9 : 1.0
            };
            
            try {
                await this.speak(contextText, speechOptions);
            } catch (error) {
                console.error('❌ Error playing word in context:', error);
                // Fallback to just the word
                await this.playWord(word, index);
            }
        } else {
            // Fallback to just the word
            await this.playWord(word, index);
        }
    }

    validateAnswer(userAnswer, correctWord) {
        if (!userAnswer) return false;
        
        // Clean up both answers for comparison
        const cleanUser = userAnswer.toLowerCase().trim();
        const cleanCorrect = correctWord.toLowerCase().trim();
        
        // Exact match
        if (cleanUser === cleanCorrect) return true;
        
        // Handle common alternative spellings and typos
        const alternativeSpellings = {
            'grey': ['gray'],
            'gray': ['grey'],
            'centre': ['center'],
            'center': ['centre'],
            'colour': ['color'],
            'color': ['colour'],
            'favour': ['favor'],
            'favor': ['favour'],
            'honour': ['honor'],
            'honor': ['honour']
        };
        
        if (alternativeSpellings[cleanCorrect]?.includes(cleanUser)) {
            return true;
        }
        
        // Check for simple typos (one character difference)
        if (Math.abs(cleanUser.length - cleanCorrect.length) <= 1) {
            let differences = 0;
            const maxLength = Math.max(cleanUser.length, cleanCorrect.length);
            
            for (let i = 0; i < maxLength; i++) {
                if (cleanUser[i] !== cleanCorrect[i]) {
                    differences++;
                }
            }
            
            // Allow one character difference for longer words
            if (differences <= 1 && cleanCorrect.length >= 5) {
                return true;
            }
        }
        
        return false;
    }

    async submitAnswers() {
        const submitBtn = document.getElementById('submit-answer');
        const nextBtn = document.getElementById('next-question');
        
        // Disable submit button during processing
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Checking...';
        }

        let allCompleted = true;
        let newlyCompleted = [];

        // Check each answer
        for (let i = 0; i < this.selectedWords.length; i++) {
            const input = document.getElementById(`answer-${i}`);
            const feedbackArea = document.getElementById(`feedback-${i}`);
            const quizDataItem = this.quizData[i];
            const userAnswer = this.currentAnswers[i] || '';
            
            if (!input || !feedbackArea || quizDataItem.completed) continue;

            const isCorrect = this.validateAnswer(userAnswer, quizDataItem.word);
            quizDataItem.attempts++;
            quizDataItem.userAnswers.push(userAnswer);

            if (isCorrect) {
                // Correct answer
                input.classList.remove('incorrect', 'second-chance');
                input.classList.add('correct');
                feedbackArea.innerHTML = '<span class="feedback-correct">✓ Correct!</span>';
                
                quizDataItem.correct = true;
                quizDataItem.completed = true;
                
                if (quizDataItem.attempts === 1) {
                    quizDataItem.firstAttemptCorrect = true;
                } else {
                    quizDataItem.secondAttemptCorrect = true;
                }
                
                newlyCompleted.push(i);

                // Notify accessibility manager of correct answer
                if (window.accessibilityManager) {
                    window.accessibilityManager.updateQuizAriaLabels(
                        i + 1, this.selectedWords.length, true, quizDataItem.attempts > 1
                    );
                }
                
            } else {
                // Incorrect answer
                if (quizDataItem.attempts === 1) {
                    // First attempt - give second chance
                    input.classList.remove('correct');
                    input.classList.add('incorrect', 'second-chance');
                    feedbackArea.innerHTML = `
                        <span class="feedback-incorrect">✗ Try again!</span>
                        <button type="button" class="btn btn-audio btn-small context-audio-btn" 
                                onclick="quiz.playWordInContext('${quizDataItem.word}', ${i})">
                            🔊 Hear in Context
                        </button>
                    `;
                    
                    allCompleted = false;

                    // Update accessibility info for second chance
                    if (window.accessibilityManager) {
                        window.accessibilityManager.updateAnswerInputAccessibility(
                            input, i + 1, quizDataItem.word.length, true
                        );
                        window.accessibilityManager.updateQuizAriaLabels(
                            i + 1, this.selectedWords.length, false, false
                        );
                    }
                    
                    // Play word in context automatically
                    setTimeout(() => {
                        this.playWordInContext(quizDataItem.word, i);
                    }, 500);
                    
                } else {
                    // Second attempt - show correct answer
                    input.classList.remove('second-chance');
                    input.classList.add('incorrect');
                    feedbackArea.innerHTML = `
                        <span class="feedback-incorrect">✗ The correct spelling is: <strong>${quizDataItem.word}</strong></span>
                    `;
                    
                    quizDataItem.completed = true;
                    newlyCompleted.push(i);
                }
            }
            
            // Update time spent
            quizDataItem.timeSpent = (new Date() - quizDataItem.startTime) / 1000;
        }

        // Update progress
        this.updateProgress();

        // Check if quiz is complete
        if (allCompleted) {
            // All words completed - finish quiz
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
            if (nextBtn) {
                nextBtn.textContent = 'View Results';
                nextBtn.style.display = 'inline-block';
            }
        } else {
            // Some words need second attempts
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Check Answers';
            }
            
            // Focus on first incorrect answer
            const firstIncorrect = document.querySelector('.answer-input.second-chance');
            if (firstIncorrect) {
                firstIncorrect.focus();
            }
        }
    }

    nextQuestion() {
        this.showResults();
    }

    showResults() {
        this.quizEndTime = new Date();
        
        // Save to Supabase database
        this.saveToSupabase();
        
        this.showScreen('results-screen');
        this.generateDetailedResults();

        // Notify accessibility manager
        if (window.accessibilityManager) {
            document.dispatchEvent(new CustomEvent('quiz-state-change', {
                detail: { type: 'quiz-completed' }
            }));
        }
    }

    generateDetailedResults() {
        const summaryDiv = document.getElementById('results-summary');
        const detailsDiv = document.getElementById('results-details');
        
        if (!summaryDiv || !detailsDiv) return;

        // Calculate statistics
        const stats = this.calculateQuizStatistics();
        
        // Generate summary
        summaryDiv.innerHTML = `
            <h3>Excellent work, ${this.studentName || 'Student'}! 🎉</h3>
            <div class="score-summary">
                <div class="score-item">
                    <span class="score-number">${stats.firstAttemptCorrect}</span>
                    <span class="score-label">Correct on 1st try</span>
                </div>
                <div class="score-item">
                    <span class="score-number">${stats.secondAttemptCorrect}</span>
                    <span class="score-label">Correct on 2nd try</span>
                </div>
                <div class="score-item">
                    <span class="score-number">${stats.totalScore}</span>
                    <span class="score-label">Total out of ${this.totalQuestions}</span>
                </div>
            </div>
            <div class="time-summary">
                <p><strong>Time taken:</strong> ${stats.timeTaken}</p>
                <p><strong>Overall accuracy:</strong> ${stats.accuracy}%</p>
            </div>
            <div class="performance-message">
                ${this.getPerformanceMessage(stats)}
            </div>
        `;

        // Generate detailed breakdown
        detailsDiv.innerHTML = `
            <h4>Word-by-word Results:</h4>
            <div class="word-results">
                ${this.quizData.map((data, index) => `
                    <div class="word-result ${data.correct ? 'correct' : 'incorrect'}">
                        <div class="word-info">
                            <span class="word-number">${index + 1}.</span>
                            <span class="word-text">${data.word}</span>
                            <span class="word-status">
                                ${data.firstAttemptCorrect ? '✓ 1st try' : 
                                  data.secondAttemptCorrect ? '✓ 2nd try' : 
                                  '✗ Incorrect'}
                            </span>
                        </div>
                        <div class="word-attempts">
                            ${data.userAnswers.map((answer, i) => `
                                <span class="attempt ${i === 0 ? 'first' : 'second'}">
                                    Attempt ${i + 1}: "${answer}"
                                </span>
                            `).join('')}
                        </div>
                        <div class="word-audio">
                            <button type="button" class="btn btn-audio btn-small" 
                                    onclick="quiz.playWord('${data.word}', ${index})">
                                🔊 Listen to correct pronunciation
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    calculateQuizStatistics() {
        const firstAttemptCorrect = this.quizData.filter(d => d.firstAttemptCorrect).length;
        const secondAttemptCorrect = this.quizData.filter(d => d.secondAttemptCorrect).length;
        const totalCorrect = this.quizData.filter(d => d.correct).length;
        const totalTime = Math.round((this.quizEndTime - this.quizStartTime) / 1000);
        
        return {
            firstAttemptCorrect,
            secondAttemptCorrect,
            totalScore: totalCorrect,
            accuracy: Math.round((totalCorrect / this.totalQuestions) * 100),
            timeTaken: this.formatTime(totalTime),
            averageTimePerWord: Math.round(totalTime / this.totalQuestions)
        };
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getPerformanceMessage(stats) {
        const accuracy = stats.accuracy;
        
        if (accuracy >= 90) {
            return `<p class="performance-excellent">🌟 Outstanding! You're an excellent speller!</p>`;
        } else if (accuracy >= 75) {
            return `<p class="performance-good">👍 Great job! Keep practicing those tricky words.</p>`;
        } else if (accuracy >= 60) {
            return `<p class="performance-fair">📚 Good effort! Regular practice will help you improve.</p>`;
        } else {
            return `<p class="performance-needs-work">💪 Keep trying! Spelling takes practice - you're getting better!</p>`;
        }
    }

    async saveToSupabase() {
        try {
            // Check if database service is available and connected
            if (!window.databaseService || !window.databaseService.isConnected) {
                console.warn('⚠️ Database service not available - results saved locally only');
                return;
            }

            console.log('🚀 Starting to save quiz results to database...');
            
            const stats = this.calculateQuizStatistics();
            const totalTimeSeconds = Math.round((this.quizEndTime - this.quizStartTime) / 1000);

            // Prepare session data for the database
            const sessionData = {
                studentName: this.studentName || 'Anonymous Student',
                startTime: this.quizStartTime.toISOString(),
                endTime: this.quizEndTime.toISOString(),
                totalQuestions: this.totalQuestions,
                totalCorrect: stats.totalScore,
                firstAttemptCorrect: stats.firstAttemptCorrect,
                secondAttemptCorrect: stats.secondAttemptCorrect,
                totalTimeSeconds: totalTimeSeconds,
                paragraphId: this.selectedParagraph?.id,
                paragraphTitle: this.selectedParagraph?.title || 'Unknown Paragraph',
                difficulty: this.teacherSettings?.difficulty || 'mixed'
            };

            // Save the main quiz session first
            console.log('💾 Saving quiz session...');
            const savedSession = await window.databaseService.saveQuizSession(sessionData);

            if (savedSession && savedSession.id) {
                // Prepare word responses data
                const wordData = this.quizData.map((word, index) => ({
                    word: word.word,
                    userAnswers: word.userAnswers || [],
                    attempts: word.attempts || 0,
                    correct: word.correct || false,
                    firstAttemptCorrect: word.firstAttemptCorrect || false,
                    secondAttemptCorrect: word.secondAttemptCorrect || false,
                    timeSpent: word.timeSpent || 0
                }));

                // Try to save word responses with detailed debugging
                console.log('📝 Attempting to save word responses...');
                console.log('📝 Word data to save:', wordData);
                console.log('📝 Quiz session ID:', savedSession.id);
                
                try {
                    const result = await window.databaseService.saveWordResponses(savedSession.id, wordData);
                    console.log('✅ Word responses saved successfully!', result);
                } catch (wordError) {
                    console.error('❌ Word responses failed:', wordError);
                    console.error('❌ Error details:', wordError.message);
                    console.warn('⚠️ Quiz session saved but word responses failed');
                }

                console.log('🎉 All quiz results saved successfully to database!');
                
                // Show success notification to the user
                this.showDatabaseSaveNotification('success');
            } else {
                throw new Error('Failed to save quiz session - no ID returned');
            }

        } catch (error) {
            console.error('💥 Failed to save quiz results to database:', error);
            this.showDatabaseSaveNotification('error', error.message);
            
            // Still continue with the quiz - don't let database errors break the experience
            console.log('📄 Quiz will continue working locally');
        }
    }

    showDatabaseSaveNotification(type, message = '') {
        const notification = document.createElement('div');
        notification.className = `database-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;

        if (type === 'success') {
            notification.style.background = '#10b981';
            notification.style.color = 'white';
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">✅</span>
                    <div>
                        <strong>Results Saved!</strong><br>
                        Your quiz data has been saved to the database.
                    </div>
                </div>
            `;
        } else {
            notification.style.background = '#ef4444';
            notification.style.color = 'white';
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">❌</span>
                    <div>
                        <strong>Database Save Failed</strong><br>
                        ${message || 'Results saved locally only.'}
                    </div>
                </div>
            `;
        }

        // Add animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 5000);
    }

    restartQuiz() {
        // Stop any ongoing speech
        this.stopSpeaking();
        
        // Reset all data
        this.currentQuestion = 0;
        this.selectedWords = [];
        this.selectedParagraph = null;
        this.quizData = [];
        this.completeParagraphText = '';
        this.currentAnswers = {};
        this.answeredWordsCount = 0;
        this.quizStartTime = null;
        this.quizEndTime = null;
        
        // Clear student name
        const studentNameInput = document.getElementById('student-name');
        if (studentNameInput) {
            studentNameInput.value = '';
        }
        
        // Return to start screen
        this.showScreen('start-screen');
    }

    exportResults() {
        if (typeof DataManager === 'undefined') {
            alert('Data management system not loaded. Please refresh the page.');
            return;
        }
        
        // Save current quiz result
        const quizResult = {
            studentName: this.studentName,
            totalQuestions: this.totalQuestions,
            selectedWords: this.selectedWords,
            paragraphTitle: this.selectedParagraph?.title || 'Unknown',
            quizData: this.quizData,
            statistics: this.calculateQuizStatistics(),
            timeTaken: this.formatTime(Math.round((this.quizEndTime - this.quizStartTime) / 1000))
        };
        
        const dataManager = new DataManager();
        const resultId = dataManager.saveQuizResult(quizResult);
        
        if (resultId) {
            // Show success message with options
            const exportOption = confirm(
                'Quiz results saved successfully!\n\n' +
                'Would you like to:\n' +
                '• Click OK to export this result to Excel\n' +
                '• Click Cancel to view the Teacher Dashboard'
            );
            
            if (exportOption) {
                // Export current result
                dataManager.exportToExcel([quizResult], `${this.studentName || 'Student'}-spelling-result-${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                // Open teacher dashboard
                if (confirm('Open Teacher Dashboard in a new tab?')) {
                    window.open('teacher-dashboard.html', '_blank');
                }
            }
        } else {
            alert('Failed to save quiz results. Please try again.');
        }
    }
}

// Global reference for button onclick handlers
let quiz;

// Function to initialize quiz with retries
function initializeQuiz(attempt = 1) {
    console.log(`Quiz initialization attempt ${attempt}...`);
    
    // Check if required elements exist
    const quizContainer = document.getElementById('quiz-container');
    console.log('Quiz container found:', !!quizContainer);
    console.log('Document ready state:', document.readyState);
    console.log('finalWordBank available:', typeof finalWordBank !== 'undefined', finalWordBank?.length);
    console.log('paragraphTemplates available:', typeof paragraphTemplates !== 'undefined', paragraphTemplates?.length);
    
    if (quizContainer && typeof finalWordBank !== 'undefined' && typeof paragraphTemplates !== 'undefined') {
        console.log('All requirements met - creating SpellingQuiz instance...');
        try {
            quiz = new SpellingQuiz();
            console.log('SpellingQuiz instance created successfully');
            
            // Remove any existing error messages
            const existingErrors = document.querySelectorAll('.quiz-error-message');
            existingErrors.forEach(error => error.remove());
            
            return true; // Success
        } catch (error) {
            console.error('Error creating SpellingQuiz instance:', error);
            showErrorMessage('Quiz Loading Error', 'There was a problem starting the quiz. Please refresh the page and try again.', error.message);
            return false;
        }
    } else {
        const missingItems = [];
        if (!quizContainer) missingItems.push('quiz-container element');
        if (typeof finalWordBank === 'undefined') missingItems.push('finalWordBank data');
        if (typeof paragraphTemplates === 'undefined') missingItems.push('paragraphTemplates data');
        
        console.error('Required elements or data not found:', missingItems);
        
        // If this is not the final attempt, try again after a short delay
        if (attempt < 3) {
            console.log(`Retrying in 500ms... (attempt ${attempt + 1}/3)`);
            setTimeout(() => initializeQuiz(attempt + 1), 500);
            return false;
        }
        
        // Final attempt failed - show error
        showErrorMessage('Setup Error', `The quiz cannot start because some required components are missing: ${missingItems.join(', ')}.`, 'Please check that all files are loaded correctly and refresh the page.');
        return false;
    }
}

function showErrorMessage(title, message, details = '') {
    // Remove any existing error messages
    const existingErrors = document.querySelectorAll('.quiz-error-message');
    existingErrors.forEach(error => error.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'quiz-error-message';
    errorDiv.style.cssText = `
        position: fixed; top: 20px; left: 20px; right: 20px;
        background: #fee2e2; color: #dc2626; padding: 15px;
        border-radius: 8px; border-left: 4px solid #dc2626;
        font-family: Arial, sans-serif; z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    errorDiv.innerHTML = `
        <strong>${title}:</strong> ${message}
        ${details ? `<br><small>${details}</small>` : ''}
        <br><br>
        <button onclick="location.reload()" style="padding: 8px 15px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Refresh Page</button>
        <button onclick="this.parentElement.remove()" style="padding: 8px 15px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Dismiss</button>
    `;
    document.body.appendChild(errorDiv);
}

// Simple direct initialization - bypass complex detection
function directInit() {
    console.log('Direct initialization attempt...');
    
    // Remove any error messages first
    const errorMessages = document.querySelectorAll('.quiz-error-message');
    errorMessages.forEach(msg => msg.remove());
    
    // Check if data is available
    if (typeof finalWordBank !== 'undefined' && typeof paragraphTemplates !== 'undefined') {
        console.log('Data available - creating quiz directly...');
        try {
            window.quiz = new SpellingQuiz();
            console.log('✅ Quiz created successfully!');
            return true;
        } catch (error) {
            console.error('❌ Error creating quiz:', error);
            return false;
        }
    } else {
        console.log('❌ Data not available yet');
        return false;
    }
}

// Try multiple initialization approaches
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - attempting direct initialization...');
    
    if (!directInit()) {
        // If direct init fails, try the old way as fallback
        setTimeout(() => {
            console.log('⏰ Fallback: Trying initialization after delay...');
            if (!window.quiz) {
                initializeQuiz();
            }
        }, 500);
    }
});

// Window load fallback
window.addEventListener('load', () => {
    if (!window.quiz) {
        console.log('🔄 Window loaded - trying direct init again...');
        if (!directInit()) {
            setTimeout(() => {
                console.log('⚡ Final attempt with traditional method...');
                initializeQuiz();
            }, 200);
        }
    }
});

// Last resort fallback
setTimeout(() => {
    if (!window.quiz) {
        console.log('🚨 Last resort: Force creating quiz...');
        directInit();
    }
}, 2000);

// Utility function to check if all Phase 1-4 requirements are met
function checkPhaseRequirements() {
    const requirements = {
        phase1: {
            htmlStructure: {
                title: document.title === 'Interactive Spelling Assessment',
                container: !!document.querySelector('.container'),
                quizContainer: !!document.getElementById('quiz-container'),
                startButton: !!document.getElementById('start-btn'),
                progressIndicator: !!document.getElementById('progress-text')
            },
            wordBank: {
                exists: typeof finalWordBank !== 'undefined',
                hasMinimumWords: finalWordBank && finalWordBank.length >= 50,
                hasParagraphs: typeof paragraphTemplates !== 'undefined' && paragraphTemplates.length >= 5
            }
        },
        phase2: {
            randomSelection: typeof SpellingQuiz.prototype.selectRandomWords === 'function',
            paragraphTemplates: typeof paragraphTemplates !== 'undefined' && paragraphTemplates.length >= 5,
            answerInputs: !!document.getElementById('answer-inputs')
        },
        phase3: {
            speechSynthesis: 'speechSynthesis' in window,
            audioMethods: typeof SpellingQuiz.prototype.speak === 'function',
            playParagraph: typeof SpellingQuiz.prototype.playParagraph === 'function',
            playWord: typeof SpellingQuiz.prototype.playWord === 'function'
        },
        phase4: {
            validation: typeof SpellingQuiz.prototype.validateAnswer === 'function',
            submitLogic: typeof SpellingQuiz.prototype.submitAnswers === 'function',
            statistics: typeof SpellingQuiz.prototype.calculateQuizStatistics === 'function',
            results: typeof SpellingQuiz.prototype.generateDetailedResults === 'function'
        }
    };

    console.log('Phase Requirements Check:', requirements);
    return requirements;
} 