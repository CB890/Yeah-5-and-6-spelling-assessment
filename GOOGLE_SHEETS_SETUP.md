# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the Interactive Spelling Assessment to automatically collect and organize student results.

## 📋 Overview

The Google Sheets integration allows you to:
- Automatically collect all spelling quiz results
- View real-time student performance data
- Export data for reports and analysis
- Track class progress over time
- Generate summary statistics

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a New Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Rename it to something like "Spelling Assessment Results"

### Step 2: Open Apps Script
1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents of `google-apps-script.js` (from this project)
4. Paste it into the Apps Script editor
5. Click **Save** (💾) and give your project a name like "Spelling Assessment API"

### Step 3: Deploy as Web App
1. Click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Type" and select **Web app**
3. Fill in the settings:
   - **Description:** "Spelling Assessment Data Collector"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. Click **Deploy**
5. **IMPORTANT:** Copy the Web app URL that appears (it looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### Step 4: Configure the Spelling Assessment
1. Open your spelling assessment in a web browser
2. Click **Teacher Dashboard** link
3. Go to the **Settings** tab
4. Paste your Web app URL into the **Google Sheets Script URL** field
5. Enter your Google Sheet ID (found in the sheet URL between `/d/` and `/edit`)
6. Click **Save Configuration**
7. Click **Test Connection** to verify it's working

## ✅ Testing Your Setup

### Test the Web App Directly
1. Open your Web app URL in a new browser tab
2. You should see a page saying "✅ Script is running correctly!"

### Test from the Spelling Assessment
1. In the Teacher Dashboard > Settings tab
2. Click **Test Connection** 
3. You should see a green success message
4. Check your Google Sheet - it should now have "Spelling Results" and "Summary" tabs

### Run a Test Quiz
1. Complete a spelling quiz with a test student name
2. Check your Google Sheet - the result should appear automatically
3. The Summary tab should update with statistics

## 📊 Understanding Your Data

### Spelling Results Sheet
Contains detailed data for each quiz:
- **Student Name:** Name entered by student
- **Date & Time:** When the quiz was completed
- **Score:** Final score (e.g., "12/15")
- **1st Attempt Correct:** Words correct on first try
- **2nd Attempt Correct:** Words correct on second try
- **Accuracy:** Overall percentage
- **Time Taken:** How long the quiz took
- **Paragraph Theme:** Which story template was used
- **Words Tested:** List of all spelling words
- **Detailed Results:** Word-by-word breakdown with attempts

### Summary Sheet
Shows aggregate statistics:
- Total quizzes completed
- Number of unique students
- Average score and accuracy
- Recent activity (today, this week, this month)
- Last updated timestamp

## 🔧 Advanced Configuration

### Customizing the Script
You can edit these settings in the `google-apps-script.js` file:

```javascript
const CONFIG = {
  SHEET_NAME: 'Spelling Results',          // Name of main data sheet
  SUMMARY_SHEET_NAME: 'Summary',           // Name of summary sheet
  TIMEZONE: 'Europe/London',               // Your timezone
  MAX_ROWS: 10000                          // Max rows before archiving
};
```

### Setting Up Automatic Archiving
1. In Apps Script, click **Triggers** (⏰) in the left sidebar
2. Click **+ Add Trigger**
3. Choose function: `setupTriggers`
4. Choose event source: **Time-driven**
5. Choose type: **Head function**
6. Click **Save**
7. Run once to set up weekly archiving

### Data Privacy Settings
- Data is stored in your personal Google Drive
- Only you can access the spreadsheet (unless you share it)
- The spelling assessment stores data locally in browsers
- You can delete all data anytime by clearing the sheet

## 🛠️ Troubleshooting

### "Connection failed" Error
1. Check that your Web app URL is correct
2. Ensure the script is deployed with "Anyone" access
3. Try redeploying the script with a new version
4. Check the Apps Script execution logs for errors

### No Data Appearing in Sheet
1. Verify the Sheet ID is correct (from the Google Sheets URL)
2. Check that both URL and Sheet ID are saved in Settings
3. Make sure students are entering names when taking quizzes
4. Try a test connection from the Teacher Dashboard

### Permission Issues
1. The script needs permission to access your Google Sheets
2. When first deploying, you'll need to authorize the script
3. Click through the permission warnings (this is normal)
4. If stuck, try deploying as a new version

### Script Errors
1. Go to Apps Script > **Executions** to see error logs
2. Common issues:
   - Missing quotation marks when copying code
   - Incorrect indentation
   - Missing functions (ensure all code was copied)

## 📱 Mobile/Tablet Considerations

- The integration works on all devices
- Students can take quizzes on tablets/phones
- Data syncs automatically regardless of device
- Teacher dashboard works on desktop/laptop browsers

## 🔐 Security & Privacy

- **No personal data is required** - student names are optional
- **Data stays in your Google account** - not shared with third parties
- **Local browser storage** - quiz data saved locally until synced
- **Secure transmission** - all data sent over HTTPS
- **Full control** - you can delete or export data anytime

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide first
2. Verify all URLs and IDs are correct
3. Try the test connection feature
4. Check Apps Script execution logs
5. Contact technical support with specific error messages

## 🎯 Next Steps

Once set up, you can:
- **Monitor in real-time** - Results appear immediately after quizzes
- **Export for reports** - Use the Export tab in Teacher Dashboard
- **Analyze trends** - Use the Summary sheet for insights
- **Share with colleagues** - Give them view access to your sheet
- **Backup data** - Download CSV files regularly

Your Google Sheets integration is now ready! Students can start taking quizzes and results will automatically appear in your spreadsheet. 