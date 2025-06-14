# 🏫 School Data Separation Guide

## Overview
Your spelling assessment system automatically separates data between schools to ensure privacy and proper organization. Each school only sees their own students' results.

## How It Works

### 🔐 **Automatic School Detection**
- When students take the quiz, they select their school from the dropdown
- All quiz results are automatically tagged with the correct school
- Data is stored separately in the database with school identifiers

### 👩‍🏫 **Teacher Dashboard Access**
- **Kent College teachers** use code: `KENT2024`
- **Victory Heights Primary teachers** use code: `VICT2024`
- **Administrators** use master code: `ADMIN2024`

### 📊 **Data Filtering**
- **School Teachers**: Only see their own school's data
- **Administrators**: Can see data from all schools
- **Automatic Filtering**: No manual selection needed - based on login code

## What Teachers See

### **Kent College Dashboard (KENT2024)**
- ✅ Only Kent College student results
- ✅ Only Kent College quiz statistics
- ✅ Only Kent College word difficulty analysis
- ❌ No Victory Heights Primary data visible

### **Victory Heights Primary Dashboard (VICT2024)**
- ✅ Only Victory Heights Primary student results
- ✅ Only Victory Heights Primary quiz statistics
- ✅ Only Victory Heights Primary word difficulty analysis
- ❌ No Kent College data visible

### **Administrator Dashboard (ADMIN2024)**
- ✅ All schools' data combined
- ✅ School names shown in results table
- ✅ Complete system overview
- ✅ Can monitor both schools

## Database Structure

### **Schools Table**
```
- Kent College (ID: 1, Code: KENT001)
- Victory Heights Primary (ID: 2, Code: VICT001)
```

### **Quiz Sessions**
- Each quiz is linked to a specific school ID
- Student names are stored with school context
- Results are automatically filtered by school

### **Word Responses**
- Linked to quiz sessions
- Automatically inherit school context
- Used for school-specific word difficulty analysis

## Benefits

### 🔒 **Privacy & Security**
- Schools cannot see each other's data
- Student information remains within school boundaries
- Complies with data protection requirements

### 📈 **Accurate Analytics**
- Word difficulty analysis specific to each school
- Performance metrics relevant to each school's students
- No cross-contamination of statistics

### 🎯 **Focused Insights**
- Teachers see only relevant data for their students
- Easier to identify school-specific learning patterns
- More actionable insights for individual schools

## Technical Implementation

### **Student Quiz Flow**
1. Student selects school from dropdown
2. System identifies school code (KENT001 or VICT001)
3. Quiz results saved with school identifier
4. Data automatically filtered for future access

### **Teacher Dashboard Flow**
1. Teacher enters school-specific access code
2. System identifies teacher's school context
3. Database queries filtered by school ID
4. Only relevant data displayed

### **Administrator Flow**
1. Administrator enters master access code (ADMIN2024)
2. System recognizes admin privileges
3. Database queries include all schools
4. School names shown in results for clarity

## Troubleshooting

### **"No data found" Message**
- Check that students have completed quizzes for your school
- Verify you're using the correct access code for your school
- Ensure students selected the correct school when taking quizzes

### **Seeing Wrong School Data**
- This should not happen due to automatic filtering
- If it occurs, contact system administrator
- Check that correct access code was used

### **Missing Recent Results**
- Click "Refresh Data" button in dashboard
- Check that quiz was completed successfully
- Verify student selected correct school during quiz

## Best Practices

### **For Teachers**
1. **Use Correct Code**: Always use your school's specific access code
2. **Regular Monitoring**: Check dashboard regularly for new results
3. **Student Guidance**: Ensure students select correct school
4. **Data Privacy**: Don't share access codes between schools

### **For Administrators**
1. **Monitor Both Schools**: Use ADMIN2024 code for complete overview
2. **Code Management**: Update access codes regularly
3. **Privacy Compliance**: Ensure teachers only access their school's data
4. **System Maintenance**: Monitor database for any issues

## Support

If you experience issues with school data separation:
1. Verify correct access code usage
2. Check student school selection during quizzes
3. Try refreshing the dashboard
4. Contact system administrator if problems persist

---

**System Status**: ✅ School separation is active and working
**Last Updated**: January 2025
**Version**: 2.0 