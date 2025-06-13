// 🎯 Supabase Configuration with Your Real Database!
// Your magic keys to connect to your database in the clouds ☁️

const SUPABASE_CONFIG = {
    url: 'https://gfemccksjaahkoncmvtl.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZW1jY2tzamFhaGtvbmNtdnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mzg5MzcsImV4cCI6MjA2NTQxNDkzN30.j6iLONq7URDTs6vDcGZ6p99K-_xlryF-1yy0XpyizN4'
};

// 🎮 School detection from user selection
function getCurrentSchool() {
    // Get school from dropdown selection
    const schoolSelect = document.getElementById('school-select');
    if (schoolSelect && schoolSelect.value) {
        return schoolSelect.value;
    }
    
    // Fallback to Kent College
    return 'KENT001';
}

// 🏗️ Database Service - This talks to your magic database box!
class SupabaseDatabaseService {
    constructor() {
        this.supabase = null;
        this.currentSchool = null;
        this.isConnected = false;
    }

    // 🚀 Connect to your database
    async init() {
        try {
            console.log('🔌 Connecting to your magic database box...');
            
            // Create connection to Supabase
            const { createClient } = window.supabase;
            this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            
            // Load school information
            await this.loadSchoolInfo();
            
            this.isConnected = true;
            console.log('✅ Database connected successfully!');
            console.log('🏫 School loaded:', this.currentSchool?.school_name);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to database:', error);
            this.isConnected = false;
            return false;
        }
    }

    // 🏫 Load information about the current school
    async loadSchoolInfo() {
        try {
            const schoolCode = getCurrentSchool();
            console.log('🔍 Looking for school:', schoolCode);
            
            const { data, error } = await this.supabase
                .from('schools')
                .select('*')
                .eq('school_code', schoolCode)
                .single();

            if (error) {
                console.error('School lookup error:', error);
                throw error;
            }
            
            this.currentSchool = data;
            console.log('🎯 Found school:', data.school_name);
            
            // Update the page title to show the school name
            if (data.school_name) {
                document.title = `Spelling Assessment - ${data.school_name}`;
            }
            
        } catch (error) {
            console.error('❌ Could not load school info:', error);
            // Create a basic school object for testing
            this.currentSchool = {
                id: 'test-id',
                school_name: 'Test School',
                school_code: 'TEST001'
            };
        }
    }

    // 💾 Save a completed quiz to the database
    async saveQuizSession(sessionData) {
        try {
            if (!this.isConnected) {
                throw new Error('Database not connected');
            }

            if (!this.currentSchool) {
                throw new Error('No school information available');
            }

            console.log('💾 Saving quiz session...');

            // Prepare the quiz session data - match your exact database columns
            const quizData = {
                school_id: this.currentSchool.id,
                student_name: sessionData.studentName || 'Anonymous Student',
                quiz_start_time: sessionData.startTime,
                total_questions: sessionData.totalQuestions || 15,
                total_correct: sessionData.totalCorrect || 0,
                paragraph_title: sessionData.paragraphTitle || 'Unknown'
            };

            // Save to database
            const { data, error } = await this.supabase
                .from('quiz_sessions')
                .insert([quizData])
                .select()
                .single();

            if (error) {
                console.error('Quiz session save error:', error);
                throw error;
            }
            
            console.log('✅ Quiz session saved with ID:', data.id);
            return data;
            
        } catch (error) {
            console.error('❌ Failed to save quiz session:', error);
            throw error;
        }
    }

    // 📝 Save individual word answers to the database
    async saveWordResponses(quizSessionId, wordData) {
        try {
            if (!this.isConnected) {
                throw new Error('Database not connected');
            }

                        console.log('📝 Saving word responses...');

            // Prepare word responses - use only the most basic columns
            const responses = wordData.map((word, index) => ({
                quiz_session_id: quizSessionId,
                correct_word: word.word,
                is_correct: word.correct || false
            }));

            console.log('📝 Prepared responses for saving:', responses);

            // Save all responses at once
            const { data, error } = await this.supabase
                .from('word_responses')
                .insert(responses)
                .select();
                
            console.log('📝 Insert result:', { data, error });

            if (error) {
                console.error('Word responses save error:', error);
                throw error;
            }
            
            console.log('✅ Saved', data.length, 'word responses');
            return data;
            
        } catch (error) {
            console.error('❌ Failed to save word responses:', error);
            throw error;
        }
    }

    // 📊 Get all quiz sessions for this school
    async getSchoolQuizzes(limit = 50) {
        try {
            if (!this.isConnected || !this.currentSchool) {
                return [];
            }

            console.log('📊 Getting quiz data for school...');

            const { data, error } = await this.supabase
                .from('quiz_sessions')
                .select(`
                    *,
                    word_responses (*)
                `)
                .eq('school_id', this.currentSchool.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Quiz fetch error:', error);
                throw error;
            }
            
            console.log('📈 Found', data.length, 'quiz sessions');
            return data;
            
        } catch (error) {
            console.error('❌ Failed to get quiz data:', error);
            return [];
        }
    }

    // 📈 Get word difficulty statistics
    async getWordStatistics() {
        try {
            if (!this.isConnected || !this.currentSchool) {
                return [];
            }

            console.log('📈 Getting word statistics...');

            const { data, error } = await this.supabase
                .from('word_responses')
                .select('correct_word, is_correct, first_attempt_correct')
                .eq('school_id', this.currentSchool.id);

            if (error) throw error;

            // Calculate statistics for each word
            const wordStats = {};
            data.forEach(response => {
                const word = response.correct_word;
                if (!wordStats[word]) {
                    wordStats[word] = {
                        word: word,
                        totalAttempts: 0,
                        totalCorrect: 0,
                        firstAttemptCorrect: 0
                    };
                }
                
                wordStats[word].totalAttempts++;
                if (response.is_correct) wordStats[word].totalCorrect++;
                if (response.first_attempt_correct) wordStats[word].firstAttemptCorrect++;
            });

            // Convert to array and add success rates
            const statsArray = Object.values(wordStats).map(stat => ({
                ...stat,
                successRate: Math.round((stat.totalCorrect / stat.totalAttempts) * 100),
                firstAttemptRate: Math.round((stat.firstAttemptCorrect / stat.totalAttempts) * 100)
            }));

            // Sort by difficulty (lowest success rate first)
            statsArray.sort((a, b) => a.successRate - b.successRate);

            console.log('📊 Calculated stats for', statsArray.length, 'words');
            return statsArray;
            
        } catch (error) {
            console.error('❌ Failed to get word statistics:', error);
            return [];
        }
    }

    // 🧪 Test the database connection
    async testConnection() {
        try {
            console.log('🧪 Testing database connection...');
            
            const { data, error } = await this.supabase
                .from('schools')
                .select('school_name')
                .limit(1);

            if (error) throw error;
            
            console.log('✅ Database test successful!');
            return true;
            
        } catch (error) {
            console.error('❌ Database test failed:', error);
            return false;
        }
    }

    // 📤 Export quiz data as CSV
    exportQuizDataAsCSV(quizData) {
        if (!quizData || quizData.length === 0) {
            console.log('No data to export');
            return;
        }

        // Create CSV content
        const headers = [
            'Student Name',
            'Quiz Date',
            'Total Questions',
            'Total Correct',
            'First Attempt Correct',
            'Time Taken (seconds)',
            'Difficulty Level'
        ];

        const csvContent = [
            headers.join(','),
            ...quizData.map(quiz => [
                `"${quiz.student_name}"`,
                new Date(quiz.created_at).toLocaleDateString(),
                quiz.total_questions,
                quiz.total_correct,
                quiz.total_first_attempt,
                quiz.total_time_seconds,
                `"${quiz.difficulty_level}"`
            ].join(','))
        ].join('\n');

        // Download the file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentSchool.school_name}_quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        console.log('📁 Quiz data exported successfully!');
    }
}

// 🌟 Create the global database service
window.databaseService = new SupabaseDatabaseService();

// 🚀 Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🎬 Starting database initialization...');
        const success = await window.databaseService.init();
        
        if (success) {
            console.log('🎉 Database service is ready to use!');
            
            // Test the connection
            await window.databaseService.testConnection();
            
            // Show success message to user
            showConnectionStatus('success', 'Database connected successfully!');
        } else {
            throw new Error('Failed to initialize database');
        }
        
    } catch (error) {
        console.error('💥 Database initialization failed:', error);
        showConnectionStatus('error', 'Database connection failed. Quiz will work offline.');
    }
});

// 📢 Show connection status to user
function showConnectionStatus(type, message) {
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 10px 15px;
        border-radius: 5px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        z-index: 1000;
        max-width: 250px;
        ${type === 'success' 
            ? 'background: #10b981; color: white;' 
            : 'background: #ef4444; color: white;'
        }
    `;
    statusDiv.textContent = message;
    
    document.body.appendChild(statusDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.parentNode.removeChild(statusDiv);
        }
    }, 5000);
} 