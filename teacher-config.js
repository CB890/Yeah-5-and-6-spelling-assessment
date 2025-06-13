// 🔐 Teacher Dashboard Configuration
// Update these codes as needed for security

const TEACHER_CONFIG = {
    // School-specific access codes
    accessCodes: {
        'KENT2024': {
            schoolName: 'Kent College',
            schoolCode: 'KENT001'
        },
        'VICT2024': {
            schoolName: 'Victory Heights Primary School',
            schoolCode: 'VICT001'
        },
        'ADMIN2024': {
            schoolName: 'Administrator',
            schoolCode: 'ADMIN',
            isAdmin: true
        }
    },
    
    // Session settings
    sessionDuration: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
    
    // Security settings
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
    
    // Instructions for teachers
    instructions: {
        'Kent College': 'Use access code: KENT2024',
        'Victory Heights Primary School': 'Use access code: VICT2024',
        'Administrator': 'Use master code: ADMIN2024'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TEACHER_CONFIG;
} else {
    window.TEACHER_CONFIG = TEACHER_CONFIG;
} 