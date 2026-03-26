# eFootball Tournament Manager

A full-stack web application for managing a local eFootball tournament where each real-life person competes as an individual player.

## Features

- **Player Management**: Add, edit, delete, and search players
- **Match Management**: Create matches with date, time, and stage
- **Match Participants**: Assign players to matches
- **Score Recording**: Enter goals and automatically determine results
- **Automatic Statistics**: Player stats update automatically
- **Standings**: View rankings sorted by points, goal difference, and goals
- **Stage Progression**: View matches grouped by tournament stage
- **Dark/Light Mode**: Toggle between themes
- **Export**: Download standings as CSV
- **Print-friendly**: Print standings page

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Node.js with Express
- **Storage**: Local JSON files on disk (NO database required)

## Prerequisites

- Node.js (v14 or higher)
- NO MySQL, MongoDB, PostgreSQL, or Firebase required

## Setup Instructions

### 1. Backend Setup

```bash
cd efootball-tournament/backend
npm install
npm start
```

The backend will run on http://localhost:5000

### 2. Frontend Setup

Open a new terminal:

```bash
cd efootball-tournament/frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5173 (or similar)

### 3. Access the Application

Open your browser and navigate to the frontend URL. Login with the default credentials.

## Default Login

- **Username**: admin
- **Password**: admin123

## Data Storage

All data is stored locally in JSON files in the `backend/data/` directory:

- `backend/data/players.json` - Player information
- `backend/data/matches.json` - Match records
- `backend/data/match_participants.json` - Match participants and results
- `backend/data/player_stats.json` - Player statistics
- `backend/data/admin.json` - Admin credentials

### How Local File Storage Works

1. **Reading Data**: When you make API requests, the server reads from JSON files using Node.js `fs/promises` module
2. **Writing Data**: When you add, edit, or delete data, the server writes to JSON files with atomic operations (write to temp file first, then rename)
3. **Persistence**: Data persists across server restarts - the JSON files remain on your disk
4. **Auto-initialization**: On first run, the server creates the data directory and seed data files automatically

### Resetting Data

To reset all data to the default seed data:

```bash
# Method 1: Use the API
curl -X POST http://localhost:5000/api/reset-data
```

```bash
# Method 2: Delete the data files and restart
# Delete these files in backend/data/:
# - players.json
# - matches.json  
# - match_participants.json
# - player_stats.json
# Then restart the backend server
```

## API Endpoints

### Auth
- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout
- `GET /api/auth-status` - Check authentication status

### Players
- `GET /api/players` - Get all players (supports ?search= query)
- `GET /api/players/:id` - Get single player
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Matches
- `GET /api/matches` - Get all matches (supports ?stage= and ?status= queries)
- `GET /api/matches/:id` - Get single match
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

### Match Participants
- `GET /api/matches/:id/participants` - Get participants for a match
- `POST /api/matches/:id/participants` - Add participant
- `PUT /api/participants/:id` - Update participant score
- `DELETE /api/participants/:id` - Remove participant

### Stats
- `GET /api/stats` - Get all player statistics
- `GET /api/stats/:playerId` - Get player stats
- `POST /api/stats/recalculate-all` - Recalculate all stats

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Data Management
- `POST /api/reset-data` - Reset all data to seed data

## Data Structure

### players.json
```json
[
  {
    "player_id": "p1",
    "player_name": "John Smith",
    "nickname": "The Shark",
    "phone": "555-0101"
  }
]
```

### matches.json
```json
[
  {
    "match_id": "m1",
    "match_name": "Match 1",
    "match_date": "2024-01-15",
    "match_time": "10:00:00",
    "stage": "Group Stage",
    "status": "Completed"
  }
]
```

### match_participants.json
```json
[
  {
    "match_participant_id": "mp1",
    "match_id": "m1",
    "player_id": "p1",
    "goals_scored": 2,
    "result": "Win"
  }
]
```

### player_stats.json
```json
[
  {
    "stat_id": "s1",
    "player_id": "p1",
    "matches_played": 3,
    "wins": 2,
    "draws": 1,
    "losses": 0,
    "goals_for": 5,
    "goals_against": 2,
    "goal_difference": 3,
    "points": 7,
    "stage_reached": "Quarter Final"
  }
]
```

## Points System

- Win: 3 points
- Draw: 1 point
- Loss: 0 points

## Project Structure

```
efootball-tournament/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── utils/
│   │   └── fileUtils.js        # JSON file operations
│   ├── services/
│   │   └── dataService.js      # Data access layer
│   └── data/                   # JSON data files
│       ├── players.json
│       ├── matches.json
│       ├── match_participants.json
│       ├── player_stats.json
│       └── admin.json
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── App.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Modal.jsx
│       │   └── Toast.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Players.jsx
│           ├── Matches.jsx
│           ├── MatchDetails.jsx
│           ├── Standings.jsx
│           └── StageProgression.jsx
├── TODO.md
└── README.md
```

## Seed Data

The application comes with sample data:
- 8 players with unique names and nicknames
- 8 matches across different stages (Group Stage, Quarter Final, Semi Final, Final)
- Pre-filled match results with goals
- Automatically calculated player statistics

## Running the Application

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173 in your browser
4. Login with admin/admin123

## Notes

- No database installation required - data is stored in simple JSON files
- Stats are recalculated automatically when match results are saved
- Each match must have exactly 2 participants
- A player cannot appear twice in the same match
- Data files are created automatically on first run
- Atomic writes ensure data integrity even if the server crashes mid-write

---

## Copyright

All rights reserved. Agbavor Jesse Kofi Jnr. 8th March, 2026.

