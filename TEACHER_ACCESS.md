# 🔐 Teacher Dashboard Access Guide

## Overview
The teacher dashboard is now protected with access codes to ensure only authorized teachers can view student data and quiz results.

## Access Codes

### Current Access Codes:
- **Kent College**: `KENT2024`
- **Victory Heights Primary School**: `VICT2024`
- **Administrator** (all schools): `ADMIN2024`

## How to Access the Dashboard

1. **Open the Teacher Dashboard**
   - Navigate to `teacher-dashboard.html` in your browser
   - You'll see a login screen with an access code field

2. **Enter Your Access Code**
   - Type your school's access code (case-insensitive)
   - Press Enter or click "Access Dashboard"

3. **Dashboard Access**
   - Once authenticated, you'll have access for 4 hours
   - The session will automatically expire for security
   - You can logout manually using the "Logout" button

## Security Features

### Session Management
- **Session Duration**: 4 hours (configurable)
- **Auto-logout**: Sessions expire automatically
- **Manual Logout**: Red logout button in dashboard controls

### Access Control
- **School-specific codes**: Each school has its own access code
- **Administrator access**: Master code for all schools
- **Case-insensitive**: Codes work in any case (KENT2024, kent2024, Kent2024)

### Data Isolation
- Teachers only see data from their authenticated school
- Administrator can see all school data
- No cross-school data access

## Updating Access Codes

### Method 1: Edit Configuration File
1. Open `teacher-config.js`
2. Update the `accessCodes` section:
```javascript
accessCodes: {
    'NEWCODE2024': {
        schoolName: 'Your School Name',
        schoolCode: 'SCHOOL001'
    }
}
```

### Method 2: Direct HTML Edit
1. Open `teacher-dashboard.html`
2. Find the `getTeacherCodes()` function
3. Update the fallback codes if needed

## Troubleshooting

### "Incorrect access code" Error
- Check that you're using the correct code for your school
- Ensure there are no extra spaces
- Try typing the code in all caps

### Session Expired
- This happens after 4 hours of inactivity
- Simply enter your access code again to continue

### Can't Access Dashboard
- Verify you're using the correct URL (`teacher-dashboard.html`)
- Check that JavaScript is enabled in your browser
- Try refreshing the page

## Security Best Practices

### For School Administrators:
1. **Change Default Codes**: Update access codes regularly
2. **Share Securely**: Only share codes with authorized teachers
3. **Monitor Access**: Check who has access to the dashboard
4. **Regular Updates**: Change codes at least once per term

### For Teachers:
1. **Keep Codes Private**: Don't share your access code
2. **Logout When Done**: Use the logout button when finished
3. **Secure Devices**: Don't save codes in browsers on shared computers
4. **Report Issues**: Contact IT if you suspect unauthorized access

## Technical Details

### Files Involved:
- `teacher-dashboard.html` - Main dashboard with authentication
- `teacher-config.js` - Configuration file for access codes
- Session data stored in browser's sessionStorage

### Session Storage:
- `teacherAuthenticated` - Authentication status
- `teacherSchool` - Authenticated school name
- `teacherSchoolCode` - School code
- `authTime` - Login timestamp

### Customization Options:
- Session duration (default: 4 hours)
- Access codes and school mappings
- Login attempt limits (future feature)
- Lockout duration (future feature)

## Support

If you need help with teacher dashboard access:
1. Check this guide first
2. Try the troubleshooting steps
3. Contact your school's IT administrator
4. For technical issues, contact the system developer

---

**Last Updated**: January 2025  
**Version**: 1.0 