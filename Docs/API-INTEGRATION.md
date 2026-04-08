# API Integration Guide - Connecting ERP to SafeAttend Ghost Detector

## Overview

This guide explains how to connect your existing ERP (Enterprise Resource Planning) system to the SafeAttend Ghost Detector. The app needs two data sources:

1. **Punch Data** - Students who punched in today
2. **Lecture Attendance Data** - Students who attended which lectures

**Difficulty Level:** Medium  
**Estimated Time:** 1-2 days  
**Required Skills:** API development, JSON, basic authentication

---

## What You Need to Provide

### 1. API Endpoints

Create these two REST API endpoints in your ERP system:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/punch-data` | GET | Returns students who punched in |
| `/api/lecture-attendance` | GET | Returns lecture attendance |

### 2. Authentication

Choose one method:

**Option A: API Key (Recommended)**
```
Header: Authorization: Bearer YOUR_API_KEY
```

**Option B: JWT Token**
```
Header: Authorization: Bearer JWT_TOKEN
```

**Option C: Simple Query Parameter (Not recommended for production)**
```
/api/punch-data?api_key=YOUR_KEY&date=2025-04-08
```

### 3. Documentation

Provide:
- Base URL (e.g., `https://erp.sandipfoundation.edu`)
- API key
- Response format examples
- Error codes

---

## Endpoint 1: Punch Data API

### Request

```http
GET /api/punch-data?date=2025-04-08
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string (YYYY-MM-DD) | Yes | Date to fetch punch records for |

### Expected Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "studentId": "SF001",
      "name": "Aditya Sharma",
      "rollNo": "22UCS001",
      "division": "A",
      "branch": "Computer Science",
      "year": 3,
      "punchTime": "08:15:30",
      "email": "aditya.sharma@sandipfoundation.edu"
    },
    {
      "studentId": "SF002",
      "name": "Priya Patel",
      "rollNo": "22UCS002",
      "division": "A",
      "branch": "Computer Science",
      "year": 3,
      "punchTime": "08:22:45",
      "email": "priya.patel@sandipfoundation.edu"
    }
  ],
  "total": 2,
  "date": "2025-04-08"
}
```

### Field Descriptions

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `studentId` | string | Yes | "SF001" | Unique student identifier |
| `name` | string | Yes | "Aditya Sharma" | Full name |
| `rollNo` | string | Yes | "22UCS001" | Roll number (displayed in UI) |
| `division` | string | Yes | "A" | Class division |
| `branch` | string | Yes | "Computer Science" | Branch/Department |
| `year` | number | Yes | 3 | Academic year (1-4) |
| `punchTime` | string | Yes | "08:15:30" | Time when student punched in (24h format) |
| `email` | string | Yes | "aditya@..." | Student email for notifications |

### Error Responses

**400 Bad Request - Invalid Date**
```json
{
  "success": false,
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

**401 Unauthorized - Invalid API Key**
```json
{
  "success": false,
  "error": "Invalid or missing API key"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

---

## Endpoint 2: Lecture Attendance API

### Request

```http
GET /api/lecture-attendance?date=2025-04-08
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string (YYYY-MM-DD) | Yes | Date to fetch attendance for |

### Expected Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "studentId": "SF001",
      "name": "Aditya Sharma",
      "rollNo": "22UCS001",
      "division": "A",
      "branch": "Computer Science",
      "year": 3,
      "subjects": [
        {
          "subjectName": "Database Management Systems",
          "subjectCode": "CS301",
          "status": "P"
        },
        {
          "subjectName": "Operating Systems",
          "subjectCode": "CS302",
          "status": "A"
        },
        {
          "subjectName": "Computer Networks",
          "subjectCode": "CS303",
          "status": "P"
        },
        {
          "subjectName": "Machine Learning",
          "subjectCode": "CS304",
          "status": "-"
        }
      ]
    }
  ],
  "total": 1,
  "date": "2025-04-08"
}
```

### Field Descriptions

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `studentId` | string | Yes | "SF001" | Must match punch data |
| `name` | string | Yes | "Aditya Sharma" | Full name |
| `rollNo` | string | Yes | "22UCS001" | Roll number |
| `division` | string | Yes | "A" | Class division |
| `branch` | string | Yes | "Computer Science" | Branch/Department |
| `year` | number | Yes | 3 | Academic year |
| `subjects` | array | Yes | [...] | List of subjects for the day |

### Subject Object Fields

| Field | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `subjectName` | string | Yes | "Database Management Systems" | Full subject name |
| `subjectCode` | string | Yes | "CS301" | Subject code |
| `status` | string | Yes | "P" | Attendance status |

### Status Codes

| Code | Meaning | Display |
|------|---------|---------|
| `P` | Present | ✅ Green badge |
| `A` | Absent | ❌ Red badge (ghost detected) |
| `-` | No Class | ⚪ Gray (no lecture scheduled) |

**Important:** Any subject with status `A` will mark the student as a "ghost" if they punched in.

---

## Code Changes in Ghost Detector

### Step 1: Update `src/lib/mock-data.ts`

Replace the mock functions with real API calls:

```typescript
// src/lib/mock-data.ts

const ERP_BASE_URL = process.env.ERP_API_URL || 'https://erp.sandipfoundation.edu';
const ERP_API_KEY = process.env.ERP_API_KEY;

/**
 * Fetch real punch data from ERP API
 */
export async function getPunchData(date: string): Promise<PunchRecord[]> {
  try {
    const response = await fetch(
      `${ERP_BASE_URL}/api/punch-data?date=${date}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ERP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        // Cache for 5 minutes to reduce server load
        next: { revalidate: 300 }
      }
    );

    if (!response.ok) {
      throw new Error(`ERP API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Validate response structure
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Invalid response format from ERP API');
    }

    return result.data;
  } catch (error) {
    console.error('Failed to fetch punch data:', error);
    
    // Fallback: Return empty array or cached data
    // This prevents the app from crashing if ERP is down
    return [];
  }
}

/**
 * Fetch real lecture attendance from ERP API
 */
export async function getLectureData(date: string): Promise<LectureRecord[]> {
  try {
    const response = await fetch(
      `${ERP_BASE_URL}/api/lecture-attendance?date=${date}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ERP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }
      }
    );

    if (!response.ok) {
      throw new Error(`ERP API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Invalid response format from ERP API');
    }

    return result.data;
  } catch (error) {
    console.error('Failed to fetch lecture data:', error);
    return [];
  }
}
```

### Step 2: Add Environment Variables

Create or update `.env.local`:

```env
# ERP API Configuration
ERP_API_URL=https://erp.sandipfoundation.edu
ERP_API_KEY=your_actual_api_key_here

# Email Configuration (already set up)
RESEND_API_KEY=re_your_resend_key_here
FROM_EMAIL=alerts@sandipfoundation.edu
```

**Important:** Never commit `.env.local` to git. Add it to `.gitignore`.

### Step 3: Update Email Mapping (Optional)

If student emails come from ERP, you can remove the hardcoded map in `ghost-detection.ts`:

```typescript
// In ghost-detection.ts, the email will now come from ERP data
// Remove or comment out the hardcoded studentEmails map
```

---

## Testing the Integration

### Step 1: Test ERP Endpoints Directly

Use curl or Postman to test:

```bash
# Test punch data endpoint
curl -X GET "https://erp.sandipfoundation.edu/api/punch-data?date=2025-04-08" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test lecture attendance endpoint
curl -X GET "https://erp.sandipfoundation.edu/api/lecture-attendance?date=2025-04-08" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Step 2: Test with Ghost Detector

1. Update `.env.local` with your ERP credentials
2. Restart the development server:
   ```bash
   npm run dev
   ```
3. Open the dashboard
4. Check if real student data appears
5. Verify ghost detection works correctly

### Step 3: Verify Data Flow

```
ERP Database → Your ERP API → Ghost Detector → Dashboard Display
     ↓              ↓               ↓               ↓
  Students    JSON Response    Data Processing   UI Render
  punch in    with status      & ghost logic     & alerts
```

---

## Common Issues & Solutions

### Issue 1: CORS Errors

**Error:** `Access-Control-Allow-Origin` header missing

**Solution:** Add CORS headers to your ERP API:

```javascript
// Express.js example
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://safeattend.vercel.app');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  next();
});
```

### Issue 2: Data Format Mismatch

**Error:** "Invalid response format from ERP API"

**Solution:** Compare your JSON structure with the examples above. Common mistakes:
- Using `id` instead of `studentId`
- Using `class` instead of `division`
- Missing `email` field
- Status codes not matching (P/A/-)

### Issue 3: Timeouts

**Error:** Request takes too long

**Solution:** 
- Add database indexes on `studentId` and `date` columns
- Implement caching in your ERP API
- Use pagination if you have 1000+ students

### Issue 4: SSL Certificate Errors

**Error:** `UNABLE_TO_VERIFY_LEAF_SIGNATURE`

**Solution:** 
- Ensure your ERP API has valid SSL certificate
- For testing only: Set `NODE_TLS_REJECT_UNAUTHORIZED=0` (not for production)

---

## Security Checklist

- [ ] API key is stored in environment variables, not in code
- [ ] ERP API uses HTTPS (not HTTP)
- [ ] API key has limited scope (read-only for these endpoints)
- [ ] Rate limiting implemented on ERP API (prevent abuse)
- [ ] Input validation on date parameter (prevent SQL injection)
- [ ] CORS configured to allow only Ghost Detector domain
- [ ] API key can be rotated easily if compromised

---

## Performance Optimization

### For Large Student Bodies (1000+ students)

1. **Add Pagination to ERP API**
   ```http
   GET /api/punch-data?date=2025-04-08&page=1&limit=100
   ```

2. **Implement Caching**
   - Cache punch data for 5 minutes
   - Cache lecture data for 5 minutes
   - Redis or in-memory cache

3. **Database Indexing**
   ```sql
   CREATE INDEX idx_punch_date ON punch_records(date);
   CREATE INDEX idx_punch_student ON punch_records(student_id);
   CREATE INDEX idx_attendance_date ON attendance_records(date);
   ```

---

## Sample Implementation (Node.js/Express)

Here's a complete example of how your ERP API endpoints could look:

```javascript
// routes/attendance.js
const express = require('express');
const router = express.Router();
const db = require('../database'); // Your database connection

// Authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (apiKey !== process.env.GHOST_DETECTOR_API_KEY) {
    return res.status(401).json({ success: false, error: 'Invalid API key' });
  }
  next();
};

// GET /api/punch-data
router.get('/punch-data', authenticateApiKey, async (req, res) => {
  try {
    const { date } = req.query;
    
    // Validate date
    if (!date || !/\d{4}-\d{2}-\d{2}/.test(date)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Fetch from database
    const punchRecords = await db.query(
      `SELECT 
        s.student_id as studentId,
        s.name,
        s.roll_no as rollNo,
        s.division,
        s.branch,
        s.year,
        p.punch_time as punchTime,
        s.email
      FROM students s
      JOIN punch_records p ON s.student_id = p.student_id
      WHERE p.date = ? AND p.status = 'IN'`,
      [date]
    );

    res.json({
      success: true,
      data: punchRecords,
      total: punchRecords.length,
      date
    });
  } catch (error) {
    console.error('Error fetching punch data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/lecture-attendance
router.get('/lecture-attendance', authenticateApiKey, async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date || !/\d{4}-\d{2}-\d{2}/.test(date)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid date format' 
      });
    }

    // Get all students who punched in
    const students = await db.query(
      `SELECT DISTINCT s.student_id, s.name, s.roll_no, s.division, s.branch, s.year
       FROM students s
       JOIN punch_records p ON s.student_id = p.student_id
       WHERE p.date = ?`,
      [date]
    );

    // For each student, get their attendance
    const results = await Promise.all(
      students.map(async (student) => {
        const subjects = await db.query(
          `SELECT 
            sub.name as subjectName,
            sub.code as subjectCode,
            a.status
          FROM subjects sub
          JOIN timetable t ON sub.id = t.subject_id
          LEFT JOIN attendance a ON a.subject_id = sub.id 
            AND a.student_id = ? AND a.date = ?
          WHERE t.date = ? AND t.division = ? AND t.year = ?`,
          [student.student_id, date, date, student.division, student.year]
        );

        return {
          studentId: student.student_id,
          name: student.name,
          rollNo: student.roll_no,
          division: student.division,
          branch: student.branch,
          year: student.year,
          subjects: subjects.map(s => ({
            subjectName: s.subjectName,
            subjectCode: s.subjectCode,
            status: s.status || '-' // '-' if no attendance record
          }))
        };
      })
    );

    res.json({
      success: true,
      data: results,
      total: results.length,
      date
    });
  } catch (error) {
    console.error('Error fetching lecture data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
```

---

## Contact & Support

If you encounter issues during integration:

1. Check the browser console for error messages
2. Verify API responses using Postman
3. Review server logs in Ghost Detector
4. Contact the developer with:
   - Error message
   - Request/response examples
   - ERP system details

---

## Quick Reference Card

| Task | File | Line |
|------|------|------|
| Update API URL | `.env.local` | `ERP_API_URL=` |
| Update API Key | `.env.local` | `ERP_API_KEY=` |
| Modify punch data fetch | `src/lib/mock-data.ts` | `getPunchData()` |
| Modify lecture data fetch | `src/lib/mock-data.ts` | `getLectureData()` |
| Test API manually | Terminal | `curl` command |
| View errors | Browser | DevTools Console |

---

**Last Updated:** April 2026  
**Version:** 1.0  
**System:** SafeAttend Ghost Detector v0.1.0
