# Supabase Integration Setup Guide

## 🚀 Getting Started with Supabase Backend

This guide will walk you through setting up your spelling assessment system with Supabase as the backend database.

## Prerequisites

- A Supabase account (free tier available)
- Your spelling assessment files
- Basic understanding of SQL (optional)

## Step 1: Create Supabase Project

1. **Sign up at [supabase.com](https://supabase.com)**
2. **Create a new project:**
   - Click "New Project"
   - Choose organization (create one if needed)
   - Enter project name: `spelling-assessment`
   - Choose a region close to your users
   - Create a strong database password (save this!)
   - Click "Create new project"

3. **Wait for setup** (usually 1-2 minutes)

## Step 2: Set Up Database Schema

1. **Go to your Supabase dashboard**
2. **Navigate to SQL Editor** (left sidebar)
3. **Copy and paste the contents of `supabase-schema.sql`** into the editor
4. **Click "Run"** to create all tables and triggers

This will create:
- `students` - Student information
- `quiz_sessions` - Quiz attempt records
- `word_responses` - Individual word attempts
- `word_analytics` - Word difficulty tracking
- `class_analytics` - Class performance data
- `teacher_settings` - Teacher preferences

## Step 3: Get Your Project Credentials

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values:**
   - Project URL: `https://your-project-ref.supabase.co`
   - anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 4: Configure Your Application

1. **Open `supabase-config.js`**
2. **Replace the placeholder values:**

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-actual-project-ref.supabase.co', // Your Project URL
    anonKey: 'your-actual-anon-key-here' // Your anon public key
};
```

## Step 5: Install Dependencies (Optional)

If you want to use npm/package management:

```bash
npm install
```

Or serve the files with a simple HTTP server:

```bash
npm run dev
```

## Step 6: Test the Integration

1. **Open your spelling assessment**
2. **Complete a quiz**
3. **Check the browser console** for success messages:
   - `✅ Supabase initialized successfully`
   - `✅ Quiz session saved`
   - `✅ Word responses saved`

4. **Check your Supabase dashboard:**
   - Go to **Table Editor**
   - Look for data in `quiz_sessions` and `word_responses` tables

## Step 7: Security Configuration (Optional)

For production use, you may want to set up Row Level Security:

1. **Go to Authentication → Settings** in Supabase
2. **Enable Row Level Security** for your tables
3. **Create policies** to control data access

Example policy for quiz sessions:
```sql
CREATE POLICY "Allow insert for everyone" ON quiz_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for everyone" ON quiz_sessions FOR SELECT USING (true);
```

## Features You Get with Supabase Integration

### 📊 Real-time Analytics
- Track word difficulty across all students
- Identify patterns in spelling mistakes
- Monitor class performance trends

### 🎯 Teaching Insights
- Automatically identify words that need more teaching focus
- Track student improvement over time
- Export detailed reports for school records

### 📈 Data Visualization
- Class performance dashboards
- Word difficulty heat maps
- Student progress tracking

### 🔄 Data Sync
- All quiz results automatically saved to cloud
- No data loss if browser crashes
- Access data from any device

## Troubleshooting

### Common Issues:

**1. "Failed to initialize Supabase" error:**
- Check your project URL and anon key are correct
- Ensure you're connected to the internet
- Verify your Supabase project is active

**2. "Database save failed" notification:**
- Check browser console for detailed error messages
- Verify your database schema was created correctly
- Check Supabase project is not paused (free tier limitation)

**3. No data appearing in Supabase tables:**
- Complete a full quiz to trigger data saving
- Check browser console for JavaScript errors
- Verify RLS policies allow data insertion

### Getting Help:

1. **Check browser console** for error messages
2. **Review Supabase logs** in your dashboard
3. **Test with simple queries** in Supabase SQL editor
4. **Contact support** if issues persist

## Advanced Features

### Custom Analytics Queries

You can run custom SQL queries in Supabase to get insights:

```sql
-- Most difficult words
SELECT word, success_rate, total_attempts 
FROM word_analytics 
WHERE total_attempts >= 5 
ORDER BY success_rate ASC 
LIMIT 10;

-- Class performance by date
SELECT DATE(created_at) as date, 
       COUNT(*) as total_quizzes,
       AVG(total_correct) as avg_score
FROM quiz_sessions 
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Real-time Updates

Add real-time subscriptions to see live quiz results:

```javascript
// Subscribe to new quiz sessions
supabase
  .from('quiz_sessions')
  .on('INSERT', payload => {
    console.log('New quiz completed:', payload.new);
  })
  .subscribe();
```

## Next Steps

1. **Customize the teacher dashboard** to show your preferred analytics
2. **Set up automated reports** for weekly/monthly summaries
3. **Add student authentication** for personalized tracking
4. **Integrate with your school's systems** using Supabase APIs

## Cost Considerations

- **Free tier:** Up to 500MB database, 2GB bandwidth/month
- **Paid plans:** Start at $25/month for production use
- **Enterprise:** Custom pricing for schools/districts

Your spelling assessment should work perfectly within the free tier limits for classroom use.

---

## Support

If you need help with the setup, check:
- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Guide](https://supabase.com/docs/reference/javascript)
- [SQL Reference](https://supabase.com/docs/guides/database)

Ready to enhance your spelling assessment with powerful analytics! 🎉 