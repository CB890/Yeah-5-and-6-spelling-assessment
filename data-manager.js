// Data Management Module - Phase 5
class DataManager {
    constructor() {
        this.storageKey = 'spelling-assessment-results';
        this.googleSheetsConfig = {
            enabled: false,
            scriptUrl: '', // Will be set by teacher
            sheetId: ''
        };
        this.init();
    }

    init() {
        // Ensure localStorage is available
        if (!this.isLocalStorageSupported()) {
            console.warn('localStorage not supported. Data will not persist between sessions.');
        }
        
        // Load Google Sheets configuration if available
        this.loadGoogleSheetsConfig();
    }

    isLocalStorageSupported() {
        try {
            const test = 'localStorage-test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }

    // Local Data Storage Methods
    saveQuizResult(quizData) {
        if (!this.isLocalStorageSupported()) return false;

        try {
            const result = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                studentName: quizData.studentName || 'Anonymous',
                totalQuestions: quizData.totalQuestions,
                selectedWords: quizData.selectedWords,
                paragraphTitle: quizData.paragraphTitle,
                quizData: quizData.quizData,
                statistics: quizData.statistics,
                timeTaken: quizData.timeTaken,
                browserInfo: this.getBrowserInfo()
            };

            // Get existing results
            const existingResults = this.getAllResults();
            existingResults.push(result);

            // Store updated results
            localStorage.setItem(this.storageKey, JSON.stringify(existingResults));
            
            // Also send to Google Sheets if configured
            if (this.googleSheetsConfig.enabled) {
                this.sendToGoogleSheets(result);
            }

            return result.id;
        } catch (error) {
            console.error('Error saving quiz result:', error);
            return false;
        }
    }

    getAllResults() {
        if (!this.isLocalStorageSupported()) return [];

        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error retrieving quiz results:', error);
            return [];
        }
    }

    getResultById(id) {
        const results = this.getAllResults();
        return results.find(result => result.id === id);
    }

    getResultsByStudent(studentName) {
        const results = this.getAllResults();
        return results.filter(result => 
            result.studentName.toLowerCase() === studentName.toLowerCase()
        );
    }

    getResultsByDateRange(startDate, endDate) {
        const results = this.getAllResults();
        return results.filter(result => {
            const resultDate = new Date(result.timestamp);
            return resultDate >= startDate && resultDate <= endDate;
        });
    }

    deleteResult(id) {
        if (!this.isLocalStorageSupported()) return false;

        try {
            const results = this.getAllResults();
            const filteredResults = results.filter(result => result.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filteredResults));
            return true;
        } catch (error) {
            console.error('Error deleting quiz result:', error);
            return false;
        }
    }

    clearAllResults() {
        if (!this.isLocalStorageSupported()) return false;

        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing quiz results:', error);
            return false;
        }
    }

    // Excel Export Methods
    exportToExcel(results = null, filename = null) {
        const resultsToExport = results || this.getAllResults();
        
        if (resultsToExport.length === 0) {
            alert('No results to export');
            return false;
        }

        try {
            const csvContent = this.convertToCSV(resultsToExport);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            const exportFilename = filename || `spelling-assessment-results-${this.formatDateForFilename(new Date())}.csv`;
            
            // Create download link
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', exportFilename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return true;
            }
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Error exporting data. Please try again.');
            return false;
        }
    }

    convertToCSV(results) {
        const headers = [
            'Student Name',
            'Date',
            'Time',
            'Total Score',
            'First Attempt Correct',
            'Second Attempt Correct',
            'Accuracy %',
            'Time Taken',
            'Paragraph Theme',
            'Words Tested',
            'Detailed Results'
        ];

        const csvRows = [headers.join(',')];

        results.forEach(result => {
            const date = new Date(result.timestamp);
            const detailedResults = result.quizData.map(word => 
                `${word.word}:${word.firstAttemptCorrect ? 'Correct-1st' : 
                                 word.secondAttemptCorrect ? 'Correct-2nd' : 'Incorrect'}`
            ).join('; ');

            const row = [
                `"${result.studentName}"`,
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                result.statistics.totalScore,
                result.statistics.firstAttemptCorrect,
                result.statistics.secondAttemptCorrect,
                result.statistics.accuracy,
                result.statistics.timeTaken,
                `"${result.paragraphTitle}"`,
                `"${result.selectedWords.join(', ')}"`,
                `"${detailedResults}"`
            ];

            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Google Sheets Integration
    loadGoogleSheetsConfig() {
        try {
            const config = localStorage.getItem('google-sheets-config');
            if (config) {
                this.googleSheetsConfig = { ...this.googleSheetsConfig, ...JSON.parse(config) };
            }
        } catch (error) {
            console.error('Error loading Google Sheets config:', error);
        }
    }

    saveGoogleSheetsConfig(scriptUrl, sheetId) {
        try {
            this.googleSheetsConfig = {
                enabled: true,
                scriptUrl: scriptUrl,
                sheetId: sheetId
            };
            localStorage.setItem('google-sheets-config', JSON.stringify(this.googleSheetsConfig));
            return true;
        } catch (error) {
            console.error('Error saving Google Sheets config:', error);
            return false;
        }
    }

    async sendToGoogleSheets(result) {
        if (!this.googleSheetsConfig.enabled || !this.googleSheetsConfig.scriptUrl) {
            return false;
        }

        try {
            const payload = {
                action: 'addResult',
                data: {
                    studentName: result.studentName,
                    timestamp: result.timestamp,
                    totalScore: result.statistics.totalScore,
                    firstAttemptCorrect: result.statistics.firstAttemptCorrect,
                    secondAttemptCorrect: result.statistics.secondAttemptCorrect,
                    accuracy: result.statistics.accuracy,
                    timeTaken: result.statistics.timeTaken,
                    paragraphTitle: result.paragraphTitle,
                    wordsAndResults: result.quizData.map(word => ({
                        word: word.word,
                        correct: word.correct,
                        attempts: word.attempts,
                        firstAttemptCorrect: word.firstAttemptCorrect,
                        userAnswers: word.userAnswers
                    }))
                }
            };

            const response = await fetch(this.googleSheetsConfig.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('Data successfully sent to Google Sheets');
                return true;
            } else {
                console.error('Failed to send data to Google Sheets:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Error sending data to Google Sheets:', error);
            return false;
        }
    }

    // Analytics and Dashboard Methods
    generateAnalytics(results = null) {
        const data = results || this.getAllResults();
        
        if (data.length === 0) {
            return {
                totalQuizzes: 0,
                uniqueStudents: 0,
                averageScore: 0,
                mostDifficultWords: [],
                topPerformers: [],
                recentActivity: []
            };
        }

        const analytics = {
            totalQuizzes: data.length,
            uniqueStudents: new Set(data.map(r => r.studentName)).size,
            averageScore: this.calculateAverageScore(data),
            averageAccuracy: this.calculateAverageAccuracy(data),
            totalTimeSpent: this.calculateTotalTimeSpent(data),
            mostDifficultWords: this.findMostDifficultWords(data),
            easiestWords: this.findEasiestWords(data),
            topPerformers: this.findTopPerformers(data),
            recentActivity: this.getRecentActivity(data),
            progressOverTime: this.getProgressOverTime(data)
        };

        return analytics;
    }

    calculateAverageScore(results) {
        const scores = results.map(r => r.statistics.totalScore);
        return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    }

    calculateAverageAccuracy(results) {
        const accuracies = results.map(r => r.statistics.accuracy);
        return (accuracies.reduce((a, b) => a + b, 0) / accuracies.length).toFixed(1);
    }

    calculateTotalTimeSpent(results) {
        // Convert time strings to seconds and sum
        const totalSeconds = results.reduce((total, result) => {
            const timeParts = result.statistics.timeTaken.split(':');
            const minutes = parseInt(timeParts[0]) || 0;
            const seconds = parseInt(timeParts[1]) || 0;
            return total + (minutes * 60) + seconds;
        }, 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    findMostDifficultWords(results) {
        const wordStats = {};
        
        results.forEach(result => {
            result.quizData.forEach(word => {
                if (!wordStats[word.word]) {
                    wordStats[word.word] = { attempts: 0, correct: 0, total: 0 };
                }
                wordStats[word.word].total++;
                wordStats[word.word].attempts += word.attempts;
                if (word.correct) wordStats[word.word].correct++;
            });
        });

        return Object.entries(wordStats)
            .map(([word, stats]) => ({
                word,
                successRate: ((stats.correct / stats.total) * 100).toFixed(1),
                totalAttempts: stats.total,
                averageAttempts: (stats.attempts / stats.total).toFixed(1)
            }))
            .sort((a, b) => parseFloat(a.successRate) - parseFloat(b.successRate))
            .slice(0, 10);
    }

    findEasiestWords(results) {
        const wordStats = {};
        
        results.forEach(result => {
            result.quizData.forEach(word => {
                if (!wordStats[word.word]) {
                    wordStats[word.word] = { attempts: 0, correct: 0, total: 0 };
                }
                wordStats[word.word].total++;
                wordStats[word.word].attempts += word.attempts;
                if (word.correct) wordStats[word.word].correct++;
            });
        });

        return Object.entries(wordStats)
            .map(([word, stats]) => ({
                word,
                successRate: ((stats.correct / stats.total) * 100).toFixed(1),
                totalAttempts: stats.total
            }))
            .filter(item => item.totalAttempts >= 3) // Only include words attempted at least 3 times
            .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate))
            .slice(0, 10);
    }

    findTopPerformers(results) {
        const studentStats = {};
        
        results.forEach(result => {
            if (!studentStats[result.studentName]) {
                studentStats[result.studentName] = {
                    quizzes: 0,
                    totalScore: 0,
                    totalAccuracy: 0
                };
            }
            studentStats[result.studentName].quizzes++;
            studentStats[result.studentName].totalScore += result.statistics.totalScore;
            studentStats[result.studentName].totalAccuracy += result.statistics.accuracy;
        });

        return Object.entries(studentStats)
            .map(([name, stats]) => ({
                name,
                quizzes: stats.quizzes,
                averageScore: (stats.totalScore / stats.quizzes).toFixed(1),
                averageAccuracy: (stats.totalAccuracy / stats.quizzes).toFixed(1)
            }))
            .sort((a, b) => parseFloat(b.averageAccuracy) - parseFloat(a.averageAccuracy))
            .slice(0, 10);
    }

    getRecentActivity(results) {
        return results
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
            .map(result => ({
                studentName: result.studentName,
                date: new Date(result.timestamp).toLocaleDateString(),
                score: `${result.statistics.totalScore}/15`,
                accuracy: `${result.statistics.accuracy}%`
            }));
    }

    getProgressOverTime(results) {
        const studentProgress = {};
        
        results.forEach(result => {
            if (!studentProgress[result.studentName]) {
                studentProgress[result.studentName] = [];
            }
            studentProgress[result.studentName].push({
                date: new Date(result.timestamp),
                accuracy: result.statistics.accuracy,
                score: result.statistics.totalScore
            });
        });

        // Sort each student's progress by date
        Object.keys(studentProgress).forEach(student => {
            studentProgress[student].sort((a, b) => a.date - b.date);
        });

        return studentProgress;
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDateForFilename(date) {
        return date.toISOString().split('T')[0];
    }

    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timestamp: new Date().toISOString()
        };
    }

    // Data validation and cleanup
    validateResult(result) {
        const required = ['studentName', 'totalQuestions', 'selectedWords', 'quizData', 'statistics'];
        return required.every(field => result.hasOwnProperty(field));
    }

    cleanupOldResults(daysToKeep = 90) {
        if (!this.isLocalStorageSupported()) return false;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const results = this.getAllResults();
        const filteredResults = results.filter(result => 
            new Date(result.timestamp) > cutoffDate
        );

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(filteredResults));
            return results.length - filteredResults.length; // Return number of deleted results
        } catch (error) {
            console.error('Error cleaning up old results:', error);
            return false;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
} 