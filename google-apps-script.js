/**
 * Google Apps Script for Spelling Assessment Data Collection
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the default code with this script
 * 4. Save and deploy as web app
 * 5. Set execution permissions to "Anyone" 
 * 6. Copy the web app URL to your spelling assessment dashboard
 */

// Configuration - Edit these if needed
const CONFIG = {
  SHEET_NAME: 'Spelling Results',
  SUMMARY_SHEET_NAME: 'Summary',
  TIMEZONE: 'Europe/London', // Change to your timezone
  MAX_ROWS: 10000 // Maximum rows before archiving
};

/**
 * Main function to handle incoming POST requests from the spelling assessment
 */
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Log the request for debugging
    console.log('Received data:', data);
    
    // Handle different types of requests
    switch (data.action) {
      case 'addResult':
        return addSpellingResult(data.data);
      case 'test':
        return testConnection();
      default:
        return createResponse(false, 'Unknown action: ' + data.action);
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return createResponse(false, 'Error processing request: ' + error.message);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spelling Assessment API</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
          .status { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 5px; padding: 15px; margin: 10px 0; }
          .info { background: #e3f2fd; border: 1px solid #2196f3; border-radius: 5px; padding: 15px; margin: 10px 0; }
          .code { background: #f5f5f5; border: 1px solid #ddd; border-radius: 3px; padding: 10px; font-family: monospace; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>🎯 Spelling Assessment Google Apps Script</h1>
        
        <div class="status">
          <h3>✅ Status: Running Successfully!</h3>
          <p><strong>Current Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Script Version:</strong> 1.0</p>
        </div>
        
        <div class="info">
          <h3>📊 Ready to Receive Data</h3>
          <p>This endpoint is configured to receive POST requests from the Interactive Spelling Assessment application.</p>
          <p><strong>Supported Actions:</strong></p>
          <ul>
            <li><code>addResult</code> - Add new quiz results to spreadsheet</li>
            <li><code>test</code> - Test connection functionality</li>
          </ul>
        </div>
        
        <div class="info">
          <h3>🔧 Next Steps</h3>
          <ol>
            <li>Copy this URL: <span class="code">${ScriptApp.getService().getUrl()}</span></li>
            <li>Paste it into your Spelling Assessment Teacher Dashboard > Settings</li>
            <li>Add your Google Sheet ID to complete the setup</li>
            <li>Test the connection from the dashboard</li>
          </ol>
        </div>
        
        <div class="info">
          <h3>📋 Spreadsheet Info</h3>
          <p><strong>Spreadsheet Name:</strong> ${SpreadsheetApp.getActiveSpreadsheet().getName()}</p>
          <p><strong>Spreadsheet ID:</strong> <span class="code">${SpreadsheetApp.getActiveSpreadsheet().getId()}</span></p>
          <p><strong>Sheets:</strong> ${SpreadsheetApp.getActiveSpreadsheet().getSheets().map(s => s.getName()).join(', ')}</p>
        </div>
      </body>
      </html>
    `;
    
    return HtmlService.createHtmlOutput(html);
  } catch (error) {
    return HtmlService.createHtmlOutput(`
      <h2>❌ Script Error</h2>
      <p>Error: ${error.message}</p>
      <p>Please check the script deployment settings.</p>
    `);
  }
}

/**
 * Add a new spelling result to the spreadsheet
 */
function addSpellingResult(resultData) {
  try {
    // Get or create the main results sheet
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    
    // Set up headers if this is the first row
    setupHeaders(sheet);
    
    // Prepare the row data
    const rowData = [
      resultData.studentName || 'Anonymous',
      new Date(resultData.timestamp),
      resultData.totalScore + '/15',
      resultData.firstAttemptCorrect,
      resultData.secondAttemptCorrect,
      resultData.accuracy + '%',
      resultData.timeTaken,
      resultData.paragraphTitle,
      formatWordsAndResults(resultData.wordsAndResults),
      formatDetailedResults(resultData.wordsAndResults),
      resultData.timestamp // Keep original timestamp for sorting
    ];
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Update summary statistics
    updateSummarySheet(resultData);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 11);
    
    // Sort by timestamp (most recent first)
    const range = sheet.getDataRange();
    if (range.getNumRows() > 1) {
      range.sort([{column: 11, ascending: false}]);
    }
    
    return createResponse(true, 'Result added successfully');
    
  } catch (error) {
    console.error('Error adding result:', error);
    return createResponse(false, 'Error adding result: ' + error.message);
  }
}

/**
 * Set up column headers for the results sheet
 */
function setupHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Student Name',
      'Date & Time',
      'Score',
      '1st Attempt Correct',
      '2nd Attempt Correct', 
      'Accuracy',
      'Time Taken',
      'Paragraph Theme',
      'Words Tested',
      'Detailed Results',
      'Timestamp (Hidden)'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    
    // Hide the timestamp column (used for sorting)
    sheet.hideColumns(11);
    
    // Set column widths
    sheet.setColumnWidth(1, 150); // Student Name
    sheet.setColumnWidth(2, 150); // Date & Time
    sheet.setColumnWidth(3, 80);  // Score
    sheet.setColumnWidth(4, 100); // 1st Attempt
    sheet.setColumnWidth(5, 100); // 2nd Attempt
    sheet.setColumnWidth(6, 80);  // Accuracy
    sheet.setColumnWidth(7, 100); // Time Taken
    sheet.setColumnWidth(8, 150); // Paragraph Theme
    sheet.setColumnWidth(9, 300); // Words Tested
    sheet.setColumnWidth(10, 400); // Detailed Results
  }
}

/**
 * Update the summary sheet with aggregated statistics
 */
function updateSummarySheet(resultData) {
  try {
    const summarySheet = getOrCreateSheet(CONFIG.SUMMARY_SHEET_NAME);
    
    // Set up summary headers if needed
    if (summarySheet.getLastRow() === 0) {
      setupSummaryHeaders(summarySheet);
    }
    
    // Get all results to calculate statistics
    const resultsSheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    const allData = resultsSheet.getDataRange().getValues();
    
    if (allData.length <= 1) return; // Only headers, no data yet
    
    // Calculate summary statistics
    const stats = calculateSummaryStats(allData);
    
    // Update summary sheet
    updateSummaryData(summarySheet, stats);
    
  } catch (error) {
    console.error('Error updating summary:', error);
  }
}

/**
 * Calculate summary statistics from all results
 */
function calculateSummaryStats(allData) {
  const dataRows = allData.slice(1); // Remove headers
  
  const stats = {
    totalQuizzes: dataRows.length,
    uniqueStudents: new Set(dataRows.map(row => row[0])).size,
    averageScore: 0,
    averageAccuracy: 0,
    totalTimeSpent: 0,
    lastUpdated: new Date()
  };
  
  if (dataRows.length > 0) {
    // Calculate averages
    let totalScore = 0;
    let totalAccuracy = 0;
    
    dataRows.forEach(row => {
      // Extract score from "X/15" format
      const scoreText = row[2].toString();
      const score = parseInt(scoreText.split('/')[0]) || 0;
      totalScore += score;
      
      // Extract accuracy from "X%" format
      const accuracyText = row[5].toString();
      const accuracy = parseInt(accuracyText.replace('%', '')) || 0;
      totalAccuracy += accuracy;
    });
    
    stats.averageScore = (totalScore / dataRows.length).toFixed(1);
    stats.averageAccuracy = (totalAccuracy / dataRows.length).toFixed(1);
  }
  
  return stats;
}

/**
 * Set up headers for the summary sheet
 */
function setupSummaryHeaders(sheet) {
  const summaryData = [
    ['📊 Spelling Assessment Summary', ''],
    ['', ''],
    ['Metric', 'Value'],
    ['Total Quizzes Completed', '0'],
    ['Unique Students', '0'],
    ['Average Score (out of 15)', '0'],
    ['Average Accuracy', '0%'],
    ['Last Updated', ''],
    ['', ''],
    ['🎯 Quick Stats', ''],
    ['Most Recent Quiz', ''],
    ['Today\'s Quizzes', '0'],
    ['This Week\'s Quizzes', '0'],
    ['This Month\'s Quizzes', '0']
  ];
  
  sheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData);
  
  // Format the summary sheet
  sheet.getRange(1, 1, 1, 2).merge();
  sheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');
  sheet.getRange(3, 1, 1, 2).setFontWeight('bold').setBackground('#f0f0f0');
  sheet.getRange(10, 1, 1, 2).setFontWeight('bold').setBackground('#e1f5fe');
  
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 150);
}

/**
 * Update summary data with current statistics
 */
function updateSummaryData(sheet, stats) {
  sheet.getRange(4, 2).setValue(stats.totalQuizzes);
  sheet.getRange(5, 2).setValue(stats.uniqueStudents);
  sheet.getRange(6, 2).setValue(stats.averageScore);
  sheet.getRange(7, 2).setValue(stats.averageAccuracy + '%');
  sheet.getRange(8, 2).setValue(stats.lastUpdated);
  
  // Calculate period-specific stats
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(startOfDay.getTime() - (startOfDay.getDay() * 24 * 60 * 60 * 1000));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const resultsSheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  const allData = resultsSheet.getDataRange().getValues();
  
  if (allData.length > 1) {
    const dataRows = allData.slice(1);
    
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    let mostRecentQuiz = '';
    
    dataRows.forEach(row => {
      const quizDate = new Date(row[1]);
      
      if (quizDate >= startOfDay) todayCount++;
      if (quizDate >= startOfWeek) weekCount++;
      if (quizDate >= startOfMonth) monthCount++;
      
      if (!mostRecentQuiz || quizDate > new Date(mostRecentQuiz)) {
        mostRecentQuiz = `${row[0]} - ${quizDate.toLocaleDateString()}`;
      }
    });
    
    sheet.getRange(11, 2).setValue(mostRecentQuiz);
    sheet.getRange(12, 2).setValue(todayCount);
    sheet.getRange(13, 2).setValue(weekCount);
    sheet.getRange(14, 2).setValue(monthCount);
  }
}

/**
 * Format words and results for display
 */
function formatWordsAndResults(wordsAndResults) {
  if (!wordsAndResults || !Array.isArray(wordsAndResults)) {
    return 'No word data available';
  }
  
  return wordsAndResults.map(item => item.word).join(', ');
}

/**
 * Format detailed results for display
 */
function formatDetailedResults(wordsAndResults) {
  if (!wordsAndResults || !Array.isArray(wordsAndResults)) {
    return 'No detailed results available';
  }
  
  return wordsAndResults.map(item => {
    const status = item.firstAttemptCorrect ? '✓1st' : 
                   item.correct ? '✓2nd' : '✗';
    const attempts = item.userAnswers ? ` (${item.userAnswers.join(', ')})` : '';
    return `${item.word}:${status}${attempts}`;
  }).join(' | ');
}

/**
 * Get or create a sheet with the given name
 */
function getOrCreateSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  return sheet;
}

/**
 * Test connection function
 */
function testConnection() {
  try {
    const testData = {
      message: 'Connection test successful!',
      timestamp: new Date().toISOString(),
      spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
      spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName()
    };
    
    return createResponse(true, 'Connection test successful', testData);
  } catch (error) {
    return createResponse(false, 'Connection test failed: ' + error.message);
  }
}

/**
 * Create a standardized response
 */
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Archive old data (run manually or via trigger)
 */
function archiveOldData() {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    const numRows = sheet.getLastRow();
    
    if (numRows > CONFIG.MAX_ROWS) {
      // Create archive sheet
      const archiveSheetName = `Archive_${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy_MM')}`;
      const archiveSheet = getOrCreateSheet(archiveSheetName);
      
      // Move old data to archive
      const excessRows = numRows - CONFIG.MAX_ROWS;
      const dataToArchive = sheet.getRange(2, 1, excessRows, sheet.getLastColumn()).getValues();
      
      if (archiveSheet.getLastRow() === 0) {
        // Copy headers to archive sheet
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();
        archiveSheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
      }
      
      // Add data to archive
      archiveSheet.getRange(archiveSheet.getLastRow() + 1, 1, dataToArchive.length, dataToArchive[0].length).setValues(dataToArchive);
      
      // Delete old data from main sheet
      sheet.deleteRows(2, excessRows);
      
      console.log(`Archived ${excessRows} rows to ${archiveSheetName}`);
    }
  } catch (error) {
    console.error('Error archiving data:', error);
  }
}

/**
 * Set up automated triggers (run once after deployment)
 */
function setupTriggers() {
  // Delete existing triggers
  ScriptApp.getProjectTriggers().forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // Create weekly archive trigger
  ScriptApp.newTrigger('archiveOldData')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .create();
    
  console.log('Triggers set up successfully');
} 