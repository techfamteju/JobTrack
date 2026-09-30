# JobTrack — Job Application Management System

JobTrack is a full-stack web app for recording job applications, tracking their status, and keeping interview dates and notes organized.

## Features

- Create, read, update, and delete job applications (CRUD)
- Track Applied, Interview, Offer, and Rejected statuses
- Search by company, role, or location
- Filter applications by status
- Dashboard counts for total applications, interviews, offers, and applied jobs
- Optional job links, interview dates, and notes
- Responsive interface
- REST API built with Express and MongoDB persistence

## Tech stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express.js
- API: REST + JSON
- Database: MongoDB with Mongoose

## Prerequisites

Install Node.js (LTS) and either:
- MongoDB Community Server running locally, or
- A MongoDB Atlas cluster and connection URI.

## Setup

1. Extract the project folder and open it in VS Code.
2. Open a terminal in the `jobtrack` folder.
3. Install packages:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env`.
   - Windows PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`

5. Open `.env` and set `MONGODB_URI`.
   - Local MongoDB: `mongodb://127.0.0.1:27017/jobtrack`
   - Atlas: paste your Atlas connection string and replace the password placeholder. Keep the URI private.

6. Start the app:

   ```bash
   npm run dev
   ```

   Or use `npm start` for the normal server.

7. Open `http://localhost:3000` in your browser.

Do not open `public/index.html` directly or use the VS Code Live Server extension for this full-stack version. Open the app through the Node.js server so the frontend can reach `/api/jobs`.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API status |
| GET | `/api/jobs` | List applications |
| GET | `/api/jobs?search=developer` | Search company, title, and location |
| GET | `/api/jobs?status=Interview` | Filter by status |
| GET | `/api/jobs/:id` | Get one application |
| POST | `/api/jobs` | Create an application |
| PUT | `/api/jobs/:id` | Update an application |
| DELETE | `/api/jobs/:id` | Delete an application |

### Example POST body

```json
{
  "company": "Acme Technologies",
  "title": "Junior Software Developer",
  "location": "Pune",
  "status": "Applied",
  "appliedDate": "2026-09-30",
  "jobUrl": "https://example.com/jobs/123",
  "notes": "Applied through company careers page"
}
```

## Test the API

With the server running, open `http://localhost:3000/api/health`. You should see a JSON response.

To test creating a record, use Postman or curl:

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d "{\"company\":\"Acme Technologies\",\"title\":\"Junior Developer\",\"location\":\"Pune\",\"status\":\"Applied\",\"appliedDate\":\"2026-09-30\"}"
```

Then open `http://localhost:3000/api/jobs` to see saved records.

## Troubleshooting

- **MongoDB connection error:** Confirm MongoDB is running or check the Atlas URI, database user, and network access settings.
- **Cannot find module:** Run `npm install` in the project root.
- **Port already in use:** Change `PORT=3000` in `.env` to another port such as `3001`.
- **API error in browser:** Make sure you opened `http://localhost:3000`, not the HTML file directly.

## Possible next improvements

- Add login and per-user application records
- Add pagination and sorting
- Add automated tests
- Add CSV export and interview reminders
- Deploy the backend and database securely

## Security notes

This starter project is intended for local learning. It does not include authentication or authorization. Do not deploy it publicly with real personal data until authentication, per-user data access, rate limiting, and production security settings have been added.
