const fs = require('fs');
const path = require('path');

function findDataFile() {
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'data.json'),
    path.join(process.cwd(), 'data.json'),
    path.join(process.env.NETLIFY_WORKSPACE_ROOT || '', 'data.json')
  ];

  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  return null;
}

function loadData() {
  const dataPath = findDataFile();
  if (!dataPath) {
    console.warn("Could not find data.json in any expected location");
    return { rooms: [], reservations: [] };
  }

  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data file:", error);
    return { rooms: [], reservations: [] };
  }
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = loadData();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data.rooms)
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};