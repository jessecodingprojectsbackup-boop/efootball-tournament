
const { readJsonFile, writeJsonFile } = require('../utils/fileUtils');

// Data file name
const KNOCKOUT_FILE = 'knockout_matches.json';

// Stage names in order
const STAGES = {
  ROUND_OF_32: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter Final',
  SEMI_FINAL: 'Semi Final',
  FINAL: 'Final'
};

// Get stage order value
function getStageOrder(stage) {
  const order = {
    'Round of 32': 1,
    'Round of 16': 2,
    'Quarter Final': 3,
    'Semi Final': 4,
    'Final': 5
  };
  return order[stage] || 0;
}

// Calculate how many rounds needed for n players
function calculateRounds(numPlayers) {
  if (numPlayers <= 2) return 1;
  if (numPlayers <= 4) return 2;
  if (numPlayers <= 8) return 3;
  if (numPlayers <= 16) return 4;
  if (numPlayers <= 32) return 5;
  return Math.ceil(Math.log2(numPlayers));
}

// Get stage name from round number
function getStageFromRound(round, totalRounds) {
  const stages = ['Final', 'Semi Final', 'Quarter Final', 'Round of 16', 'Round of 32'];
  const index = totalRounds - round;
  return stages[index] || `Round ${round}`;
}

// Read all knockout matches
async function getKnockoutMatches() {
  try {
    const data = await readJsonFile(KNOCKOUT_FILE);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Save knockout matches
async function saveKnockoutMatches(matches) {
  await writeJsonFile(KNOCKOUT_FILE, matches);
}

// Generate initial knockout bracket from top players
async function generateKnockoutBracket(qualifyingPlayers) {
  const matches = await getKnockoutMatches();
  
  // Clear existing knockout matches if starting fresh
  if (matches.length === 0 || matches[0].round === 1) {
    await saveKnockoutMatches([]);
  }
  
  const allMatches = await getKnockoutMatches();
  
  // Check if bracket already exists
  if (allMatches.length > 0) {
    const incomplete = allMatches.filter(m => m.status !== 'Completed');
    if (incomplete.length > 0) {
      throw new Error('Knockout bracket already exists. Complete or reset it first.');
    }
    // If all complete, start fresh
    await saveKnockoutMatches([]);
  }
  
  const numPlayers = qualifyingPlayers.length;
  
  if (numPlayers < 2) {
    throw new Error('Need at least 2 players to generate knockout bracket');
  }
  
  // Shuffle players for random pairing
  const shuffled = [...qualifyingPlayers].sort(() => Math.random() - 0.5);
  
  // Calculate rounds needed
  const totalRounds = calculateRounds(numPlayers);
  const matchesPerRound = Math.floor(numPlayers / 2);
  
  // Create first round matches
  const newMatches = [];
  const matchId = Date.now().toString(36);
  
  for (let i = 0; i < matchesPerRound; i++) {
    const player1 = shuffled[i * 2];
    const player2 = shuffled[i * 2 + 1];
    
    newMatches.push({
      knockout_id: `${matchId}_r1_m${i + 1}`,
      round: 1,
      stage: getStageFromRound(1, totalRounds),
      match_name: `Match ${i + 1}`,
      player1_id: player1.player_id,
      player2_id: player2.player_id,
      player1_name: player1.player_name,
      player2_name: player1.player_name,
      // Two-leg format for Champions League style
      player1_first_leg_goals: 0,
      player2_first_leg_goals: 0,
      player1_second_leg_goals: 0,
      player2_second_leg_goals: 0,
      player1_total: 0,
      player2_total: 0,
      player1_away_goals: 0,
      player2_away_goals: 0,
      winner_id: null,
      winner_name: null,
      status: 'Scheduled',
      leg1_completed: false,
      leg2_completed: false,
      next_match_id: null, // Will be set after match completes
      created_at: new Date().toISOString()
    });
  }
  
  // Add byes for players if odd number (they auto-advance)
  if (numPlayers % 2 === 1) {
    const byePlayer = shuffled[numPlayers - 1];
    newMatches.push({
      knockout_id: `${matchId}_bye_${numPlayers}`,
      round: 1,
      stage: getStageFromRound(1, totalRounds),
      match_name: `BYE`,
      player1_id: byePlayer.player_id,
      player2_id: null,
      player1_name: byePlayer.player_name,
      player2_name: 'BYE',
      player1_first_leg_goals: 0,
      player2_first_leg_goals: 0,
      player1_second_leg_goals: 0,
      player2_second_leg_goals: 0,
      player1_total: 0,
      player2_total: 0,
      player1_away_goals: 0,
      player2_away_goals: 0,
      winner_id: byePlayer.player_id,
      winner_name: byePlayer.player_name,
      status: 'Completed',
      leg1_completed: true,
      leg2_completed: true,
      is_bye: true,
      next_match_id: null,
      created_at: new Date().toISOString()
    });
  }
  
  await saveKnockoutMatches(newMatches);
  
  return {
    message: `Knockout bracket generated with ${numPlayers} players`,
    rounds: totalRounds,
    matches: newMatches
  };
}

// Auto-generate next round from completed matches
async function generateNextRound() {
  const allMatches = await getKnockoutMatches();
  
  // Find the current round (highest round with matches)
  const currentRound = Math.max(...allMatches.map(m => m.round));
  const currentMatches = allMatches.filter(m => m.round === currentRound);
  
  // Check all current round matches are completed
  const incomplete = currentMatches.filter(m => m.status !== 'Completed');
  if (incomplete.length > 0) {
    throw new Error(`Complete all ${currentMatches.length} matches in Round ${currentRound} first`);
  }
  
  // Get all winners from current round
  const winners = allMatches
    .filter(m => m.round === currentRound && m.winner_id)
    .map(m => ({
      player_id: m.winner_id,
      player_name: m.winner_name
    }));
  
  if (winners.length < 2) {
    throw new Error('Not enough winners to create next round');
  }
  
  // Check if this was the final
  const allStages = Object.values(STAGES);
  const currentStage = currentMatches[0].stage;
  if (currentStage === STAGES.FINAL) {
    return {
      message: 'Tournament Complete!',
      champion: winners[0],
      total_matches: allMatches.length
    };
  }
  
  // Create next round
  const nextRound = currentRound + 1;
  const nextStage = getStageFromRound(nextRound, calculateRounds(winners.length));
  const matchesPerRound = Math.floor(winners.length / 2);
  
  const matchId = Date.now().toString(36);
  const newMatches = [];
  
  for (let i = 0; i < matchesPerRound; i++) {
    const player1 = winners[i * 2];
    const player2 = winners[i * 2 + 1];
    
    newMatches.push({
      knockout_id: `${matchId}_r${nextRound}_m${i + 1}`,
      round: nextRound,
      stage: nextStage,
      match_name: `Match ${i + 1}`,
      player1_id: player1.player_id,
      player2_id: player2.player_id,
      player1_name: player1.player_name,
      player2_name: player2.player_name,
      player1_first_leg_goals: 0,
      player2_first_leg_goals: 0,
      player1_second_leg_goals: 0,
      player2_second_leg_goals: 0,
      player1_total: 0,
      player2_total: 0,
      player1_away_goals: 0,
      player2_away_goals: 0,
      winner_id: null,
      winner_name: null,
      status: 'Scheduled',
      leg1_completed: false,
      leg2_completed: false,
      next_match_id: null,
      created_at: new Date().toISOString()
    });
  }
  
  // Handle bye in next round if odd number of winners
  if (winners.length % 2 === 1) {
    const byeWinner = winners[winners.length - 1];
    newMatches.push({
      knockout_id: `${matchId}_bye_${nextRound}`,
      round: nextRound,
      stage: nextStage,
      match_name: `BYE`,
      player1_id: byeWinner.player_id,
      player2_id: null,
      player1_name: byeWinner.player_name,
      player2_name: 'BYE',
      player1_first_leg_goals: 0,
      player2_first_leg_goals: 0,
      player1_second_leg_goals: 0,
      player2_second_leg_goals: 0,
      player1_total: 0,
      player2_total: 0,
      player1_away_goals: 0,
      player2_away_goals: 0,
      winner_id: byeWinner.player_id,
      winner_name: byeWinner.player_name,
      status: 'Completed',
      leg1_completed: true,
      leg2_completed: true,
      is_bye: true,
      next_match_id: null,
      created_at: new Date().toISOString()
    });
  }
  
  // Save new matches
  const updatedMatches = [...allMatches, ...newMatches];
  await saveKnockoutMatches(updatedMatches);
  
  return {
    message: `${nextStage} generated with ${winners.length} players`,
    round: nextRound,
    stage: nextStage,
    matches: newMatches
  };
}

// Update match score
async function updateMatchScore(knockoutId, leg, player1Goals, player2Goals) {
  const allMatches = await getKnockoutMatches();
  const index = allMatches.findIndex(m => m.knockout_id === knockoutId);
  
  if (index === -1) {
    throw new Error('Match not found');
  }
  
  const match = allMatches[index];
  
  if (match.status === 'Completed' && !match.is_bye) {
    throw new Error('Match is already completed');
  }
  
  // Handle bye
  if (match.is_bye || match.player2_id === null) {
    match.status = 'Completed';
    match.winner_id = match.player1_id;
    match.winner_name = match.player1_name;
    await saveKnockoutMatches(allMatches);
    return match;
  }
  
  // Two-leg match
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
  
  // Determine winner if both legs complete
  if (match.leg1_completed && match.leg2_completed) {
    if (match.player1_total > match.player2_total) {
      match.winner_id = match.player1_id;
      match.winner_name = match.player1_name;
    } else if (match.player2_total > match.player1_total) {
      match.winner_id = match.player2_id;
      match.winner_name = match.player2_name;
    } else {
      // Tie - away goals rule
      if (match.player1_away_goals > match.player2_away_goals) {
        match.winner_id = match.player1_id;
        match.winner_name = match.player1_name;
      } else if (match.player2_away_goals > match.player1_away_goals) {
        match.winner_id = match.player2_id;
        match.winner_name = match.player2_name;
      } else {
        // Equal away goals - higher seed wins (first player)
        match.winner_id = match.player1_id;
        match.winner_name = match.player1_name;
      }
    }
    match.status = 'Completed';
  }
  
  await saveKnockoutMatches(allMatches);
  
  return match;
}

// Get tournament status
async function getTournamentStatus() {
  const allMatches = await getKnockoutMatches();
  
  if (allMatches.length === 0) {
    return {
      status: 'not_started',
      message: 'No knockout bracket generated yet'
    };
  }
  
  const rounds = Math.max(...allMatches.map(m => m.round));
  const currentRound = rounds;
  const currentMatches = allMatches.filter(m => m.round === currentRound);
  const completedMatches = currentMatches.filter(m => m.status === 'Completed');
  
  // Check if tournament is complete
  const finalMatch = allMatches.find(m => m.stage === STAGES.FINAL && m.status === 'Completed');
  if (finalMatch) {
    return {
      status: 'complete',
      champion: {
        player_id: finalMatch.winner_id,
        player_name: finalMatch.winner_name
      },
      total_matches: allMatches.length,
      rounds: rounds
    };
  }
  
  return {
    status: 'in_progress',
    current_round: currentRound,
    current_stage: currentMatches[0]?.stage || 'Unknown',
    matches_in_round: currentMatches.length,
    completed_in_round: completedMatches.length,
    total_matches: allMatches.length,
    rounds: rounds
  };
}

// Reset knockout
async function resetKnockout() {
  await saveKnockoutMatches([]);
  return { message: 'Knockout bracket reset successfully' };
}

// Get matches by round
async function getMatchesByRound(round) {
  const allMatches = await getKnockoutMatches();
  return allMatches.filter(m => m.round === round);
}

// Get all rounds info
async function getAllRounds() {
  const allMatches = await getKnockoutMatches();
  
  if (allMatches.length === 0) return [];
  
  const rounds = Math.max(...allMatches.map(m => m.round));
  const roundInfo = [];
  
  for (let r = 1; r <= rounds; r++) {
    const matches = allMatches.filter(m => m.round === r);
    const completed = matches.filter(m => m.status === 'Completed').length;
    const stage = matches[0]?.stage || `Round ${r}`;
    
    roundInfo.push({
      round: r,
      stage: stage,
      total_matches: matches.length,
      completed_matches: completed,
      all_completed: completed === matches.length
    });
  }
  
  return roundInfo;
}

module.exports = {
  getKnockoutMatches,
  generateKnockoutBracket,
  generateNextRound,
  updateMatchScore,
  getTournamentStatus,
  resetKnockout,
  getMatchesByRound,
  getAllRounds,
  STAGES
};

