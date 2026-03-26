const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Read JSON file with error handling
async function readJsonFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    if (error instanceof SyntaxError) {
      console.error(`Invalid JSON in ${filename}:`, error.message);
      return [];
    }
    console.error(`Error reading ${filename}:`, error.message);
    return [];
  }
}

// Write JSON file with atomic write (write to temp file first, then rename)
async function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const tempPath = filePath + '.tmp';
    
    // Write to temporary file first
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
    
    // Atomically rename temp file to actual file
    await fs.rename(tempPath, filePath);
    
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    // Try to clean up temp file if it exists
    try {
      await fs.unlink(path.join(DATA_DIR, filename + '.tmp'));
    } catch (e) {
      // Ignore cleanup error
    }
    return false;
  }
}

// Read or initialize a JSON file
async function initJsonFile(filename, defaultData) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.access(filePath); // Check if file exists
    return await readJsonFile(filename);
  } catch (error) {
    // File doesn't exist, create it with default data
    await writeJsonFile(filename, defaultData);
    return defaultData;
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = {
  DATA_DIR,
  ensureDataDir,
  readJsonFile,
  writeJsonFile,
  initJsonFile,
  generateId
};

