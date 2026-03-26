const { readJsonFile, writeJsonFile, initJsonFile, generateId } = require('../utils/fileUtils');

// Data file names
const FILES = {
  PLAYERS: 'players.json',
  MATCHES: 'matches.json',
  PARTICIPANTS: 'match_participants.json',
  STATS: 'player_stats.json',
  ADMIN: 'admin.json',
  KNOCKOUT_MATCHES: 'knockout_matches.json'
};

// Default admin credentials
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

// Seed data
const SEED_PLAYERS = [
  { player_id: 'p1', player_name: 'John Smith', nickname: 'The Shark', phone: '555-0101' },
  { player_id: 'p2', player_name: 'Mike Johnson', nickname: 'Thunder', phone: '555-0102' },
  { player_id: 'p3', player_name: 'David Williams', nickname: 'Lightning', phone: '555-0103' },
  { player_id: 'p4', player_name: 'James Brown', nickname: 'Ace', phone: '555-0104' },
  { player_id: 'p5', player_name: 'Robert Davis', nickname: 'Phantom', phone: '555-0105' },
  { player_id: 'p6', player_name: 'William Miller', nickname: 'Viper', phone: '555-0106' },
  { player_id: 'p7', player_name: 'Christopher Wilson', nickname: 'Storm', phone: '555-0107' },
  { player_id: 'p8', player_name: 'Daniel Taylor', nickname: 'Hawk', phone: '555-0108' }
];

const SEED_MATCHES = [
  { match_id: 'm1', match_name: 'Match 1', match_date: '2024-01-15', match_time: '10:00:00', stage: 'Group Stage', status: 'Completed' },
  { match_id: 'm2', match_name: 'Match 2', match_date: '2024-01-15', match_time: '11:00:00', stage: 'Group Stage', status: 'Completed' },
  { match_id: 'm3', match_name: 'Match 3', match_date: '2024-01-16', match_time: '10:00:00', stage: 'Group Stage', status: 'Completed' },
  { match_id: 'm4', match_name: 'Match 4', match_date: '2024-01-17', match_time: '10:00:00', stage: 'Quarter Final', status: 'Completed' },
  { match_id: 'm5', match_name: 'Match 5', match_date: '2024-01-18', match_time: '10:00:00', stage: 'Semi Final', status: 'Scheduled' },
  { match_id: 'm6', match_name: 'Match 6', match_date: '2024-01-19', match_time: '10:00:00', stage: 'Final', status: 'Scheduled' },
  { match_id: 'm7', match_name: 'Match 7', match_date: '2024-01-15', match_time: '14:00:00', stage: 'Group Stage', status: 'Completed' },
  { match_id: 'm8', match_name: 'Match 8', match_date: '2024-01-16', match_time: '11:00:00', stage: 'Group Stage', status: 'Completed' }
];

const SEED_PARTICIPANTS = [
  { match_participant_id: 'mp1', match_id: 'm1', player_id: 'p1', goals_scored: 2, result: 'Win' },
  { match_participant_id: 'mp2', match_id: 'm1', player_id: 'p2', goals_scored: 1, result: 'Loss' },
  { match_participant_id: 'mp3', match_id: 'm2', player_id: 'p3', goals_scored: 0, result: 'Draw' },
  { match_participant_id: 'mp4', match_id: 'm2', player_id: 'p4', goals_scored: 0, result: 'Draw' },
  { match_participant_id: 'mp5', match_id: 'm3', player_id: 'p5', goals_scored: 3, result: 'Win' },
  { match_participant_id: 'mp6', match_id: 'm3', player_id: 'p6', goals_scored: 2, result: 'Loss' },
  { match_participant_id: 'mp7', match_id: 'm4', player_id: 'p1', goals_scored: 1, result: 'Win' },
  { match_participant_id: 'mp8', match_id: 'm4', player_id: 'p3', goals_scored: 0, result: 'Loss' },
  { match_participant_id: 'mp9', match_id: 'm7', player_id: 'p7', goals_scored: 2, result: 'Win' },
  { match_participant_id: 'mp10', match_id: 'm7', player_id: 'p8', goals_scored: 1, result: 'Loss' },
  { match_participant_id: 'mp11', match_id: 'm8', player_id: 'p2', goals_scored: 1, result: 'Loss' },
  { match_participant_id: 'mp12', match_id: 'm8', player_id: 'p4', goals_scored: 2, result: 'Win' }
];

// Stage order for comparison
const STAGE_ORDER = {
  'Group Stage': 1,
  'Knockout': 2,
  'Quarter Final': 3,
  'Semi Final': 4,
  'Final': 5
};

// Initialize all data files (only creates default data if files don't exist)
async function initializeData() {
  // Initialize new services
  await require('./authService').initializeUsers();
  
  // Check if data already exists by reading existing files
  const existingPlayers = await readJsonFile(FILES.PLAYERS);
  const existingMatches = await readJsonFile(FILES.MATCHES);
  
  // Only initialize with seed data if files are empty (first run)
  if (existingPlayers.length === 0) {
    await initJsonFile(FILES.PLAYERS, SEED_PLAYERS);
    await initJsonFile(FILES.MATCHES, SEED_MATCHES);
    await initJsonFile(FILES.PARTICIPANTS, SEED_PARTICIPANTS);
    await initJsonFile(FILES.STATS, []);
    await initJsonFile(FILES.ADMIN, DEFAULT_ADMIN);
    
    // Calculate initial stats
    await recalculateAllStats();
    console.log('Seed data initialized');
  } else {
    // Just ensure admin exists
    await initJsonFile(FILES.ADMIN, DEFAULT_ADMIN);
    console.log('Existing data loaded');
  }
}


// ==================== ADMIN ====================

async function getAdmin() {
  return await initJsonFile(FILES.ADMIN, DEFAULT_ADMIN);
}

async function verifyAdmin(username, password) {
  const admin = await getAdmin();
  return admin.username === username && admin.password === password;
}

// ==================== PLAYERS ====================

async function getAllPlayers(search = '') {
  const players = await readJsonFile(FILES.PLAYERS);
  if (!search) return players.sort((a, b) => a.player_name.localeCompare(b.player_name));
  
  const searchLower = search.toLowerCase();
  return players.filter(p => 
    p.player_name.toLowerCase().includes(searchLower) || 
    (p.nickname && p.nickname.toLowerCase().includes(searchLower))
  ).sort((a, b) => a.player_name.localeCompare(b.player_name));
}

async function getPlayerById(playerId) {
  const players = await readJsonFile(FILES.PLAYERS);
  return players.find(p => p.player_id === playerId);
}

async function createPlayer(playerData) {
  const players = await readJsonFile(FILES.PLAYERS);
  const newPlayer = {
    player_id: 'p' + generateId(),
    ...playerData
  };
  players.push(newPlayer);
  await writeJsonFile(FILES.PLAYERS, players);
  
  // Create empty stats for new player
  await createPlayerStats(newPlayer.player_id);
  
  return newPlayer;
}

async function updatePlayer(playerId, playerData) {
  const players = await readJsonFile(FILES.PLAYERS);
  const index = players.findIndex(p => p.player_id === playerId);
  if (index === -1) return null;
  
  players[index] = { ...players[index], ...playerData };
  await writeJsonFile(FILES.PLAYERS, players);
  return players[index];
}

async function deletePlayer(playerId) {
  const players = await readJsonFile(FILES.PLAYERS);
  const filteredPlayers = players.filter(p => p.player_id !== playerId);
  await writeJsonFile(FILES.PLAYERS, filteredPlayers);
  
  // Remove related participants and recalculate stats
  await deletePlayerFromParticipants(playerId);
  await recalculateAllStats();
  
  return true;
}

// ==================== MATCHES ====================

async function getAllMatches(filters = {}) {
  let matches = await readJsonFile(FILES.MATCHES);
  
  if (filters.stage) {
    matches = matches.filter(m => m.stage === filters.stage);
  }
  if (filters.status) {
    matches = matches.filter(m => m.status === filters.status);
  }
  
  return matches.sort((a, b) => {
    const dateA = new Date(a.match_date + ' ' + a.match_time);
    const dateB = new Date(b.match_date + ' ' + b.match_time);
    return dateA - dateB;
  });
}

async function getMatchById(matchId) {
  const matches = await readJsonFile(FILES.MATCHES);
  return matches.find(m => m.match_id === matchId);
}

async function createMatch(matchData) {
  const matches = await readJsonFile(FILES.MATCHES);
  const newMatch = {
    match_id: 'm' + generateId(),
    ...matchData,
    status: matchData.status || 'Scheduled'
  };
  matches.push(newMatch);
  await writeJsonFile(FILES.MATCHES, matches);
  return newMatch;
}

async function updateMatch(matchId, matchData) {
  const matches = await readJsonFile(FILES.MATCHES);
  const index = matches.findIndex(m => m.match_id === matchId);
  if (index === -1) return null;
  
  matches[index] = { ...matches[index], ...matchData };
  await writeJsonFile(FILES.MATCHES, matches);
  return matches[index];
}

async function deleteMatch(matchId) {
  const matches = await readJsonFile(FILES.MATCHES);
  const filteredMatches = matches.filter(m => m.match_id !== matchId);
  await writeJsonFile(FILES.MATCHES, filteredMatches);
  
  // Delete related participants
  await deleteMatchParticipants(matchId);
  
  // Recalculate stats
  await recalculateAllStats();
  
  return true;
}

// ==================== PARTICIPANTS ====================

async function getMatchParticipants(matchId) {
  const participants = await readJsonFile(FILES.PARTICIPANTS);
  const players = await readJsonFile(FILES.PLAYERS);
  
  const matchParticipants = participants.filter(p => p.match_id === matchId);
  
  return matchParticipants.map(p => {
    const player = players.find(pl => pl.player_id === p.player_id);
    return {
      ...p,
      player_name: player?.player_name || 'Unknown',
      nickname: player?.nickname || ''
    };
  });
}

async function addParticipant(matchId, playerId) {
  const participants = await readJsonFile(FILES.PARTICIPANTS);
  
  // Check if player already in match
  const existingInMatch = participants.find(p => p.match_id === matchId && p.player_id === playerId);
  if (existingInMatch) {
    throw new Error('Player already in match');
  }
  
  // Check if match already has 2 participants
  const matchParticipants = participants.filter(p => p.match_id === matchId);
  if (matchParticipants.length >= 2) {
    throw new Error('Match already has 2 participants');
  }
  
  const newParticipant = {
    match_participant_id: 'mp' + generateId(),
    match_id: matchId,
    player_id: playerId,
    goals_scored: 0,
    result: 'Pending'
  };
  
  participants.push(newParticipant);
  await writeJsonFile(FILES.PARTICIPANTS, participants);
  
  return newParticipant;
}

async function updateParticipant(participantId, goalsScored) {
  const participants = await readJsonFile(FILES.PARTICIPANTS);
  const matches = await readJsonFile(FILES.MATCHES);
  
  const index = participants.findIndex(p => p.match_participant_id === participantId);
  if (index === -1) return null;
  
  const participant = participants[index];
  const matchId = participant.match_id;
  
  // Update goals
  participants[index].goals_scored = goalsScored;
  
  // Get all participants for this match
  const matchParticipants = participants.filter(p => p.match_id === matchId);
  
  // Calculate results if we have 2 participants
  if (matchParticipants.length === 2) {
    const p1 = matchParticipants[0];
    const p2 = matchParticipants[1];
    
    if (p1.goals_scored > p2.goals_scored) {
      p1.result = 'Win';
      p2.result = 'Loss';
    } else if (p1.goals_scored < p2.goals_scored) {
      p1.result = 'Loss';
      p2.result = 'Win';
    } else {
      p1.result = 'Draw';
      p2.result = 'Draw';
    }
    
    // Update match status
    const matchIndex = matches.findIndex(m => m.match_id === matchId);
    if (matchIndex !== -1) {
      matches[matchIndex].status = 'Completed';
      await writeJsonFile(FILES.MATCHES, matches);
    }
  }
  
  await writeJsonFile(FILES.PARTICIPANTS, participants);
  
  // Recalculate stats
  await recalculateAllStats();
  
  return participants[index];
}

async function deleteParticipant(participantId) {
  const participants = await readJsonFile(FILES.PARTICIPANTS);
  const filteredParticipants = participants.filter(p => p.match_participant_id !== participantId);
  await writeJsonFile(FILES.PARTICIPANTS, filteredParticipants);
  
  // Recalculate stats
  await recalculateAllStats();
  
  return true;
}

async function deleteMatchParticipants(matchId) {
  const participants = await readJsonFile(FILES.PARTICIPANTS);
  const filteredParticipants = participants.filter(p => p.match_id !== matchId);
  await writeJsonFile(FILES.PARTICIPANTS, filteredParticipants);
}

async function deletePlayerFromParticipants(playerId) {
  const participants = await readJsonFile(FILES.PARTICIPANTS);
  const filteredParticipants = participants.filter(p => p.player_id !== playerId);
  await writeJsonFile(FILES.PARTICIPANTS, filteredParticipants);
}

// ==================== STATS ====================

async function getAllStats() {
  const stats = await readJsonFile(FILES.STATS);
  const players = await readJsonFile(FILES.PLAYERS);
  
  return stats.map(s => {
    const player = players.find(p => p.player_id === s.player_id);
    return {
      ...s,
      player_name: player?.player_name || 'Unknown',
      nickname: player?.nickname || ''
    };
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    return b.goals_for - a.goals_for;
  });
}

async function getPlayerStats(playerId) {
  const stats = await readJsonFile(FILES.STATS);
  const players = await readJsonFile(FILES.PLAYERS);
  
  const stat = stats.find(s => s.player_id === playerId);
  if (!stat) return null;
  
  const player = players.find(p => p.player_id === playerId);
  return {
    ...stat,
    player_name: player?.player_name || 'Unknown',
    nickname: player?.nickname || ''
  };
}

async function createPlayerStats(playerId) {
  const stats = await readJsonFile(FILES.STATS);
  
  const newStat = {
    stat_id: 's' + generateId(),
    player_id: playerId,
    matches_played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
    stage_reached: 'Group Stage'
  };
  
  stats.push(newStat);
  await writeJsonFile(FILES.STATS, stats);
  
  return newStat;
}

async function recalculateAllStats() {
  const players = await readJsonFile(FILES.PLAYERS);
  const matches = await readJsonFile(FILES.MATCHES);
  const participants = await readJsonFile(FILES.PARTICIPANTS);
  
  const newStats = [];
  
  for (const player of players) {
    // Get all matches this player participated in
    const playerMatches = participants.filter(p => p.player_id === player.player_id);
    
    let matchesPlayed = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let maxStage = 0;
    
    for (const pm of playerMatches) {
      matchesPlayed++;
      goalsFor += pm.goals_scored;
      
      if (pm.result === 'Win') {
        wins++;
      } else if (pm.result === 'Draw') {
        draws++;
      } else if (pm.result === 'Loss') {
        losses++;
      }
      
      // Get opponent's goals
      const opponent = participants.find(p => p.match_id === pm.match_id && p.player_id !== player.player_id);
      if (opponent) {
        goalsAgainst += opponent.goals_scored;
      }
      
      // Get match stage
      const match = matches.find(m => m.match_id === pm.match_id);
      if (match && match.status === 'Completed') {
        const stageValue = STAGE_ORDER[match.stage] || 0;
        if (stageValue > maxStage) {
          maxStage = stageValue;
        }
      }
    }
    
    let stageReached = 'Group Stage';
    if (maxStage >= 5) stageReached = 'Final';
    else if (maxStage >= 4) stageReached = 'Semi Final';
    else if (maxStage >= 3) stageReached = 'Quarter Final';
    else if (maxStage >= 2) stageReached = 'Knockout';
    
    const goalDiff = goalsFor - goalsAgainst;
    const points = wins * 3 + draws * 1;
    
    newStats.push({
      stat_id: 's' + generateId(),
      player_id: player.player_id,
      matches_played: matchesPlayed,
      wins,
      draws,
      losses,
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      goal_difference: goalDiff,
      points,
      stage_reached: stageReached
    });
  }
  
  await writeJsonFile(FILES.STATS, newStats);
}

// ==================== DASHBOARD ====================

async function getDashboardStats() {
  const players = await readJsonFile(FILES.PLAYERS);
  const matches = await readJsonFile(FILES.MATCHES);
  const participants = await readJsonFile(FILES.PARTICIPANTS);
  const stats = await getAllStats();
  
  const totalPlayers = players.length;
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === 'Completed').length;
  const scheduledMatches = matches.filter(m => m.status === 'Scheduled').length;
  
  const topPlayer = stats.length > 0 ? stats[0] : null;
  const topScorer = [...stats].sort((a, b) => b.goals_for - a.goals_for)[0] || null;
  
  // Get recent matches with participants
  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.match_date + ' ' + b.match_time) - new Date(a.match_date + ' ' + a.match_time))
    .slice(0, 5)
    .map(m => {
      const matchParticipants = participants.filter(p => p.match_id === m.match_id);
      const participantNames = matchParticipants.map(p => {
        const player = players.find(pl => pl.player_id === p.player_id);
        return `${player?.player_name || 'Unknown'} (${p.goals_scored})`;
      }).join(' vs ');
      
      return {
        ...m,
        participants: participantNames || 'No participants'
      };
    });
  
  return {
    totalPlayers,
    totalMatches,
    completedMatches,
    scheduledMatches,
    topPlayer,
    topScorer,
    recentMatches
  };
};

// ==================== KNOCKOUT STAGES (UEFA Champions League Style) ====================

// Get all knockout matches
async function getAllKnockoutMatches() {
  return await initJsonFile(FILES.KNOCKOUT_MATCHES, []);
}

// Get knockout matches by stage
async function getKnockoutMatchesByStage(stage) {
  const matches = await readJsonFile(FILES.KNOCKOUT_MATCHES);
  return matches.filter(m => m.stage === stage);
}

// Generate Quarter Finals from top 4 players (shuffled)
async function generateQuarterFinals() {
  const stats = await getAllStats();
  const knockoutMatches = await readJsonFile(FILES.KNOCKOUT_MATCHES);
  
  // Check if quarter finals already exist
  const existingQF = knockoutMatches.filter(m => m.stage === 'Quarter Final');
  if (existingQF.length > 0) {
    throw new Error('Quarter Finals already generated');
  }
  
  // Get top 4 players from standings
  const top4 = stats.slice(0, 4);
  
  if (top4.length < 4) {
    throw new Error('Need at least 4 players to generate Quarter Finals');
  }
  
  // Shuffle the top 4 randomly
  const shuffled = [...top4].sort(() => Math.random() - 0.5);
  
  // Create 2 quarter final matches (each with 2 legs)
  const quarterFinals = [];
  const matchPairs = [
    [shuffled[0], shuffled[3]], // 1st vs 4th
    [shuffled[1], shuffled[2]]   // 2nd vs 3rd
  ];
  
  for (let i = 0; i < matchPairs.length; i++) {
    const [player1, player2] = matchPairs[i];
    
    quarterFinals.push({
      knockout_id: 'kf' + generateId(),
      stage: 'Quarter Final',
      round: 1,
      match_name: `QF Match ${i + 1}`,
      player1_id: player1.player_id,
      player2_id: player2.player_id,
      player1_first_leg_goals: 0,
      player2_first_leg_goals: 0,
      player1_second_leg_goals: 0,
      player2_second_leg_goals: 0,
      player1_total: 0,
      player2_total: 0,
      player1_away_goals: 0,
      player2_away_goals: 0,
      winner_id: null,
      status: 'Scheduled',
      leg1_completed: false,
      leg2_completed: false,
      created_at: new Date().toISOString()
    });
  }
  
  // Add to knockout matches
  knockoutMatches.push(...quarterFinals);
  await writeJsonFile(FILES.KNOCKOUT_MATCHES, knockoutMatches);
  
  return quarterFinals;
}

// Generate Semi Finals from Quarter Final participants
async function generateSemiFinals() {
  const knockoutMatches = await readJsonFile(FILES.KNOCKOUT_MATCHES);
  
  // Get all completed quarter finals
  const quarterFinals = knockoutMatches.filter(m => m.stage === 'Quarter Final' && m.status === 'Completed');
  
  if (quarterFinals.length !== 2) {
    throw new Error('All Quarter Finals must be completed first');
  }
  
  // Check if semi finals already exist
  const existingSF = knockoutMatches.filter(m => m.stage === 'Semi Final');
  if (existingSF.length > 0) {
    throw new Error('Semi Finals already generated');
  }
  
  // Get ALL players who participated in Quarter Finals (not just winners)
  // This ensures we have 4 players for Semi Finals
  const qfPlayers = [];
  quarterFinals.forEach(qf => {
    if (!qfPlayers.includes(qf.player1_id)) qfPlayers.push(qf.player1_id);
    if (!qfPlayers.includes(qf.player2_id)) qfPlayers.push(qf.player2_id);
  });
  
  // Shuffle the players randomly
  const shuffled = qfPlayers.sort(() => Math.random() - 0.5);
  
  // Create 2 semi final matches (with 2 legs each)
  const semiFinals = [];
  const matchPairs = [
    [shuffled[0], shuffled[2]], // Player 1 vs Player 3
    [shuffled[1], shuffled[3]]    // Player 2 vs Player 4
  ];
  
  for (let i = 0; i < matchPairs.length; i++) {
    const [player1, player2] = matchPairs[i];
    
    semiFinals.push({
      knockout_id: 'sf' + generateId(),
      stage: 'Semi Final',
      round: 2,
      match_name: `SF Match ${i + 1}`,
      player1_id: player1,
      player2_id: player2,
      player1_first_leg_goals: 0,
      player2_first_leg_goals: 0,
      player1_second_leg_goals: 0,
      player2_second_leg_goals: 0,
      player1_total: 0,
      player2_total: 0,
      player1_away_goals: 0,
      player2_away_goals: 0,
      winner_id: null,
      status: 'Scheduled',
      leg1_completed: false,
      leg2_completed: false,
      created_at: new Date().toISOString()
    });
  }
  
  knockoutMatches.push(...semiFinals);
  await writeJsonFile(FILES.KNOCKOUT_MATCHES, knockoutMatches);
  
  return semiFinals;
}

// Generate Final from Semi Final winners
async function generateFinal() {
  const knockoutMatches = await readJsonFile(FILES.KNOCKOUT_MATCHES);
  
  // Get completed semi finals - need BOTH to be completed
  const semiFinals = knockoutMatches.filter(m => m.stage === 'Semi Final' && m.status === 'Completed');
  
  if (semiFinals.length !== 2) {
    throw new Error('Both Semi Finals must be completed first');
  }
  
  // Check if final already exists
  const existingFinal = knockoutMatches.filter(m => m.stage === 'Final');
  if (existingFinal.length > 0) {
    throw new Error('Final already generated');
  }
  
  // Get the winners from both Semi Finals
  const sfWinners = semiFinals.map(sf => sf.winner_id);
  
  // Create a single Final match between the two winners
  const finals = [{
    knockout_id: 'f' + generateId(),
    stage: 'Final',
    round: 3,
    match_name: 'Grand Final',
    player1_id: sfWinners[0],
    player2_id: sfWinners[1],
    player1_goals: 0,
    player2_goals: 0,
    winner_id: null,
    status: 'Scheduled',
    created_at: new Date().toISOString()
  }];
  
  knockoutMatches.push(...finals);
  await writeJsonFile(FILES.KNOCKOUT_MATCHES, knockoutMatches);
  
  return finals;
}

// Update knockout match leg score
async function updateKnockoutMatch(knockoutId, leg, player1Goals, player2Goals) {
  const knockoutMatches = await readJsonFile(FILES.KNOCKOUT_MATCHES);
  const index = knockoutMatches.findIndex(m => m.knockout_id === knockoutId);
  
  if (index === -1) {
    throw new Error('Match not found');
  }
  
  const match = knockoutMatches[index];
  
  if (match.stage === 'Final') {
    // Single match final
    match.player1_goals = player1Goals;
    match.player2_goals = player2Goals;
    
    if (player1Goals > player2Goals) {
      match.winner_id = match.player1_id;
    } else if (player2Goals > player1Goals) {
      match.winner_id = match.player2_id;
    }
    match.status = 'Completed';
  } else {
    // Two-leg match (Quarter Final or Semi Final)
    if (leg === 1) {
      match.player1_first_leg_goals = player1Goals;
      match.player2_first_leg_goals = player2Goals;
      match.player1_away_goals = player2Goals;
      match.player2_away_goals = player1Goals;
      match.leg1_completed = true;
    } else if (leg === 2) {
      match.player1_second_leg_goals = player1Goals;
      match.player2_second_leg_goals = player2Goals;
      match.player1_away_goals += player1Goals;
      match.player2_away_goals += player2Goals;
      match.leg2_completed = true;
    }
    
    // Calculate totals
    match.player1_total = match.player1_first_leg_goals + match.player1_second_leg_goals;
    match.player2_total = match.player2_first_leg_goals + match.player2_second_leg_goals;
    
    // Determine winner with away goals rule
    if (match.leg1_completed && match.leg2_completed) {
      if (match.player1_total > match.player2_total) {
        match.winner_id = match.player1_id;
      } else if (match.player2_total > match.player1_total) {
        match.winner_id = match.player2_id;
      } else {
        // Tie - away goals rule
        if (match.player1_away_goals > match.player2_away_goals) {
          match.winner_id = match.player1_id;
        } else if (match.player2_away_goals > match.player1_away_goals) {
          match.winner_id = match.player2_id;
        } else {
          // Equal away goals - Player 1 wins (or could implement penalties)
          match.winner_id = match.player1_id;
        }
      }
      match.status = 'Completed';
    }
  }
  
  await writeJsonFile(FILES.KNOCKOUT_MATCHES, knockoutMatches);
  
  // Update player stats with knockout results
  await updateKnockoutStats(match);
  
  return match;
}

// Update player stats with knockout results
async function updateKnockoutStats(match) {
  if (match.status !== 'Completed') return;
  
  const players = await readJsonFile(FILES.PLAYERS);
  const stats = await readJsonFile(FILES.STATS);
  
  const updatePlayerStat = async (playerId, isWinner) => {
    const statIndex = stats.findIndex(s => s.player_id === playerId);
    if (statIndex !== -1) {
      stats[statIndex].matches_played += 1;
      if (isWinner) {
        stats[statIndex].wins += 1;
        stats[statIndex].points += 3;
      } else {
        stats[statIndex].losses += 1;
      }
      
      // Update stage reached
      let currentStageValue = 0;
      if (match.stage === 'Quarter Final') currentStageValue = 3;
      else if (match.stage === 'Semi Final') currentStageValue = 4;
      else if (match.stage === 'Final') currentStageValue = 5;
      
      const stageValues = {
        'Group Stage': 1,
        'Quarter Final': 3,
        'Semi Final': 4,
        'Final': 5
      };
      
      const currentStageValue2 = stageValues[stats[statIndex].stage_reached] || 0;
      if (currentStageValue > currentStageValue2) {
        if (currentStageValue === 3) stats[statIndex].stage_reached = 'Quarter Final';
        else if (currentStageValue === 4) stats[statIndex].stage_reached = 'Semi Final';
        else if (currentStageValue === 5) stats[statIndex].stage_reached = 'Final';
      }
    }
  };
  
  if (match.stage === 'Final') {
    const winner = match.winner_id;
    await updatePlayerStat(match.player1_id, winner === match.player1_id);
    await updatePlayerStat(match.player2_id, winner === match.player2_id);
  } else {
    await updatePlayerStat(match.player1_id, match.winner_id === match.player1_id);
    await updatePlayerStat(match.player2_id, match.winner_id === match.player2_id);
  }
  
  await writeJsonFile(FILES.STATS, stats);
}

// Reset knockout stages
async function resetKnockoutStages() {
  await writeJsonFile(FILES.KNOCKOUT_MATCHES, []);
}

// Completely clear all data (for fresh start)
async function clearAllData() {
  await writeJsonFile(FILES.PLAYERS, []);
  await writeJsonFile(FILES.MATCHES, []);
  await writeJsonFile(FILES.PARTICIPANTS, []);
  await writeJsonFile(FILES.STATS, []);
  await writeJsonFile(FILES.KNOCKOUT_MATCHES, []);
  console.log('All data cleared');
}

module.exports = {
  initializeData,
  // Admin
  getAdmin,
  verifyAdmin,
  // Players
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  // Matches
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  // Participants
  getMatchParticipants,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  // Stats
  getAllStats,
  getPlayerStats,
  recalculateAllStats,
  // Dashboard
  getDashboardStats,
  // Knockout Stages
  getAllKnockoutMatches,
  getKnockoutMatchesByStage,
  generateQuarterFinals,
  generateSemiFinals,
  generateFinal,
  updateKnockoutMatch,
  resetKnockoutStages,
  // Clear Data
  clearAllData
};

