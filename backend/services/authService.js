const { readJsonFile, writeJsonFile, initJsonFile, generateId } = require('../utils/fileUtils');

const USERS_FILE = 'users.json';

const ROLES = {
  ADMIN: 'admin',
  PLAYER: 'player',
  PENDING: 'pending'
};

async function initializeUsers() {
  const users = await readJsonFile(USERS_FILE);
  
  // Only add seed users if they don't exist
  const adminExists = users.find(u => u.role === ROLES.ADMIN);
  const playerExists = users.find(u => u.role === ROLES.PLAYER);
  
  if (!adminExists) {
    users.push({
      user_id: 'admin1',
      username: 'admin',
      password: 'admin123', 
      email: 'admin@efootball.com',
      role: ROLES.ADMIN,
      approved: true,
      created_at: new Date().toISOString()
    });
  }
  
  if (!playerExists) {
    users.push({
      user_id: 'player1',
      username: 'player1',
      password: 'player123', 
      email: 'player@efootball.com',
      player_name: 'Test Player',
      phone: '555-0000',
      role: ROLES.PLAYER,
      approved: true,
      created_at: new Date().toISOString()
    });
  }
  
  await writeJsonFile(USERS_FILE, users);
}


async function registerPlayer(email, password, player_name, phone) {
  const users = await readJsonFile(USERS_FILE);
  const existing = users.find(u => u.email === email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const newUser = {
    user_id: 'u' + generateId(),
    email,
    password, // In production use bcrypt.hash()
    player_name,
    phone,
    role: ROLES.PLAYER,
    approved: false,
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  await writeJsonFile(USERS_FILE, users);
  
  return newUser;
}

async function login(username, password) {
  const users = await readJsonFile(USERS_FILE);
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (user.role === ROLES.PENDING) {
    throw new Error('Account awaiting admin approval');
  }

  return {
    user_id: user.user_id,
    username: user.username,
    role: user.role,
    approved: user.approved,
    player_name: user.player_name
  };
}


async function getAllUsers() {
  const users = await readJsonFile(USERS_FILE);
  return users.map(u => ({
    user_id: u.user_id,
    email: u.email,
    player_name: u.player_name,
    role: u.role,
    approved: u.approved,
    created_at: u.created_at
  }));
}

async function approveUser(userId) {
  const users = await readJsonFile(USERS_FILE);
  const index = users.findIndex(u => u.user_id === userId);
  if (index === -1) {
    throw new Error('User not found');
  }

  users[index].role = ROLES.PLAYER;
  users[index].approved = true;
  await writeJsonFile(USERS_FILE, users);
}

async function rejectUser(userId) {
  const users = await readJsonFile(USERS_FILE);
  const index = users.findIndex(u => u.user_id === userId);
  if (index === -1) {
    throw new Error('User not found');
  }

  users.splice(index, 1);
  await writeJsonFile(USERS_FILE, users);
}

module.exports = {
  initializeUsers,
  registerPlayer,
  login,
  getAllUsers,
  approveUser,
  rejectUser,
  ROLES
};

