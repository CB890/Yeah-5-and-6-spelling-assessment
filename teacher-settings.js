/**
 * Teacher Settings Manager for Interactive Spelling Assessment
 * Allows teachers to customize quiz parameters for their specific needs
 */

class TeacherSettingsManager {
    constructor() {
        this.defaultSettings = {
            selectedWords: [], // Empty means use random selection
            difficultyLevel: 'mixed', // 'easy', 'medium', 'hard', 'mixed'
            numberOfWords: 15, // 5, 10, 15, 20
            selectedThemes: [], // Empty means all themes available
            timeLimit: null, // null means no time limit, number in minutes
            enableSecondChances: true,
            audioAutoplay: true,
            showWordSpaces: true,
            randomizeWordOrder: true
        };
        
        this.currentSettings = this.loadSettings();
        this.wordsByDifficulty = this.categorizeWordsByDifficulty();
        this.availableThemes = this.getAvailableThemes();
        
        this.init();
    }

    /**
     * Initialize the settings manager
     */
    init() {
        this.bindEvents();
        this.populateInterface();
        this.updatePreview();
    }

    /**
     * Load saved settings from localStorage
     */
    loadSettings() {
        const saved = localStorage.getItem('teacher-quiz-settings');
        if (saved) {
            try {
                return { ...this.defaultSettings, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Error loading teacher settings:', error);
            }
        }
        return { ...this.defaultSettings };
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('teacher-quiz-settings', JSON.stringify(this.currentSettings));
            this.showSaveConfirmation();
            console.log('Teacher settings saved successfully');
        } catch (error) {
            console.error('Error saving teacher settings:', error);
            alert('Error saving settings. Please try again.');
        }
    }

    /**
     * Categorize words by difficulty level based on complexity
     */
    categorizeWordsByDifficulty() {
        const difficulty = {
            easy: [],
            medium: [],
            hard: []
        };

        // Analyze words from the word bank
        Object.entries(finalWordBank).forEach(([category, words]) => {
            words.forEach(word => {
                const complexity = this.analyzeWordComplexity(word);
                difficulty[complexity].push({
                    word: word,
                    category: category,
                    length: word.length
                });
            });
        });

        return difficulty;
    }

    /**
     * Analyze word complexity to determine difficulty
     */
    analyzeWordComplexity(word) {
        let score = 0;
        
        // Length factor
        if (word.length >= 8) score += 2;
        else if (word.length >= 6) score += 1;
        
        // Silent letters
        const silentPatterns = ['ght', 'kn', 'wr', 'mb', 'st', 'lk'];
        if (silentPatterns.some(pattern => word.includes(pattern))) score += 2;
        
        // Double letters
        if (/(.)\1/.test(word)) score += 1;
        
        // Complex endings
        const complexEndings = ['tion', 'sion', 'ough', 'augh', 'eigh'];
        if (complexEndings.some(ending => word.endsWith(ending))) score += 2;
        
        // Irregular spellings
        const irregularPatterns = ['ph', 'gh', 'ch', 'sh', 'th', 'qu'];
        const irregularCount = irregularPatterns.filter(pattern => word.includes(pattern)).length;
        score += irregularCount;
        
        // Determine difficulty
        if (score >= 4) return 'hard';
        if (score >= 2) return 'medium';
        return 'easy';
    }

    /**
     * Get available paragraph themes
     */
    getAvailableThemes() {
        return [
            { id: 'school', name: 'School Adventures', description: 'Classroom and learning activities' },
            { id: 'sports', name: 'Sports & Games', description: 'Physical activities and competitions' },
            { id: 'science', name: 'Science Discovery', description: 'Experiments and scientific exploration' },
            { id: 'community', name: 'Community Helpers', description: 'People who help in our community' },
            { id: 'library', name: 'Library Quest', description: 'Books, reading, and library adventures' }
        ];
    }

    /**
     * Bind event listeners for the settings interface
     */
    bindEvents() {
        // Save settings button
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Reset to defaults
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefaults());
        }

        // Export settings
        const exportBtn = document.getElementById('export-settings');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSettings());
        }

        // Import settings
        const importBtn = document.getElementById('import-settings');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importSettings());
        }

        // Apply settings to next quiz
        const applyBtn = document.getElementById('apply-settings');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applySettingsToQuiz());
        }

        // Live preview updates
        this.bindPreviewUpdates();
    }

    /**
     * Bind events for live preview updates
     */
    bindPreviewUpdates() {
        // Difficulty level change
        const difficultySelect = document.getElementById('difficulty-level');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.currentSettings.difficultyLevel = e.target.value;
                this.updateWordSelection();
                this.updatePreview();
            });
        }

        // Number of words change
        const wordsSelect = document.getElementById('number-of-words');
        if (wordsSelect) {
            wordsSelect.addEventListener('change', (e) => {
                this.currentSettings.numberOfWords = parseInt(e.target.value);
                this.updateWordSelection();
                this.updatePreview();
            });
        }

        // Theme selection change
        const themeCheckboxes = document.querySelectorAll('input[name="theme"]');
        themeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedThemes();
                this.updatePreview();
            });
        });

        // Time limit toggle
        const timeLimitToggle = document.getElementById('enable-time-limit');
        if (timeLimitToggle) {
            timeLimitToggle.addEventListener('change', (e) => {
                const timeInput = document.getElementById('time-limit-minutes');
                if (e.target.checked && timeInput) {
                    this.currentSettings.timeLimit = parseInt(timeInput.value) || 10;
                    timeInput.disabled = false;
                } else {
                    this.currentSettings.timeLimit = null;
                    if (timeInput) timeInput.disabled = true;
                }
                this.updatePreview();
            });
        }

        const timeInput = document.getElementById('time-limit-minutes');
        if (timeInput) {
            timeInput.addEventListener('change', (e) => {
                if (this.currentSettings.timeLimit !== null) {
                    this.currentSettings.timeLimit = parseInt(e.target.value) || 10;
                    this.updatePreview();
                }
            });
        }

        // Other options
        const optionCheckboxes = ['enable-second-chances', 'audio-autoplay', 'show-word-spaces', 'randomize-order'];
        optionCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    const setting = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace('enable', '').replace(/^(.)/, (g) => g.toLowerCase());
                    if (setting === 'secondChances') {
                        this.currentSettings.enableSecondChances = e.target.checked;
                    } else if (setting === 'audioAutoplay') {
                        this.currentSettings.audioAutoplay = e.target.checked;
                    } else if (setting === 'showWordSpaces') {
                        this.currentSettings.showWordSpaces = e.target.checked;
                    } else if (setting === 'randomizeOrder') {
                        this.currentSettings.randomizeWordOrder = e.target.checked;
                    }
                    this.updatePreview();
                });
            }
        });
    }

    /**
     * Populate the settings interface with current values
     */
    populateInterface() {
        // Difficulty level
        const difficultySelect = document.getElementById('difficulty-level');
        if (difficultySelect) {
            difficultySelect.value = this.currentSettings.difficultyLevel;
        }

        // Number of words
        const wordsSelect = document.getElementById('number-of-words');
        if (wordsSelect) {
            wordsSelect.value = this.currentSettings.numberOfWords.toString();
        }

        // Themes
        const themeCheckboxes = document.querySelectorAll('input[name="theme"]');
        themeCheckboxes.forEach(checkbox => {
            if (this.currentSettings.selectedThemes.length === 0) {
                checkbox.checked = true; // All themes selected by default
            } else {
                checkbox.checked = this.currentSettings.selectedThemes.includes(checkbox.value);
            }
        });

        // Time limit
        const timeLimitToggle = document.getElementById('enable-time-limit');
        const timeInput = document.getElementById('time-limit-minutes');
        if (timeLimitToggle && timeInput) {
            timeLimitToggle.checked = this.currentSettings.timeLimit !== null;
            timeInput.value = this.currentSettings.timeLimit || 10;
            timeInput.disabled = this.currentSettings.timeLimit === null;
        }

        // Other options
        const options = {
            'enable-second-chances': this.currentSettings.enableSecondChances,
            'audio-autoplay': this.currentSettings.audioAutoplay,
            'show-word-spaces': this.currentSettings.showWordSpaces,
            'randomize-order': this.currentSettings.randomizeWordOrder
        };

        Object.entries(options).forEach(([id, value]) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = value;
            }
        });

        // Populate word bank
        this.populateWordBank();
    }

    /**
     * Populate the word bank interface
     */
    populateWordBank() {
        const wordBankContainer = document.getElementById('word-bank-container');
        if (!wordBankContainer) return;

        wordBankContainer.innerHTML = '';

        // Create tabs for each difficulty
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'word-bank-tabs';
        
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            const tab = document.createElement('button');
            tab.className = `word-bank-tab ${difficulty === 'easy' ? 'active' : ''}`;
            tab.textContent = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} (${this.wordsByDifficulty[difficulty].length} words)`;
            tab.onclick = () => this.showWordsByDifficulty(difficulty);
            tabsContainer.appendChild(tab);
        });

        wordBankContainer.appendChild(tabsContainer);

        // Create word lists
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            const wordsContainer = document.createElement('div');
            wordsContainer.id = `words-${difficulty}`;
            wordsContainer.className = `words-list ${difficulty === 'easy' ? 'active' : ''}`;

            const words = this.wordsByDifficulty[difficulty];
            words.forEach((wordObj, index) => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `word-${difficulty}-${index}`;
                checkbox.value = wordObj.word;
                checkbox.checked = this.currentSettings.selectedWords.includes(wordObj.word) || this.currentSettings.selectedWords.length === 0;
                checkbox.addEventListener('change', () => this.updateSelectedWords());

                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.innerHTML = `
                    <span class="word-text">${wordObj.word}</span>
                    <span class="word-meta">${wordObj.category} • ${wordObj.length} letters</span>
                `;

                wordItem.appendChild(checkbox);
                wordItem.appendChild(label);
                wordsContainer.appendChild(wordItem);
            });

            wordBankContainer.appendChild(wordsContainer);
        });

        // Add select all/none buttons
        this.addWordSelectionControls(wordBankContainer);
    }

    /**
     * Add controls for selecting/deselecting all words
     */
    addWordSelectionControls(container) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'word-selection-controls';
        
        const selectAllBtn = document.createElement('button');
        selectAllBtn.textContent = 'Select All Visible';
        selectAllBtn.className = 'btn btn-small btn-secondary';
        selectAllBtn.onclick = () => this.selectAllWords(true);

        const selectNoneBtn = document.createElement('button');
        selectNoneBtn.textContent = 'Select None';
        selectNoneBtn.className = 'btn btn-small btn-secondary';
        selectNoneBtn.onclick = () => this.selectAllWords(false);

        const autoSelectBtn = document.createElement('button');
        autoSelectBtn.textContent = 'Auto-Select by Difficulty';
        autoSelectBtn.className = 'btn btn-small btn-primary';
        autoSelectBtn.onclick = () => this.autoSelectByDifficulty();

        controlsDiv.appendChild(selectAllBtn);
        controlsDiv.appendChild(selectNoneBtn);
        controlsDiv.appendChild(autoSelectBtn);
        container.insertBefore(controlsDiv, container.firstChild);
    }

    /**
     * Show words by difficulty level
     */
    showWordsByDifficulty(difficulty) {
        // Update tabs
        document.querySelectorAll('.word-bank-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.word-bank-tab:nth-child(${['easy', 'medium', 'hard'].indexOf(difficulty) + 1})`).classList.add('active');

        // Update word lists
        document.querySelectorAll('.words-list').forEach(list => {
            list.classList.remove('active');
        });
        document.getElementById(`words-${difficulty}`).classList.add('active');
    }

    /**
     * Select/deselect all visible words
     */
    selectAllWords(select) {
        const activeList = document.querySelector('.words-list.active');
        if (activeList) {
            const checkboxes = activeList.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = select;
            });
            this.updateSelectedWords();
        }
    }

    /**
     * Auto-select words based on difficulty setting
     */
    autoSelectByDifficulty() {
        const difficulty = this.currentSettings.difficultyLevel;
        
        // Clear all selections first
        document.querySelectorAll('.words-list input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        if (difficulty === 'mixed') {
            // Select mix from all levels
            this.selectMixedDifficulty();
        } else if (difficulty !== 'custom') {
            // Select from specific difficulty
            const targetList = document.getElementById(`words-${difficulty}`);
            if (targetList) {
                const checkboxes = targetList.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
            }
        }

        this.updateSelectedWords();
    }

    /**
     * Select a balanced mix of difficulties
     */
    selectMixedDifficulty() {
        const totalWords = this.currentSettings.numberOfWords;
        const easyCount = Math.ceil(totalWords * 0.4);
        const mediumCount = Math.ceil(totalWords * 0.4);
        const hardCount = totalWords - easyCount - mediumCount;

        this.selectWordsFromDifficulty('easy', easyCount);
        this.selectWordsFromDifficulty('medium', mediumCount);
        this.selectWordsFromDifficulty('hard', hardCount);
    }

    /**
     * Select specific number of words from a difficulty level
     */
    selectWordsFromDifficulty(difficulty, count) {
        const container = document.getElementById(`words-${difficulty}`);
        if (container) {
            const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
            const shuffled = checkboxes.sort(() => 0.5 - Math.random());
            shuffled.slice(0, count).forEach(checkbox => {
                checkbox.checked = true;
            });
        }
    }

    /**
     * Update selected words from checkboxes
     */
    updateSelectedWords() {
        const selectedWords = [];
        document.querySelectorAll('.words-list input[type="checkbox"]:checked').forEach(checkbox => {
            selectedWords.push(checkbox.value);
        });
        
        this.currentSettings.selectedWords = selectedWords;
        this.updatePreview();
    }

    /**
     * Update word selection based on difficulty and count
     */
    updateWordSelection() {
        if (this.currentSettings.difficultyLevel !== 'custom') {
            this.autoSelectByDifficulty();
        }
    }

    /**
     * Update selected themes from checkboxes
     */
    updateSelectedThemes() {
        const selectedThemes = [];
        document.querySelectorAll('input[name="theme"]:checked').forEach(checkbox => {
            selectedThemes.push(checkbox.value);
        });
        
        this.currentSettings.selectedThemes = selectedThemes;
    }

    /**
     * Update the preview section
     */
    updatePreview() {
        const previewContainer = document.getElementById('settings-preview');
        if (!previewContainer) return;

        const wordCount = this.currentSettings.selectedWords.length || this.currentSettings.numberOfWords;
        const timeText = this.currentSettings.timeLimit ? `${this.currentSettings.timeLimit} minutes` : 'No time limit';
        const themesText = this.currentSettings.selectedThemes.length === 0 ? 'All themes' : 
                          this.currentSettings.selectedThemes.length === 1 ? 
                          this.availableThemes.find(t => t.id === this.currentSettings.selectedThemes[0])?.name :
                          `${this.currentSettings.selectedThemes.length} themes selected`;

        previewContainer.innerHTML = `
            <h4>Quiz Preview</h4>
            <div class="preview-stats">
                <div class="preview-stat">
                    <span class="stat-number">${wordCount}</span>
                    <span class="stat-label">Words</span>
                </div>
                <div class="preview-stat">
                    <span class="stat-text">${this.currentSettings.difficultyLevel}</span>
                    <span class="stat-label">Difficulty</span>
                </div>
                <div class="preview-stat">
                    <span class="stat-text">${timeText}</span>
                    <span class="stat-label">Time Limit</span>
                </div>
                <div class="preview-stat">
                    <span class="stat-text">${themesText}</span>
                    <span class="stat-label">Themes</span>
                </div>
            </div>
            <div class="preview-options">
                <p><strong>Options:</strong></p>
                <ul>
                    <li>Second chances: ${this.currentSettings.enableSecondChances ? '✅' : '❌'}</li>
                    <li>Audio autoplay: ${this.currentSettings.audioAutoplay ? '✅' : '❌'}</li>
                    <li>Word spaces: ${this.currentSettings.showWordSpaces ? '✅' : '❌'}</li>
                    <li>Random order: ${this.currentSettings.randomizeWordOrder ? '✅' : '❌'}</li>
                </ul>
            </div>
        `;
    }

    /**
     * Reset settings to defaults
     */
    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            this.currentSettings = { ...this.defaultSettings };
            this.populateInterface();
            this.updatePreview();
        }
    }

    /**
     * Export settings to JSON file
     */
    exportSettings() {
        const settings = {
            ...this.currentSettings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `spelling-quiz-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    /**
     * Import settings from JSON file
     */
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const settings = JSON.parse(e.target.result);
                        this.currentSettings = { ...this.defaultSettings, ...settings };
                        this.populateInterface();
                        this.updatePreview();
                        alert('Settings imported successfully!');
                    } catch (error) {
                        alert('Error importing settings. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    /**
     * Apply current settings to the quiz
     */
    applySettingsToQuiz() {
        this.saveSettings();
        
        // Store settings for quiz to use
        localStorage.setItem('active-quiz-settings', JSON.stringify(this.currentSettings));
        
        // Redirect to quiz with custom settings
        window.location.href = 'index.html?custom=true';
    }

    /**
     * Show save confirmation
     */
    showSaveConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.className = 'save-confirmation';
        confirmation.textContent = '✅ Settings saved successfully!';
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #26de81;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(38, 222, 129, 0.3);
        `;
        
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.remove();
        }, 3000);
    }

    /**
     * Get current settings for quiz use
     */
    getSettingsForQuiz() {
        return { ...this.currentSettings };
    }

    /**
     * Generate word list based on current settings
     */
    generateCustomWordList() {
        if (this.currentSettings.selectedWords.length > 0) {
            // Use specifically selected words
            let words = [...this.currentSettings.selectedWords];
            
            if (this.currentSettings.randomizeWordOrder) {
                words = words.sort(() => 0.5 - Math.random());
            }
            
            return words.slice(0, this.currentSettings.numberOfWords);
        } else {
            // Use difficulty-based selection
            return this.generateWordsByDifficulty();
        }
    }

    /**
     * Generate words based on difficulty setting
     */
    generateWordsByDifficulty() {
        const difficulty = this.currentSettings.difficultyLevel;
        const count = this.currentSettings.numberOfWords;
        
        let availableWords = [];
        
        if (difficulty === 'mixed') {
            // Mix of all difficulties
            const easyCount = Math.ceil(count * 0.4);
            const mediumCount = Math.ceil(count * 0.4);
            const hardCount = count - easyCount - mediumCount;
            
            availableWords = [
                ...this.getRandomWordsFromDifficulty('easy', easyCount),
                ...this.getRandomWordsFromDifficulty('medium', mediumCount),
                ...this.getRandomWordsFromDifficulty('hard', hardCount)
            ];
        } else {
            availableWords = this.getRandomWordsFromDifficulty(difficulty, count);
        }
        
        if (this.currentSettings.randomizeWordOrder) {
            availableWords = availableWords.sort(() => 0.5 - Math.random());
        }
        
        return availableWords.slice(0, count);
    }

    /**
     * Get random words from specific difficulty
     */
    getRandomWordsFromDifficulty(difficulty, count) {
        const words = this.wordsByDifficulty[difficulty] || [];
        const shuffled = words.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(wordObj => wordObj.word);
    }
}

// Initialize teacher settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on teacher settings page
    if (document.getElementById('teacher-settings-container')) {
        window.teacherSettings = new TeacherSettingsManager();
    }
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeacherSettingsManager;
} 