const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

async function readJSON(filename) {
  const file = path.join(dataDir, filename);
  try {
    const text = await fs.readFile(file, 'utf8');
    return JSON.parse(text || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeJSON(filename, data) {
  const file = path.join(dataDir, filename);
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readJSON, writeJSON };