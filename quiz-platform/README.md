# Quiz Platform

A deployable, large-scale online quiz platform with anti-cheat enforcement, random question selection, and professional UI.

## Features

- 50-question question bank stored in editable JSON format
- Each quiz session presents 14 randomly selected questions from the bank
- Anti-cheat enforcement: quiz auto-submits/terminates if user switches tabs, minimizes window, or overlays another application
- Clean, professional UI optimized for large concurrent user volumes
- Easy backend question management - no coding knowledge required to add/edit questions
- Configurable timer, question count, and retry policy via environment variables
- Mobile responsive design
- Results storage with full breakdown and violation logging
- Admin endpoint to export results

## Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | React (Vite) | Fast, component-based, easy to deploy |
| Backend | Node.js + Express | Lightweight REST API |
| Database | JSON flat file | Zero-config, easy to edit manually |
| Hosting | Vercel (frontend) + Railway/Render (backend) | Free tiers, one-click deploy |
| Session Store | JWT tokens (stateless) | Scales to large user numbers |

## File Structure

```
/quiz-platform
├── /frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── StartScreen.jsx
│   │   │   ├── QuizScreen.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── Timer.jsx
│   │   │   ├── ResultScreen.jsx
│   │   │   └── DisqualifiedScreen.jsx
│   │   ├── /hooks
│   │   │   └── useAntiCheat.js
│   │   ├── /utils
│   │   │   └── shuffleQuestions.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
│
├── /backend
│   ├── /data
│   │   └── questions.json        ← EDIT THIS FILE TO UPDATE QUESTIONS
│   ├── /routes
│   │   └── quiz.js
│   ├── server.js
│   └── .env
│
└── README.md
```

## Question Bank Format (`questions.json`)

This is the **only file you need to edit** to update questions. Format must be strictly followed:

```json
{
  "questions": [
    {
      "id": 1,
      "question": "What is the capital of France?",
      "options": ["Berlin", "Madrid", "Paris", "Rome"],
      "correct": 2,
      "explanation": "Paris is the capital and largest city of France."
    },
    {
      "id": 2,
      "question": "Which planet is known as the Red Planet?",
      "options": ["Venus", "Mars", "Jupiter", "Saturn"],
      "correct": 1,
      "explanation": "Mars is called the Red Planet due to iron oxide on its surface."
    }
    // ... 48 more questions following the same structure
  ]
}
```

**Field guide:**
- `id` — unique integer, increment by 1 for each question
- `question` — the question text (string)
- `options` — array of exactly 4 answer strings
- `correct` — **zero-based index** of the correct option (0, 1, 2, or 3)
- `explanation` — shown after the quiz ends (optional but recommended)

## Environment Variables (`.env`)

Create a `.env` file in the backend directory with the following variables:

```env
PORT=3001
QUIZ_DURATION_MINUTES=20
QUESTIONS_PER_QUIZ=14
ADMIN_API_KEY=your-secret-key-here
JWT_SECRET=another-secret-here
ALLOW_RETRY=false
MAX_VIOLATIONS_BEFORE_DISQUALIFY=2
```

All quiz behavior is controlled via these variables — **no code changes needed** to adjust timing, question count, or retry policy.

## Anti-Cheat System

The platform includes a comprehensive anti-cheat system that monitors:

- **Tab switch** - detected via `document.addEventListener('visibilitychange')`
- **Window blur** - detected via `window.addEventListener('blur')` (covers Alt+Tab, clicking another app, minimizing)
- **Fullscreen exit** - exiting fullscreen mode counts as a violation
- **Keyboard shortcuts** - blocks `F12`, `Ctrl+Shift+I`, `Ctrl+U`, `Ctrl+S`, `Ctrl+P`
- **Right-click** - prevents inspect element and context menu

**Violation Handling:**
1. **First violation**: Warning modal with 5-second countdown
2. **Second violation**: Quiz is immediately force-submitted with `status: "DISQUALIFIED"`
3. **Violation log**: Each violation is timestamped and stored in the submission payload

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example above

4. Start the server:
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For production build:
   ```bash
   npm run build
   ```

## Deployment Instructions

### Unified Deployment (Vercel)

You can deploy the **entire application (both React frontend and Express backend)** in a single Vercel project using the pre-configured serverless setup!

1. **Push your repository** to GitHub, GitLab, or Bitbucket.
2. **Import your repository** into the Vercel dashboard:
   - Keep the **Root Directory** as the repository root (`.`).
   - Vercel will automatically detect `vercel.json`, build the frontend via `@vercel/static-build`, and set up the backend as a Serverless function at `/api` via `@vercel/node`.
3. **Configure Environment Variables** in the Vercel Project Settings (see below).
4. **Deploy!** Your application is fully operational under a single domain with zero CORS setup required.

### Alternative Multi-Platform Deployment (Legacy)

#### Frontend Deployment (Vercel)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `/frontend/dist` directory to Vercel:
   - Drag and drop the `dist` folder to Vercel dashboard
   - Or connect your GitHub repository and let Vercel deploy automatically

#### Backend Deployment (Railway or Render)

1. Deploy the `/backend` directory to Railway or Render:
   - Connect your GitHub repository
   - Set the environment variables in the platform dashboard
   - The platform will automatically detect and run `node server.js`

### Environment Variables for Deployment

Make sure to set these environment variables in your hosting platform:

- `PORT` - Usually set automatically by the platform
- `QUIZ_DURATION_MINUTES` - Default: 20
- `QUESTIONS_PER_QUIZ` - Default: 14
- `ADMIN_API_KEY` - Your secret key for admin endpoints
- `JWT_SECRET` - Secret for signing session tokens
- `ALLOW_RETRY` - Boolean: false (default) or true
- `MAX_VIOLATIONS_BEFORE_DISQUALIFY` - Default: 2

### Updating Questions

To update the quiz questions:
1. Edit `/backend/data/questions.json` following the format above
2. Commit and push your changes
3. Railway/Render will automatically redeploy the backend
4. No frontend changes needed

## API Endpoints

### Public Endpoints

```
GET  /api/quiz/start
     → Returns 14 randomly selected questions (options shuffled, correct answer index NOT included)
     → Returns a sessionId (JWT)

POST /api/quiz/submit
     Body: { sessionId, answers: [0, 2, 1, ...], timeTaken, violations[] }
     → Server grades against correct answers
     → Returns { score, total, breakdown[], status }
```

### Admin Endpoints (Protected)

```
GET  /api/admin/results
     → Returns all submissions (protected by admin API key in header)
     → Header: x-api-key: YOUR_ADMIN_API_KEY
```

## Result Storage Format

Each submission is stored with the following format:

```json
{
  "submissionId": "uuid-here",
  "userName": "Rahul Sharma",
  "userId": "ROLL-2024-045",
  "score": 11,
  "total": 14,
  "timeTaken": "14m 32s",
  "status": "COMPLETED",
  "violations": [],
  "submittedAt": "2026-05-29T10:45:00Z",
  "questionBreakdown": [
    { "questionId": 23, "userAnswer": 2, "correct": 2, "isCorrect": true },
    ...
  ]
}
```

## Customization

### Changing Quiz Behavior

All major quiz behaviors can be customized via environment variables in the backend `.env` file:

- `QUIZ_DURATION_MINUTES` - Length of quiz in minutes
- `QUESTIONS_PER_QUIZ` - Number of questions per session
- `MAX_VIOLATIONS_BEFORE_DISQUALIFY` - How many violations before disqualification
- `ALLOW_RETRY` - Whether users can retake the quiz immediately

### Styling

The platform uses a clean, professional design. To modify colors or styling:
1. Edit the CSS in the individual component files
2. Or create a global CSS file and import it in `main.jsx`

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

## Security Notes

- Correct answers are **never** sent to the frontend - grading happens server-side only
- Session tokens are JWT-based with expiration
- Admin endpoint requires API key authentication
- Anti-cheat system prevents common inspection methods
- Input validation should be added for production use

## Limitations & Future Improvements

### Current Limitations
- Uses in-memory storage for results (replace with database for production)
- Question loading happens on each quiz start (could be cached)
- Limited question explanation display in results screens

### Planned Improvements
- Add database persistence (PostgreSQL/MongoDB)
- Implement user accounts and authentication
- Add question categorization and difficulty levels
- Create detailed analytics dashboard
- Add support for different question types (multiple choice, true/false, fill-in-the-blank)
- Implement question import/export functionality
- Add accessibility improvements (ARIA labels, keyboard navigation)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure the frontend is making requests to the correct backend URL
   - Check that the backend CORS middleware is configured correctly

2. **Authentication Errors**
   - Verify the JWT secret matches between token creation and verification
   - Check token expiration time

3. **Anti-Cheat False Positives**
   - Some browser extensions or accessibility tools might trigger violations
   - Consider adding a grace period or whitelist for known extensions

4. **Deployment Issues**
   - Verify environment variables are set correctly in the hosting platform
   - Check that the backend port matches what the platform expects
   - Ensure the frontend is pointing to the correct backend URL

## License

This project is open source and available for modification and deployment.

## Acknowledgments

- Created with React, Vite, Node.js, and Express
- Inspired by online testing platforms and certification exam systems
- Designed for fairness, security, and ease of use