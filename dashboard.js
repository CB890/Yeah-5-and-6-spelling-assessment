/**
 * Enhanced Teacher Dashboard with Advanced Analytics
 * Integrates with AnalyticsEngine for comprehensive reporting
 */

class TeacherDashboard {
    constructor() {
        this.dataManager = new DataManager();
        this.analyticsEngine = null;
        this.currentFilters = {};
        this.refreshInterval = null;
        
        // Initialize when analytics engine is available
        this.initializeAnalytics();
    }

    initializeAnalytics() {
        if (typeof AnalyticsEngine !== 'undefined') {
            this.analyticsEngine = new AnalyticsEngine();
            this.loadDashboardData();
        } else {
            // Retry after a short delay
            setTimeout(() => this.initializeAnalytics(), 100);
        }
    }

    loadDashboardData() {
        try {
            this.updateOverviewTab();
            this.updateStudentsTab();
            this.updateAnalyticsTab();
            this.updateExportTab();
            this.updateDataManagement();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data. Please refresh the page.');
        }
    }

    updateOverviewTab() {
        const results = this.dataManager.getAllResults();
        
        // Update statistics cards
        this.updateStatistic('total-quizzes', results.length);
        this.updateStatistic('unique-students', new Set(results.map(r => r.studentName || 'Anonymous')).size);
        
        if (results.length > 0) {
            const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
            const averageWords = results.reduce((sum, r) => sum + r.totalWords, 0) / results.length;
            const averagePercentage = Math.round((averageScore / averageWords) * 100);
            
            const totalTime = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
            const hours = Math.floor(totalTime / 3600);
            const minutes = Math.floor((totalTime % 3600) / 60);
            
            this.updateStatistic('average-score', `${averagePercentage}%`);
            this.updateStatistic('total-time', `${hours}h ${minutes}m`);
        } else {
            this.updateStatistic('average-score', '0%');
            this.updateStatistic('total-time', '0h 0m');
        }

        // Update recent activity
        this.updateRecentActivity(results);
        
        // Update difficult words
        if (this.analyticsEngine) {
            this.updateDifficultWords();
        }
    }

    updateStudentsTab() {
        if (!this.analyticsEngine) return;
        
        const classReport = this.analyticsEngine.generateClassReport(this.currentFilters);
        if (!classReport) {
            document.getElementById('student-list').innerHTML = '<p class="no-data">No student data available</p>';
            return;
        }

        const studentList = document.getElementById('student-list');
        studentList.innerHTML = '';

        classReport.studentPerformance.forEach(student => {
            const studentCard = this.createStudentCard(student);
            studentList.appendChild(studentCard);
        });
    }

    updateAnalyticsTab() {
        if (!this.analyticsEngine) return;
        
        // Update word performance analysis
        this.updateWordPerformanceAnalysis();
        
        // Update top performers
        this.updateTopPerformers();
        
        // Update class trends
        this.updateClassTrends();
    }

    updateWordPerformanceAnalysis() {
        const wordAnalysis = this.analyticsEngine.analyzeWordDifficulty(this.currentFilters);
        
        // Most difficult words
        const difficultWordsContainer = document.getElementById('analytics-difficult-words');
        this.populateWordTable(difficultWordsContainer, wordAnalysis.slice(0, 10), 'difficult');
        
        // Easiest words (reverse order, lowest difficulty score first)
        const easyWordsContainer = document.getElementById('analytics-easy-words');
        const easyWords = [...wordAnalysis].reverse().slice(0, 10);
        this.populateWordTable(easyWordsContainer, easyWords, 'easy');
    }

    updateTopPerformers() {
        const classReport = this.analyticsEngine.generateClassReport(this.currentFilters);
        if (!classReport) return;
        
        const topPerformersContainer = document.getElementById('top-performers');
        topPerformersContainer.innerHTML = '';
        
        const topStudents = classReport.studentPerformance.slice(0, 5);
        topStudents.forEach((student, index) => {
            const performerItem = document.createElement('div');
            performerItem.className = 'performer-item';
            
            performerItem.innerHTML = `
                <div class="performer-rank">#${index + 1}</div>
                <div class="performer-info">
                    <div class="performer-name">${student.name}</div>
                    <div class="performer-stats">
                        <span class="score-badge score-${this.getScoreClass(student.averageScore)}">${student.averageScore}%</span>
                        <span class="quiz-count">${student.totalQuizzes} quizzes</span>
                        ${student.improvement > 0 ? `<span class="improvement positive">+${student.improvement}%</span>` : 
                          student.improvement < 0 ? `<span class="improvement negative">${student.improvement}%</span>` : ''}
                    </div>
                </div>
            `;
            
            topPerformersContainer.appendChild(performerItem);
        });
    }

    updateClassTrends() {
        const classReport = this.analyticsEngine.generateClassReport(this.currentFilters);
        if (!classReport || !classReport.trends) return;
        
        // Create a simple trend visualization
        const trendsContainer = document.getElementById('class-trends');
        if (!trendsContainer) return;
        
        trendsContainer.innerHTML = '<h4>Weekly Performance Trends</h4>';
        
        classReport.trends.forEach(week => {
            const weekItem = document.createElement('div');
            weekItem.className = 'trend-item';
            weekItem.innerHTML = `
                <div class="trend-week">Week of ${new Date(week.week).toLocaleDateString()}</div>
                <div class="trend-score">${week.averageScore}% avg</div>
                <div class="trend-details">${week.totalQuizzes} quizzes, ${week.uniqueStudents} students</div>
            `;
            trendsContainer.appendChild(weekItem);
        });
    }

    updateExportTab() {
        this.setupExportFunctionality();
        this.populateStudentSelect();
    }

    updateDataManagement() {
        // Update storage size
        const results = this.dataManager.getAllResults();
        const storageSize = this.calculateStorageSize(results);
        document.getElementById('storage-size').textContent = storageSize;
        
        // Update date ranges
        if (results.length > 0) {
            const dates = results.map(r => new Date(r.timestamp)).sort((a, b) => a - b);
            document.getElementById('oldest-result').textContent = dates[0].toLocaleDateString();
            document.getElementById('latest-result').textContent = dates[dates.length - 1].toLocaleDateString();
        } else {
            document.getElementById('oldest-result').textContent = 'N/A';
            document.getElementById('latest-result').textContent = 'N/A';
        }
    }

    // Helper Methods

    updateStatistic(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateRecentActivity(results) {
        const recentContainer = document.getElementById('recent-activity');
        recentContainer.innerHTML = '';
        
        const recentResults = results
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        
        if (recentResults.length === 0) {
            recentContainer.innerHTML = '<p class="no-data">No recent activity</p>';
            return;
        }
        
        recentResults.forEach(result => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const percentage = Math.round((result.score / result.totalWords) * 100);
            const scoreClass = this.getScoreClass(percentage);
            
            activityItem.innerHTML = `
                <div class="activity-info">
                    <div class="student-name">${result.studentName || 'Anonymous'}</div>
                    <div class="activity-details">
                        ${new Date(result.timestamp).toLocaleDateString()} at ${new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                </div>
                <div class="score-badge score-${scoreClass}">${percentage}%</div>
            `;
            
            recentContainer.appendChild(activityItem);
        });
    }

    updateDifficultWords() {
        const wordAnalysis = this.analyticsEngine.analyzeWordDifficulty(this.currentFilters);
        const difficultContainer = document.getElementById('difficult-words');
        
        if (wordAnalysis.length === 0) {
            difficultContainer.innerHTML = '<p class="no-data">No data available</p>';
            return;
        }
        
        difficultContainer.innerHTML = '';
        const difficultWords = wordAnalysis.slice(0, 5);
        
        difficultWords.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.innerHTML = `
                <div class="word-text">${word.word}</div>
                <div class="word-stats">
                    <span class="difficulty-score">${word.difficultyScore}% difficulty</span>
                    <span class="success-rate">${word.successRate}% success</span>
                    <span class="attempts">${word.totalAttempts} attempts</span>
                </div>
            `;
            difficultContainer.appendChild(wordItem);
        });
    }

    createStudentCard(student) {
        const card = document.createElement('div');
        card.className = 'student-card';
        
        const improvementClass = student.improvement > 0 ? 'positive' : student.improvement < 0 ? 'negative' : 'neutral';
        
        card.innerHTML = `
            <div class="student-header">
                <div class="student-name">${student.name}</div>
                <div class="score-badge score-${this.getScoreClass(student.averageScore)}">${student.averageScore}%</div>
            </div>
            <div class="student-stats">
                <div class="student-stat">
                    <div class="student-stat-value">${student.totalQuizzes}</div>
                    <div class="student-stat-label">Quizzes</div>
                </div>
                <div class="student-stat">
                    <div class="student-stat-value ${improvementClass}">${student.improvement > 0 ? '+' : ''}${student.improvement || 0}%</div>
                    <div class="student-stat-label">Improvement</div>
                </div>
                <div class="student-stat">
                    <div class="student-stat-value">${new Date(student.lastQuizDate).toLocaleDateString()}</div>
                    <div class="student-stat-label">Last Quiz</div>
                </div>
            </div>
            <div class="student-actions">
                <button class="btn btn-small" onclick="viewStudentProgress('${student.name}')">📊 View Progress</button>
                <button class="btn btn-small" onclick="exportStudentData('${student.name}')">📥 Export Data</button>
            </div>
        `;
        
        return card;
    }

    populateWordTable(container, words, type) {
        container.innerHTML = '';
        
        if (words.length === 0) {
            container.innerHTML = '<p class="no-data">No data available</p>';
            return;
        }
        
        words.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-table-item';
            
            wordItem.innerHTML = `
                <div class="word-name">${word.word}</div>
                <div class="word-stats">
                    <span class="difficulty-score">${word.difficultyScore}% difficulty</span>
                    <span class="success-rate">${word.successRate}% success</span>
                    <span class="attempts">${word.totalAttempts} attempts</span>
                    <span class="students">${word.totalStudents} students</span>
                </div>
                <div class="word-actions">
                    <button class="btn btn-small" onclick="viewWordAnalysis('${word.word}')">📈 Analyze</button>
                    <button class="btn btn-small" onclick="getTeachingTips('${word.word}')">💡 Tips</button>
                </div>
            `;
            
            container.appendChild(wordItem);
        });
    }

    setupExportFunctionality() {
        // Analytics Export buttons
        const analyticsExportContainer = document.getElementById('analytics-exports');
        if (!analyticsExportContainer) {
            // Create analytics export section
            const exportTab = document.getElementById('export-tab');
            const analyticsSection = document.createElement('div');
            analyticsSection.className = 'dashboard-card';
            analyticsSection.innerHTML = `
                <h3>📊 Advanced Analytics Exports</h3>
                <p>Export detailed analytics and insights for comprehensive reporting.</p>
                <div id="analytics-exports" class="export-options">
                    <button id="export-word-difficulty" class="btn btn-primary">📝 Word Difficulty Analysis</button>
                    <button id="export-student-progress" class="btn btn-primary">📈 Student Progress Report</button>
                    <button id="export-class-report" class="btn btn-primary">📋 Class Performance Report</button>
                    <button id="export-teaching-focus" class="btn btn-primary">🎯 Teaching Focus Words</button>
                    <button id="export-comprehensive" class="btn btn-secondary">📊 Comprehensive Analytics</button>
                </div>
            `;
            
            // Insert before existing export card
            const firstCard = exportTab.querySelector('.dashboard-card');
            exportTab.insertBefore(analyticsSection, firstCard);
        }
        
        // Set up event listeners for export buttons
        this.setupExportEventListeners();
    }

    setupExportEventListeners() {
        const exportButtons = {
            'export-word-difficulty': () => this.exportAnalytics('word-difficulty'),
            'export-student-progress': () => this.exportAnalytics('student-progress'),
            'export-class-report': () => this.exportAnalytics('class-report'),
            'export-teaching-focus': () => this.exportAnalytics('teaching-focus'),
            'export-comprehensive': () => this.exportAnalytics('comprehensive')
        };
        
        Object.entries(exportButtons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
            }
        });
    }

    exportAnalytics(type) {
        if (!this.analyticsEngine) {
            alert('Analytics engine not available');
            return;
        }
        
        try {
            const exportData = this.analyticsEngine.exportAnalyticsData(type, 'csv', this.currentFilters);
            if (exportData) {
                this.downloadFile(exportData.content, exportData.filename, exportData.mimeType);
            } else {
                alert('No data available for export');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    populateStudentSelect() {
        const results = this.dataManager.getAllResults();
        const students = [...new Set(results.map(r => r.studentName).filter(Boolean))];
        
        const select = document.getElementById('export-student-select');
        if (select) {
            select.innerHTML = '<option value="">Select a student...</option>';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student;
                option.textContent = student;
                select.appendChild(option);
            });
        }
    }

    calculateStorageSize(results) {
        const dataString = JSON.stringify(results);
        const sizeInBytes = new Blob([dataString]).size;
        
        if (sizeInBytes < 1024) return `${sizeInBytes} bytes`;
        if (sizeInBytes < 1024 * 1024) return `${Math.round(sizeInBytes / 1024)} KB`;
        return `${Math.round(sizeInBytes / (1024 * 1024) * 100) / 100} MB`;
    }

    getScoreClass(percentage) {
        if (percentage >= 85) return 'excellent';
        if (percentage >= 70) return 'good';
        if (percentage >= 50) return 'fair';
        return 'needs-work';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    applyFilters(filters) {
        this.currentFilters = { ...filters };
        this.loadDashboardData();
    }
}

// Global functions for UI interactions
function viewStudentProgress(studentName) {
    if (window.dashboard && window.dashboard.analyticsEngine) {
        const progress = window.dashboard.analyticsEngine.analyzeStudentProgress(studentName);
        if (progress) {
            // Create and show progress modal
            showStudentProgressModal(progress);
        }
    }
}

function exportStudentData(studentName) {
    if (window.dashboard && window.dashboard.analyticsEngine) {
        const filters = { studentName: studentName };
        const exportData = window.dashboard.analyticsEngine.exportAnalyticsData('student-progress', 'csv', filters);
        if (exportData) {
            window.dashboard.downloadFile(exportData.content, exportData.filename, exportData.mimeType);
        }
    }
}

function viewWordAnalysis(word) {
    if (window.dashboard && window.dashboard.analyticsEngine) {
        const wordAnalysis = window.dashboard.analyticsEngine.analyzeWordDifficulty();
        const wordData = wordAnalysis.find(w => w.word === word);
        if (wordData) {
            showWordAnalysisModal(wordData);
        }
    }
}

function getTeachingTips(word) {
    if (window.dashboard && window.dashboard.analyticsEngine) {
        const wordAnalysis = window.dashboard.analyticsEngine.analyzeWordDifficulty();
        const wordData = wordAnalysis.find(w => w.word === word);
        if (wordData) {
            const approaches = window.dashboard.analyticsEngine.getTeachingApproach(wordData);
            alert(`Teaching Tips for "${word}":\n\n${approaches.join('\n')}`);
        }
    }
}

function showStudentProgressModal(progress) {
    // Simple modal implementation
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.7); z-index: 1000; display: flex; 
        align-items: center; justify-content: center;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white; padding: 20px; border-radius: 12px; 
        max-width: 600px; max-height: 80%; overflow-y: auto;
        width: 90%;
    `;
    
    content.innerHTML = `
        <h2>📊 ${progress.studentName} - Progress Report</h2>
        <p><strong>Total Quizzes:</strong> ${progress.totalQuizzes}</p>
        <p><strong>Overall Trend:</strong> ${progress.overallProgress?.trend || 'Stable'}</p>
        ${progress.overallProgress ? `<p><strong>Improvement:</strong> ${progress.overallProgress.improvement > 0 ? '+' : ''}${Math.round(progress.overallProgress.improvement * 100) / 100} points</p>` : ''}
        
        <h3>Strengths (${progress.strengths.length})</h3>
        <ul>${progress.strengths.slice(0, 5).map(s => `<li>${s.word} (${s.successRate}%)</li>`).join('')}</ul>
        
        <h3>Areas for Focus (${progress.weaknesses.length})</h3>
        <ul>${progress.weaknesses.slice(0, 5).map(w => `<li>${w.word} (${w.successRate}%)</li>`).join('')}</ul>
        
        <h3>Recommendations</h3>
        <ul>${progress.recommendations.map(r => `<li>${r.message}</li>`).join('')}</ul>
        
        <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary" style="margin-top: 15px;">Close</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function showWordAnalysisModal(wordData) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.7); z-index: 1000; display: flex; 
        align-items: center; justify-content: center;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white; padding: 20px; border-radius: 12px; 
        max-width: 500px; max-height: 80%; overflow-y: auto;
        width: 90%;
    `;
    
    content.innerHTML = `
        <h2>📝 "${wordData.word}" Analysis</h2>
        <p><strong>Difficulty Score:</strong> ${wordData.difficultyScore}%</p>
        <p><strong>Success Rate:</strong> ${wordData.successRate}%</p>
        <p><strong>Total Attempts:</strong> ${wordData.totalAttempts}</p>
        <p><strong>Students Attempted:</strong> ${wordData.totalStudents}</p>
        <p><strong>Teaching Priority:</strong> ${wordData.teachingPriority}/5</p>
        
        <h3>Common Mistakes</h3>
        <ul>${wordData.commonMistakes.slice(0, 3).map(m => `<li>"${m.mistake}" (${m.count} times)</li>`).join('')}</ul>
        
        <h3>Spelling Patterns</h3>
        <p>${wordData.categories.join(', ') || 'No specific patterns identified'}</p>
        
        <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary" style="margin-top: 15px;">Close</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate nav button
    const navBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // Refresh data for the active tab
    if (window.dashboard) {
        if (tabName === 'analytics') {
            window.dashboard.updateAnalyticsTab();
        } else if (tabName === 'students') {
            window.dashboard.updateStudentsTab();
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize analytics engine first
    if (typeof AnalyticsEngine !== 'undefined') {
        window.analyticsEngine = new AnalyticsEngine();
    }
    
    // Initialize dashboard
    window.dashboard = new TeacherDashboard();
    
    // Set up analytics features
    setTimeout(() => setupAdvancedAnalytics(), 500);
    
    // Set up tab navigation
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Set up filter functionality
    document.getElementById('apply-date-filter')?.addEventListener('click', () => {
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        
        const filters = {};
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        
        window.dashboard.applyFilters(filters);
    });
    
    document.getElementById('clear-date-filter')?.addEventListener('click', () => {
        document.getElementById('date-from').value = '';
        document.getElementById('date-to').value = '';
        window.dashboard.applyFilters({});
    });
    
    // Set up student search
    document.getElementById('student-search')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const filters = searchTerm ? { studentName: searchTerm } : {};
        window.dashboard.applyFilters(filters);
    });
    
    // Auto-refresh every 5 minutes
    setInterval(() => {
        if (window.dashboard) {
            window.dashboard.loadDashboardData();
        }
    }, 5 * 60 * 1000);
});

// Advanced Analytics Setup Function
function setupAdvancedAnalytics() {
    if (!window.analyticsEngine) return;
    
    try {
        // Update teaching focus words
        updateTeachingFocusWords();
        
        // Update pattern analysis
        updatePatternAnalysis();
        
        // Update AI recommendations
        updateAIRecommendations();
        
        // Setup export listeners for new analytics features
        setupAdvancedExportListeners();
        
        console.log('Advanced analytics features initialized successfully');
    } catch (error) {
        console.error('Error setting up advanced analytics:', error);
    }
}

function updateTeachingFocusWords() {
    const container = document.getElementById('teaching-focus-words');
    if (!container) return;
    
    const focusWords = window.analyticsEngine.getTeachingFocusWords({}, 8);
    
    if (focusWords.length === 0) {
        container.innerHTML = '<p class="no-data">Complete more quizzes to identify focus words for targeted teaching.</p>';
        return;
    }
    
    container.innerHTML = '';
    focusWords.forEach(wordData => {
        const focusItem = document.createElement('div');
        focusItem.className = 'focus-word-item';
        
        const priorityClass = wordData.teachingPriority >= 4 ? 'priority-high' : 
                            wordData.teachingPriority >= 3 ? 'priority-medium' : 'priority-low';
        
        focusItem.innerHTML = `
            <div class="focus-word-text">${wordData.word}</div>
            <div class="focus-word-stats">
                <span class="priority-badge ${priorityClass}">Priority ${wordData.teachingPriority}/5</span>
                <span>${wordData.successRate}% success</span>
                <span>${wordData.totalStudents} students affected</span>
            </div>
        `;
        
        container.appendChild(focusItem);
    });
}

function updatePatternAnalysis() {
    const wordAnalysis = window.analyticsEngine.analyzeWordDifficulty();
    const patternStats = analyzeSpellingPatterns(wordAnalysis);
    
    // Update difficult patterns
    const difficultContainer = document.getElementById('difficult-patterns');
    if (difficultContainer) {
        updatePatternContainer(difficultContainer, patternStats.difficult.slice(0, 6));
    }
    
    // Update mastered patterns
    const masteredContainer = document.getElementById('mastered-patterns');
    if (masteredContainer) {
        updatePatternContainer(masteredContainer, patternStats.mastered.slice(0, 6));
    }
}

function analyzeSpellingPatterns(wordAnalysis) {
    const patterns = new Map();
    
    wordAnalysis.forEach(word => {
        word.categories.forEach(category => {
            if (!patterns.has(category)) {
                patterns.set(category, {
                    name: category,
                    words: [],
                    totalDifficulty: 0,
                    count: 0
                });
            }
            
            const pattern = patterns.get(category);
            pattern.words.push(word.word);
            pattern.totalDifficulty += word.difficultyScore;
            pattern.count++;
        });
    });
    
    const patternArray = Array.from(patterns.values()).map(pattern => ({
        ...pattern,
        averageDifficulty: Math.round(pattern.totalDifficulty / pattern.count),
        displayName: formatPatternName(pattern.name)
    }));
    
    return {
        difficult: patternArray.filter(p => p.averageDifficulty > 50).sort((a, b) => b.averageDifficulty - a.averageDifficulty),
        mastered: patternArray.filter(p => p.averageDifficulty <= 35).sort((a, b) => a.averageDifficulty - b.averageDifficulty)
    };
}

function formatPatternName(pattern) {
    const patternNames = {
        'tion-endings': '-tion endings',
        'sion-endings': '-sion endings',
        'ough-pattern': 'ough patterns',
        'eigh-pattern': 'eigh patterns',
        'double-letters': 'Double letters',
        'vowel-pairs': 'Vowel pairs',
        'ph-sound': 'ph sounds',
        'silent-letters': 'Silent letters'
    };
    return patternNames[pattern] || pattern.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function updatePatternContainer(container, patterns) {
    if (patterns.length === 0) {
        container.innerHTML = '<p class="no-data">No patterns identified yet</p>';
        return;
    }
    
    container.innerHTML = '';
    patterns.forEach(pattern => {
        const patternItem = document.createElement('div');
        patternItem.className = 'pattern-item';
        
        const difficultyClass = pattern.averageDifficulty > 70 ? 'difficulty-high' :
                              pattern.averageDifficulty > 40 ? 'difficulty-medium' : 'difficulty-low';
        
        patternItem.innerHTML = `
            <div class="pattern-name">${pattern.displayName} (${pattern.count} words)</div>
            <div class="pattern-difficulty ${difficultyClass}">${pattern.averageDifficulty}% difficulty</div>
        `;
        
        container.appendChild(patternItem);
    });
}

function updateAIRecommendations() {
    const container = document.getElementById('ai-recommendations');
    if (!container) return;
    
    const classReport = window.analyticsEngine.generateClassReport();
    if (!classReport || !classReport.recommendations) {
        container.innerHTML = '<p class="no-data">Complete more quizzes to generate personalized AI recommendations.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // Add class-level recommendations
    classReport.recommendations.forEach(rec => {
        const recItem = document.createElement('div');
        recItem.className = `recommendation-item recommendation-${rec.type}`;
        recItem.textContent = rec.message;
        container.appendChild(recItem);
    });
    
    // Add teaching focus recommendations
    const focusWords = window.analyticsEngine.getTeachingFocusWords({}, 3);
    if (focusWords.length > 0) {
        const focusRec = document.createElement('div');
        focusRec.className = 'recommendation-item recommendation-focus';
        focusRec.innerHTML = `
            <strong>🎯 High-Priority Teaching Focus:</strong> Focus intensive practice on: 
            <strong>${focusWords.map(w => w.word).join(', ')}</strong>. 
            These words have consistently low success rates across multiple students and require immediate attention.
        `;
        container.appendChild(focusRec);
    }
    
    // Add pattern-based recommendations
    const wordAnalysis = window.analyticsEngine.analyzeWordDifficulty();
    const patternStats = analyzeSpellingPatterns(wordAnalysis);
    
    if (patternStats.difficult.length > 0) {
        const patternRec = document.createElement('div');
        patternRec.className = 'recommendation-item recommendation-focus';
        patternRec.innerHTML = `
            <strong>📚 Spelling Pattern Focus:</strong> Students struggle most with 
            <strong>${patternStats.difficult[0].displayName}</strong> patterns. 
            Consider dedicating extra time to these spelling rules and patterns.
        `;
        container.appendChild(patternRec);
    }
}

function setupAdvancedExportListeners() {
    const exportButtons = {
        'export-word-difficulty': () => exportAdvancedAnalytics('word-difficulty'),
        'export-student-progress': () => exportAdvancedAnalytics('student-progress'),
        'export-class-insights': () => exportAdvancedAnalytics('class-report'),
        'export-teaching-recommendations': () => exportAdvancedAnalytics('teaching-focus'),
        'export-comprehensive-report': () => exportAdvancedAnalytics('comprehensive'),
        'export-teaching-focus': () => exportAdvancedAnalytics('teaching-focus'),
        'refresh-recommendations': () => refreshAnalytics(),
        'export-recommendations': () => exportRecommendationsReport()
    };
    
    Object.entries(exportButtons).forEach(([id, handler]) => {
        const button = document.getElementById(id);
        if (button) {
            button.removeEventListener('click', handler); // Remove existing listener
            button.addEventListener('click', handler);
        }
    });
}

function exportAdvancedAnalytics(type) {
    if (!window.analyticsEngine) {
        showAnalyticsMessage('Analytics engine not available', 'error');
        return;
    }
    
    try {
        const exportData = window.analyticsEngine.exportAnalyticsData(type, 'csv');
        if (exportData) {
            downloadAnalyticsFile(exportData.content, exportData.filename, exportData.mimeType);
            showAnalyticsMessage(`${type.replace('-', ' ')} data exported successfully!`, 'success');
        } else {
            showAnalyticsMessage('No data available for export', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showAnalyticsMessage('Failed to export data. Please try again.', 'error');
    }
}

function refreshAnalytics() {
    if (window.analyticsEngine) {
        window.analyticsEngine.clearCache();
        setupAdvancedAnalytics();
        showAnalyticsMessage('Analytics refreshed successfully!', 'success');
    }
}

function exportRecommendationsReport() {
    if (!window.analyticsEngine) return;
    
    const classReport = window.analyticsEngine.generateClassReport();
    const focusWords = window.analyticsEngine.getTeachingFocusWords({}, 10);
    
    const reportContent = generateDetailedRecommendationsReport(classReport, focusWords);
    const filename = `spelling-assessment-recommendations_${new Date().toISOString().split('T')[0]}.txt`;
    
    downloadAnalyticsFile(reportContent, filename, 'text/plain');
    showAnalyticsMessage('Comprehensive recommendations report exported successfully!', 'success');
}

function generateDetailedRecommendationsReport(classReport, focusWords) {
    const date = new Date().toLocaleDateString();
    
    let report = `INTERACTIVE SPELLING ASSESSMENT - TEACHING RECOMMENDATIONS REPORT\n`;
    report += `Generated: ${date}\n`;
    report += `${'='.repeat(70)}\n\n`;
    
    if (classReport && classReport.summary) {
        report += `CLASS OVERVIEW:\n`;
        report += `${'-'.repeat(20)}\n`;
        report += `• Total Students: ${classReport.summary.totalStudents}\n`;
        report += `• Total Quiz Attempts: ${classReport.summary.totalQuizzes}\n`;
        report += `• Class Average Score: ${classReport.summary.averagePercentage}%\n`;
        report += `• Average Time per Quiz: ${Math.round(classReport.summary.averageTimeSpent / 60)} minutes\n\n`;
    }
    
    report += `🎯 HIGH PRIORITY TEACHING FOCUS WORDS:\n`;
    report += `${'-'.repeat(45)}\n`;
    if (focusWords.length > 0) {
        focusWords.forEach((word, index) => {
            report += `${index + 1}. "${word.word.toUpperCase()}"\n`;
            report += `   • Success Rate: ${word.successRate}% (${100 - word.successRate}% need improvement)\n`;
            report += `   • Students Affected: ${word.totalStudents}\n`;
            report += `   • Teaching Priority: ${word.teachingPriority}/5 (${word.teachingPriority >= 4 ? 'URGENT' : word.teachingPriority >= 3 ? 'HIGH' : 'MEDIUM'})\n`;
            if (word.recommendedApproach && word.recommendedApproach.length > 0) {
                report += `   • Recommended Teaching Approach:\n`;
                word.recommendedApproach.forEach(approach => {
                    report += `     - ${approach}\n`;
                });
            }
            report += `\n`;
        });
    } else {
        report += `No high-priority focus words identified at this time.\n`;
        report += `This suggests students are performing well across all vocabulary areas.\n\n`;
    }
    
    if (classReport && classReport.recommendations && classReport.recommendations.length > 0) {
        report += `💡 AI-POWERED GENERAL RECOMMENDATIONS:\n`;
        report += `${'-'.repeat(40)}\n`;
        classReport.recommendations.forEach((rec, index) => {
            const priority = rec.priority === 'high' ? '🔴 HIGH PRIORITY' : 
                          rec.priority === 'medium' ? '🟡 MEDIUM PRIORITY' : '🟢 LOW PRIORITY';
            report += `${index + 1}. ${priority}\n`;
            report += `   ${rec.message}\n\n`;
        });
    }
    
    // Add pattern analysis
    if (window.analyticsEngine) {
        const wordAnalysis = window.analyticsEngine.analyzeWordDifficulty();
        const patternStats = analyzeSpellingPatterns(wordAnalysis);
        
        if (patternStats.difficult.length > 0) {
            report += `📚 CHALLENGING SPELLING PATTERNS:\n`;
            report += `${'-'.repeat(35)}\n`;
            patternStats.difficult.slice(0, 5).forEach((pattern, index) => {
                report += `${index + 1}. ${pattern.displayName}\n`;
                report += `   • Average Difficulty: ${pattern.averageDifficulty}%\n`;
                report += `   • Words in this pattern: ${pattern.count}\n`;
                report += `   • Examples: ${pattern.words.slice(0, 3).join(', ')}${pattern.words.length > 3 ? '...' : ''}\n\n`;
            });
        }
        
        if (patternStats.mastered.length > 0) {
            report += `✅ WELL-MASTERED SPELLING PATTERNS:\n`;
            report += `${'-'.repeat(35)}\n`;
            patternStats.mastered.slice(0, 3).forEach((pattern, index) => {
                report += `${index + 1}. ${pattern.displayName} (${pattern.averageDifficulty}% difficulty)\n`;
            });
            report += `\n`;
        }
    }
    
    report += `📋 IMPLEMENTATION SUGGESTIONS:\n`;
    report += `${'-'.repeat(30)}\n`;
    report += `• Review high-priority words daily for 5-10 minutes\n`;
    report += `• Use multi-sensory approaches for challenging patterns\n`;
    report += `• Implement spaced repetition for difficult words\n`;
    report += `• Create word families based on spelling patterns\n`;
    report += `• Use context sentences to reinforce word meanings\n`;
    report += `• Consider individual spelling lists for students with specific needs\n\n`;
    
    report += `${'='.repeat(70)}\n`;
    report += `Report generated by Interactive Spelling Assessment Analytics Engine\n`;
    report += `For technical support or questions, please refer to the system documentation.\n`;
    
    return report;
}

function showAnalyticsMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 4000);
}

function downloadAnalyticsFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
} 