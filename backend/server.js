const express = require('express');
const cors = require('cors');
const dataService = require('./services/dataService');
const knockoutService = require('./services/knockoutService');const { ensureDataDir } = require('./utils/fileUtils');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data on startup
async function init() {
  await ensureDataDir();
  await dataService.initializeData();
  console.log('Data initialized successfully');
}

// ==================== AUTH ROUTES ====================

// Login (admin and players)
app.post('/api/login', async (req, res) => {
  try {
const { username, password } = req.body;
    
    // Try admin login first
    try {
      const admin = await dataService.getAdmin();
      if (admin.username === username && admin.password === password) {
        return res.json({ success: true, token: 'admin-token', user: { user_id: 'admin1', username: admin.username, role: 'admin' } });
      }
    } catch {}

    // Try player login
    const authService = require('./services/authService');
    const user = await authService.login(username, password);
    
    res.json({ success: true, token: `player-${user.user_id}`, user });

  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Auth status
app.get('/api/auth-status', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'admin-token') {
    res.json({ authenticated: true, user: { username: 'admin', role: 'admin' } });
  } else {
    res.json({ authenticated: false });
  }
});

// ==================== PLAYER ROUTES ====================

// Get all players
app.get('/api/players', async (req, res) => {
  try {
    const { search } = req.query;
    const players = await dataService.getAllPlayers(search);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single player
app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await dataService.getPlayerById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create player
app.post('/api/players', async (req, res) => {
  try {
    const { player_name, nickname, phone } = req.body;
    
    if (!player_name) {
      return res.status(400).json({ message: 'Player name is required' });
    }
    
    const newPlayer = await dataService.createPlayer({ player_name, nickname, phone });
    res.status(201).json({ message: 'Player created', player_id: newPlayer.player_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update player
app.put('/api/players/:id', async (req, res) => {
  try {
    const { player_name, nickname, phone } = req.body;
    const updated = await dataService.updatePlayer(req.params.id, { player_name, nickname, phone });
    
    if (!updated) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json({ message: 'Player updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete player
app.delete('/api/players/:id', async (req, res) => {
  try {
    await dataService.deletePlayer(req.params.id);
    res.json({ message: 'Player deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MATCH ROUTES ====================

// Get all matches
app.get('/api/matches', async (req, res) => {
  try {
    const { stage, status } = req.query;
    const matches = await dataService.getAllMatches({ stage, status });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single match
app.get('/api/matches/:id', async (req, res) => {
  try {
    const match = await dataService.getMatchById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create match
app.post('/api/matches', async (req, res) => {
  try {
    const { match_name, match_date, match_time, stage, status } = req.body;
    
    if (!match_date || !match_time || !stage) {
      return res.status(400).json({ message: 'Date, time, and stage are required' });
    }
    
    const newMatch = await dataService.createMatch({
      match_name,
      match_date,
      match_time,
      stage,
      status: status || 'Scheduled'
    });
    
    res.status(201).json({ message: 'Match created', match_id: newMatch.match_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update match
app.put('/api/matches/:id', async (req, res) => {
  try {
    const { match_name, match_date, match_time, stage, status } = req.body;
    const updated = await dataService.updateMatch(req.params.id, {
      match_name,
      match_date,
      match_time,
      stage,
      status
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json({ message: 'Match updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete match
app.delete('/api/matches/:id', async (req, res) => {
  try {
    await dataService.deleteMatch(req.params.id);
    res.json({ message: 'Match deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MATCH PARTICIPANTS ROUTES ====================

// Get match participants
app.get('/api/matches/:id/participants', async (req, res) => {
  try {
    const participants = await dataService.getMatchParticipants(req.params.id);
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add participant to match
app.post('/api/matches/:id/participants', async (req, res) => {
  try {
    const { player_id } = req.body;
    
    if (!player_id) {
      return res.status(400).json({ message: 'Player ID is required' });
    }
    
    const participant = await dataService.addParticipant(req.params.id, player_id);
    res.status(201).json({ message: 'Participant added', participant_id: participant.match_participant_id });
  } catch (error) {
    if (error.message === 'Player already in match' || error.message === 'Match already has 2 participants') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update participant (goals and result)
app.put('/api/participants/:id', async (req, res) => {
  try {
    const { goals_scored } = req.body;
    
    if (goals_scored === undefined || goals_scored === null) {
      return res.status(400).json({ message: 'Goals scored is required' });
    }
    
    const updated = await dataService.updateParticipant(req.params.id, parseInt(goals_scored));
    
    if (!updated) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    res.json({ message: 'Participant updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete participant
app.delete('/api/participants/:id', async (req, res) => {
  try {
    await dataService.deleteParticipant(req.params.id);
    res.json({ message: 'Participant removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATS ROUTES ====================

// Get all stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await dataService.getAllStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player stats
app.get('/api/stats/:playerId', async (req, res) => {
  try {
    const stats = await dataService.getPlayerStats(req.params.playerId);
    
    if (!stats) {
      return res.status(404).json({ message: 'Stats not found' });
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recalculate all stats
app.post('/api/stats/recalculate-all', async (req, res) => {
  try {
    await dataService.recalculateAllStats();
    res.json({ message: 'Stats recalculated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD ROUTES ====================

// Dashboard stats
app.get('/api/dashboard', async (req, res) => {
  try {
    const stats = await dataService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RESET DATA ROUTE ====================

// Reset all data (clear everything for fresh start)
app.post('/api/reset-data', async (req, res) => {
  try {
    await dataService.clearAllData();
    await knockoutService.resetKnockout();
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== KNOCKOUT STAGES ROUTES (NEW AUTOMATIC SYSTEM) ====================

// Get tournament status
app.get('/api/knockout/status', async (req, res) => {
  try {
    const status = await knockoutService.getTournamentStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all rounds info
app.get('/api/knockout/rounds', async (req, res) => {
  try {
    const rounds = await knockoutService.getAllRounds();
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all knockout matches
app.get('/api/knockout', async (req, res) => {
  try {
    const matches = await knockoutService.getKnockoutMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get matches by round
app.get('/api/knockout/round/:round', async (req, res) => {
  try {
    const round = parseInt(req.params.round);
    const matches = await knockoutService.getMatchesByRound(round);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start knockout tournament (auto-generates bracket based on top players)
app.post('/api/knockout/start', async (req, res) => {
  try {
    const { top_n } = req.body;
    const stats = await dataService.getAllStats();
    
    if (stats.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 players to start knockout' });
    }
    
    // Use top N players from standings (default: all players)
    const numPlayers = top_n || stats.length;
    const qualifyingPlayers = stats.slice(0, numPlayers);
    
    const result = await knockoutService.generateKnockoutBracket(qualifyingPlayers);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Auto-generate next round
app.post('/api/knockout/next', async (req, res) => {
  try {
    const result = await knockoutService.generateNextRound();
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update match score
app.put('/api/knockout/:id/score', async (req, res) => {
  try {
    const { id } = req.params;
    const { leg, player1_goals, player2_goals } = req.body;
    
    if (leg === undefined || player1_goals === undefined || player2_goals === undefined) {
      return res.status(400).json({ message: 'Leg and goals are required' });
    }
    
    const updated = await knockoutService.updateMatchScore(id, leg, player1_goals, player2_goals);
    res.json({ message: 'Match updated', match: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset knockout
app.post('/api/knockout/reset', async (req, res) => {
  try {
    const result = await knockoutService.resetKnockout();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== LEGACY KNOCKOUT ROUTES (Backward Compatibility) ====================

// Generate Quarter Finals (legacy)
app.post('/api/knockout/generate-quarter-finals', async (req, res) => {
  try {
    const stats = await dataService.getAllStats();
    if (stats.length < 4) {
      return res.status(400).json({ error: 'Need at least 4 players for Quarter Finals' });
    }
    const top4 = stats.slice(0, 4);
    const result = await knockoutService.generateKnockoutBracket(top4);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Generate Semi Finals (legacy)
app.post('/api/knockout/generate-semi-finals', async (req, res) => {
  try {
    const result = await knockoutService.generateNextRound();
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Generate Final (legacy)
app.post('/api/knockout/generate-final', async (req, res) => {
  try {
    const result = await knockoutService.generateNextRound();
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update knockout match (legacy)
app.put('/api/knockout/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { leg, player1_goals, player2_goals } = req.body;
    
    const updated = await knockoutService.updateMatchScore(id, leg, player1_goals, player2_goals);
    res.json({ message: 'Match updated', match: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await init();
});

