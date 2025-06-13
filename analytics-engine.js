/**
 * Advanced Analytics Engine for Spelling Assessment
 * Provides comprehensive data analysis and reporting capabilities
 */

class AnalyticsEngine {
    constructor() {
        this.dataManager = new DataManager();
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get all quiz results with optional filtering
     */
    getAllResults(filters = {}) {
        const cacheKey = `allResults_${JSON.stringify(filters)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        let results = this.dataManager.getAllResults();
        
        // Apply filters
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            results = results.filter(result => new Date(result.timestamp) >= fromDate);
        }
        
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            results = results.filter(result => new Date(result.timestamp) <= toDate);
        }
        
        if (filters.studentName) {
            const searchName = filters.studentName.toLowerCase();
            results = results.filter(result => 
                result.studentName && result.studentName.toLowerCase().includes(searchName)
            );
        }
        
        if (filters.minScore !== undefined) {
            results = results.filter(result => result.score >= filters.minScore);
        }
        
        if (filters.maxScore !== undefined) {
            results = results.filter(result => result.score <= filters.maxScore);
        }

        this.setCachedData(cacheKey, results);
        return results;
    }

    /**
     * Analyze word difficulty across all students
     */
    analyzeWordDifficulty(filters = {}) {
        const cacheKey = `wordDifficulty_${JSON.stringify(filters)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        const results = this.getAllResults(filters);
        const wordStats = new Map();

        // Process each quiz result
        results.forEach(result => {
            if (result.wordResults) {
                result.wordResults.forEach(wordResult => {
                    const word = wordResult.correctWord.toLowerCase();
                    
                    if (!wordStats.has(word)) {
                        wordStats.set(word, {
                            word: wordResult.correctWord,
                            totalAttempts: 0,
                            correctFirstTry: 0,
                            correctSecondTry: 0,
                            incorrect: 0,
                            totalStudents: new Set(),
                            commonMistakes: new Map(),
                            categories: new Set()
                        });
                    }

                    const stats = wordStats.get(word);
                    stats.totalAttempts++;
                    stats.totalStudents.add(result.studentName || 'Anonymous');

                    // Track attempt outcomes
                    if (wordResult.attempts && wordResult.attempts.length > 0) {
                        const firstAttempt = wordResult.attempts[0];
                        if (firstAttempt.correct) {
                            stats.correctFirstTry++;
                        } else if (wordResult.attempts.length > 1 && wordResult.attempts[1].correct) {
                            stats.correctSecondTry++;
                            // Record the mistake
                            const mistake = firstAttempt.answer.toLowerCase();
                            stats.commonMistakes.set(mistake, (stats.commonMistakes.get(mistake) || 0) + 1);
                        } else {
                            stats.incorrect++;
                            // Record all incorrect attempts
                            wordResult.attempts.forEach(attempt => {
                                if (!attempt.correct) {
                                    const mistake = attempt.answer.toLowerCase();
                                    stats.commonMistakes.set(mistake, (stats.commonMistakes.get(mistake) || 0) + 1);
                                }
                            });
                        }
                    }

                    // Categorize word by spelling pattern (if available from word bank)
                    this.categorizeWord(wordResult.correctWord, stats.categories);
                });
            }
        });

        // Convert to array and calculate difficulty metrics
        const wordAnalysis = Array.from(wordStats.values()).map(stats => {
            const totalStudents = stats.totalStudents.size;
            const successRate = (stats.correctFirstTry + stats.correctSecondTry) / stats.totalAttempts;
            const firstTrySuccessRate = stats.correctFirstTry / stats.totalAttempts;
            const needsSecondTryRate = stats.correctSecondTry / stats.totalAttempts;
            const incorrectRate = stats.incorrect / stats.totalAttempts;

            // Convert common mistakes to array
            const commonMistakes = Array.from(stats.commonMistakes.entries())
                .map(([mistake, count]) => ({ mistake, count, percentage: (count / stats.totalAttempts) * 100 }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5); // Top 5 mistakes

            return {
                word: stats.word,
                totalAttempts: stats.totalAttempts,
                totalStudents: totalStudents,
                successRate: Math.round(successRate * 100),
                firstTrySuccessRate: Math.round(firstTrySuccessRate * 100),
                needsSecondTryRate: Math.round(needsSecondTryRate * 100),
                incorrectRate: Math.round(incorrectRate * 100),
                difficultyScore: Math.round((1 - successRate) * 100), // Higher = more difficult
                commonMistakes: commonMistakes,
                categories: Array.from(stats.categories),
                teachingPriority: this.calculateTeachingPriority(stats, successRate, totalStudents)
            };
        });

        // Sort by difficulty (most difficult first)
        wordAnalysis.sort((a, b) => b.difficultyScore - a.difficultyScore);

        this.setCachedData(cacheKey, wordAnalysis);
        return wordAnalysis;
    }

    /**
     * Analyze individual student progress over time
     */
    analyzeStudentProgress(studentName, filters = {}) {
        const cacheKey = `studentProgress_${studentName}_${JSON.stringify(filters)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        const results = this.getAllResults({
            ...filters,
            studentName: studentName
        }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (results.length === 0) {
            return null;
        }

        const progressData = {
            studentName: studentName,
            totalQuizzes: results.length,
            timeSpan: {
                first: results[0].timestamp,
                last: results[results.length - 1].timestamp
            },
            overallProgress: this.calculateOverallProgress(results),
            scoreProgress: this.calculateScoreProgress(results),
            wordProgress: this.calculateWordProgress(results),
            strengths: [],
            weaknesses: [],
            recommendations: []
        };

        // Identify strengths and weaknesses
        this.identifyStrengthsAndWeaknesses(results, progressData);
        
        // Generate recommendations
        this.generateRecommendations(progressData);

        this.setCachedData(cacheKey, progressData);
        return progressData;
    }

    /**
     * Generate class performance report
     */
    generateClassReport(filters = {}) {
        const cacheKey = `classReport_${JSON.stringify(filters)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        const results = this.getAllResults(filters);
        
        if (results.length === 0) {
            return null;
        }

        const classReport = {
            summary: this.calculateClassSummary(results),
            studentPerformance: this.analyzeClassStudentPerformance(results),
            wordAnalysis: this.analyzeWordDifficulty(filters),
            trends: this.analyzeClassTrends(results),
            recommendations: this.generateClassRecommendations(results)
        };

        this.setCachedData(cacheKey, classReport);
        return classReport;
    }

    /**
     * Identify words that need teaching focus
     */
    getTeachingFocusWords(filters = {}, limit = 20) {
        const wordAnalysis = this.analyzeWordDifficulty(filters);
        
        return wordAnalysis
            .filter(word => word.teachingPriority >= 3) // High priority words
            .sort((a, b) => b.teachingPriority - a.teachingPriority)
            .slice(0, limit)
            .map(word => ({
                word: word.word,
                difficultyScore: word.difficultyScore,
                successRate: word.successRate,
                totalAttempts: word.totalAttempts,
                totalStudents: word.totalStudents,
                commonMistakes: word.commonMistakes,
                categories: word.categories,
                teachingPriority: word.teachingPriority,
                recommendedApproach: this.getTeachingApproach(word)
            }));
    }

    /**
     * Export analytics data in various formats
     */
    exportAnalyticsData(type = 'comprehensive', format = 'csv', filters = {}) {
        let data = [];
        let filename = '';

        switch (type) {
            case 'word-difficulty':
                data = this.exportWordDifficultyData(filters);
                filename = `word-difficulty-analysis_${this.getDateString()}`;
                break;
            case 'student-progress':
                data = this.exportStudentProgressData(filters);
                filename = `student-progress-report_${this.getDateString()}`;
                break;
            case 'class-report':
                data = this.exportClassReportData(filters);
                filename = `class-performance-report_${this.getDateString()}`;
                break;
            case 'teaching-focus':
                data = this.exportTeachingFocusData(filters);
                filename = `teaching-focus-words_${this.getDateString()}`;
                break;
            default: // comprehensive
                data = this.exportComprehensiveData(filters);
                filename = `comprehensive-analytics_${this.getDateString()}`;
        }

        if (format === 'csv') {
            return this.convertToCSV(data, filename);
        } else if (format === 'json') {
            return this.convertToJSON(data, filename);
        }
    }

    // Helper Methods

    categorizeWord(word, categories) {
        const wordLower = word.toLowerCase();
        
        // Common spelling patterns
        if (/tion$/.test(wordLower)) categories.add('tion-endings');
        if (/sion$/.test(wordLower)) categories.add('sion-endings');
        if (/ough/.test(wordLower)) categories.add('ough-pattern');
        if (/eigh/.test(wordLower)) categories.add('eigh-pattern');
        if (/([a-z])\1/.test(wordLower)) categories.add('double-letters');
        if (/[aeiou][aeiou]/.test(wordLower)) categories.add('vowel-pairs');
        if (/ph/.test(wordLower)) categories.add('ph-sound');
        if (/silent/.test(wordLower) || /[lmn]b$/.test(wordLower) || /^kn/.test(wordLower)) {
            categories.add('silent-letters');
        }
    }

    calculateTeachingPriority(stats, successRate, totalStudents) {
        let priority = 0;
        
        // High number of students struggling
        if (totalStudents >= 5 && successRate < 0.6) priority += 3;
        else if (totalStudents >= 3 && successRate < 0.7) priority += 2;
        else if (successRate < 0.8) priority += 1;
        
        // High frequency word
        if (stats.totalAttempts >= 10) priority += 1;
        
        // Common mistake patterns
        if (stats.commonMistakes.size >= 3) priority += 1;
        
        return Math.min(priority, 5); // Cap at 5
    }

    calculateOverallProgress(results) {
        if (results.length < 2) return null;
        
        const firstQuarter = results.slice(0, Math.ceil(results.length / 4));
        const lastQuarter = results.slice(-Math.ceil(results.length / 4));
        
        const firstAvg = firstQuarter.reduce((sum, r) => sum + r.score, 0) / firstQuarter.length;
        const lastAvg = lastQuarter.reduce((sum, r) => sum + r.score, 0) / lastQuarter.length;
        
        return {
            improvement: lastAvg - firstAvg,
            improvementPercentage: ((lastAvg - firstAvg) / firstAvg) * 100,
            trend: lastAvg > firstAvg ? 'improving' : lastAvg < firstAvg ? 'declining' : 'stable'
        };
    }

    calculateScoreProgress(results) {
        return results.map((result, index) => ({
            quizNumber: index + 1,
            date: result.timestamp,
            score: result.score,
            totalWords: result.totalWords,
            percentage: Math.round((result.score / result.totalWords) * 100),
            timeSpent: result.timeSpent
        }));
    }

    calculateWordProgress(results) {
        const wordTracker = new Map();
        
        results.forEach((result, quizIndex) => {
            if (result.wordResults) {
                result.wordResults.forEach(wordResult => {
                    const word = wordResult.correctWord.toLowerCase();
                    if (!wordTracker.has(word)) {
                        wordTracker.set(word, []);
                    }
                    
                    const attempts = wordResult.attempts || [];
                    const performance = {
                        quizNumber: quizIndex + 1,
                        date: result.timestamp,
                        correct: attempts.length > 0 && attempts.some(a => a.correct),
                        attemptsNeeded: attempts.length,
                        firstTryCorrect: attempts.length > 0 && attempts[0].correct
                    };
                    
                    wordTracker.get(word).push(performance);
                });
            }
        });
        
        return Object.fromEntries(wordTracker);
    }

    calculateClassSummary(results) {
        const uniqueStudents = new Set(results.map(r => r.studentName || 'Anonymous')).size;
        const totalQuizzes = results.length;
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        const averageTime = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / results.length;
        
        return {
            totalStudents: uniqueStudents,
            totalQuizzes: totalQuizzes,
            averageScore: Math.round(averageScore * 100) / 100,
            averagePercentage: Math.round((averageScore / (results[0]?.totalWords || 15)) * 100),
            averageTimeSpent: Math.round(averageTime),
            dateRange: {
                from: Math.min(...results.map(r => new Date(r.timestamp).getTime())),
                to: Math.max(...results.map(r => new Date(r.timestamp).getTime()))
            }
        };
    }

    // Cache management
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
    }

    // Utility methods
    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    convertToCSV(data, filename) {
        if (!data || data.length === 0) return null;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        return {
            content: csvContent,
            filename: `${filename}.csv`,
            mimeType: 'text/csv'
        };
    }

    convertToJSON(data, filename) {
        return {
            content: JSON.stringify(data, null, 2),
            filename: `${filename}.json`,
            mimeType: 'application/json'
        };
    }

    // Additional helper methods for complete functionality

    identifyStrengthsAndWeaknesses(results, progressData) {
        const wordPerformance = new Map();
        
        results.forEach(result => {
            if (result.wordResults) {
                result.wordResults.forEach(wordResult => {
                    const word = wordResult.correctWord;
                    if (!wordPerformance.has(word)) {
                        wordPerformance.set(word, { correct: 0, total: 0 });
                    }
                    const stats = wordPerformance.get(word);
                    stats.total++;
                    if (wordResult.attempts && wordResult.attempts.some(a => a.correct)) {
                        stats.correct++;
                    }
                });
            }
        });

        // Identify strengths (>80% success rate)
        progressData.strengths = Array.from(wordPerformance.entries())
            .filter(([word, stats]) => stats.total >= 2 && (stats.correct / stats.total) > 0.8)
            .map(([word, stats]) => ({
                word,
                successRate: Math.round((stats.correct / stats.total) * 100),
                totalAttempts: stats.total
            }))
            .sort((a, b) => b.successRate - a.successRate);

        // Identify weaknesses (<60% success rate)
        progressData.weaknesses = Array.from(wordPerformance.entries())
            .filter(([word, stats]) => stats.total >= 2 && (stats.correct / stats.total) < 0.6)
            .map(([word, stats]) => ({
                word,
                successRate: Math.round((stats.correct / stats.total) * 100),
                totalAttempts: stats.total
            }))
            .sort((a, b) => a.successRate - b.successRate);
    }

    generateRecommendations(progressData) {
        const recommendations = [];
        
        if (progressData.overallProgress) {
            if (progressData.overallProgress.trend === 'improving') {
                recommendations.push({
                    type: 'positive',
                    message: 'Great progress! Continue with current learning strategies.',
                    priority: 'low'
                });
            } else if (progressData.overallProgress.trend === 'declining') {
                recommendations.push({
                    type: 'concern',
                    message: 'Consider reviewing fundamental spelling patterns and providing additional support.',
                    priority: 'high'
                });
            }
        }

        if (progressData.weaknesses.length > 5) {
            recommendations.push({
                type: 'focus',
                message: `Focus on practicing these challenging words: ${progressData.weaknesses.slice(0, 3).map(w => w.word).join(', ')}`,
                priority: 'medium'
            });
        }

        if (progressData.strengths.length > 5) {
            recommendations.push({
                type: 'strength',
                message: 'Strong performance on complex words. Ready for more challenging vocabulary.',
                priority: 'low'
            });
        }

        progressData.recommendations = recommendations;
    }

    analyzeClassStudentPerformance(results) {
        const studentStats = new Map();
        
        results.forEach(result => {
            const name = result.studentName || 'Anonymous';
            if (!studentStats.has(name)) {
                studentStats.set(name, {
                    name,
                    quizzes: [],
                    totalQuizzes: 0,
                    averageScore: 0,
                    improvement: 0,
                    lastQuizDate: null
                });
            }
            
            const stats = studentStats.get(name);
            stats.quizzes.push({
                date: result.timestamp,
                score: result.score,
                totalWords: result.totalWords,
                percentage: Math.round((result.score / result.totalWords) * 100)
            });
            stats.totalQuizzes++;
            stats.lastQuizDate = result.timestamp;
        });

        // Calculate averages and improvements
        return Array.from(studentStats.values()).map(student => {
            student.quizzes.sort((a, b) => new Date(a.date) - new Date(b.date));
            student.averageScore = Math.round(
                student.quizzes.reduce((sum, q) => sum + q.percentage, 0) / student.quizzes.length
            );
            
            if (student.quizzes.length >= 2) {
                const firstScore = student.quizzes[0].percentage;
                const lastScore = student.quizzes[student.quizzes.length - 1].percentage;
                student.improvement = lastScore - firstScore;
            }
            
            return student;
        }).sort((a, b) => b.averageScore - a.averageScore);
    }

    analyzeClassTrends(results) {
        // Group results by week
        const weeklyData = new Map();
        
        results.forEach(result => {
            const date = new Date(result.timestamp);
            const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeklyData.has(weekKey)) {
                weeklyData.set(weekKey, {
                    week: weekKey,
                    quizzes: [],
                    averageScore: 0,
                    studentCount: new Set()
                });
            }
            
            const weekStats = weeklyData.get(weekKey);
            weekStats.quizzes.push(result);
            weekStats.studentCount.add(result.studentName || 'Anonymous');
        });

        // Calculate weekly averages
        const trends = Array.from(weeklyData.values()).map(week => {
            week.averageScore = Math.round(
                week.quizzes.reduce((sum, q) => sum + (q.score / q.totalWords), 0) / week.quizzes.length * 100
            );
            week.totalQuizzes = week.quizzes.length;
            week.uniqueStudents = week.studentCount.size;
            delete week.quizzes; // Remove detailed data
            delete week.studentCount;
            return week;
        }).sort((a, b) => new Date(a.week) - new Date(b.week));

        return trends;
    }

    generateClassRecommendations(results) {
        const recommendations = [];
        const classAverage = results.reduce((sum, r) => sum + (r.score / r.totalWords), 0) / results.length;
        
        if (classAverage < 0.7) {
            recommendations.push({
                type: 'concern',
                message: 'Class average below 70%. Consider reviewing fundamental spelling strategies.',
                priority: 'high'
            });
        } else if (classAverage > 0.85) {
            recommendations.push({
                type: 'success',
                message: 'Excellent class performance! Ready for more challenging vocabulary.',
                priority: 'low'
            });
        }

        const wordAnalysis = this.analyzeWordDifficulty();
        const difficultWords = wordAnalysis.filter(w => w.difficultyScore > 60).slice(0, 5);
        
        if (difficultWords.length > 0) {
            recommendations.push({
                type: 'focus',
                message: `Focus on these challenging words: ${difficultWords.map(w => w.word).join(', ')}`,
                priority: 'medium'
            });
        }

        return recommendations;
    }

    getTeachingApproach(wordData) {
        const approaches = [];
        
        if (wordData.categories.includes('silent-letters')) {
            approaches.push('Focus on visual memory and word structure');
        }
        if (wordData.categories.includes('double-letters')) {
            approaches.push('Practice identifying double letter patterns');
        }
        if (wordData.categories.includes('tion-endings') || wordData.categories.includes('sion-endings')) {
            approaches.push('Teach suffix rules and word families');
        }
        if (wordData.commonMistakes.length > 0) {
            approaches.push(`Address common mistake: "${wordData.commonMistakes[0].mistake}"`);
        }
        
        return approaches.length > 0 ? approaches : ['Practice with context and repetition'];
    }

    // Export methods for different data types
    exportWordDifficultyData(filters = {}) {
        return this.analyzeWordDifficulty(filters).map(word => ({
            word: word.word,
            difficultyScore: word.difficultyScore,
            successRate: word.successRate,
            totalAttempts: word.totalAttempts,
            totalStudents: word.totalStudents,
            teachingPriority: word.teachingPriority,
            categories: word.categories.join('; '),
            topMistake: word.commonMistakes[0]?.mistake || 'None'
        }));
    }

    exportStudentProgressData(filters = {}) {
        const results = this.getAllResults(filters);
        const studentData = new Map();
        
        results.forEach(result => {
            const name = result.studentName || 'Anonymous';
            if (!studentData.has(name)) {
                studentData.set(name, []);
            }
            studentData.get(name).push({
                studentName: name,
                date: new Date(result.timestamp).toLocaleDateString(),
                score: result.score,
                totalWords: result.totalWords,
                percentage: Math.round((result.score / result.totalWords) * 100),
                timeSpent: result.timeSpent || 0
            });
        });
        
        return Array.from(studentData.values()).flat();
    }

    exportClassReportData(filters = {}) {
        const report = this.generateClassReport(filters);
        if (!report) return [];
        
        return [{
            reportDate: new Date().toLocaleDateString(),
            totalStudents: report.summary.totalStudents,
            totalQuizzes: report.summary.totalQuizzes,
            averageScore: report.summary.averageScore,
            averagePercentage: report.summary.averagePercentage,
            averageTimeSpent: report.summary.averageTimeSpent,
            topDifficultWord: report.wordAnalysis[0]?.word || 'N/A',
            topPerformer: report.studentPerformance[0]?.name || 'N/A',
            mainRecommendation: report.recommendations[0]?.message || 'N/A'
        }];
    }

    exportTeachingFocusData(filters = {}) {
        return this.getTeachingFocusWords(filters).map(word => ({
            word: word.word,
            difficultyScore: word.difficultyScore,
            successRate: word.successRate,
            totalAttempts: word.totalAttempts,
            totalStudents: word.totalStudents,
            teachingPriority: word.teachingPriority,
            recommendedApproach: word.recommendedApproach.join('; ')
        }));
    }

    exportComprehensiveData(filters = {}) {
        const results = this.getAllResults(filters);
        return results.map(result => ({
            studentName: result.studentName || 'Anonymous',
            date: new Date(result.timestamp).toLocaleDateString(),
            score: result.score,
            totalWords: result.totalWords,
            percentage: Math.round((result.score / result.totalWords) * 100),
            timeSpent: result.timeSpent || 0,
            firstAttemptCorrect: result.firstAttemptCorrect || 0,
            secondAttemptCorrect: result.secondAttemptCorrect || 0,
            paragraphTheme: result.paragraphTheme || 'Unknown'
        }));
    }
}

// Initialize global analytics engine
if (typeof window !== 'undefined') {
    window.analyticsEngine = new AnalyticsEngine();
} 