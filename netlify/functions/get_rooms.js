const { getStore } = require('@netlify/blobs');

// Initial data to use if blob store is empty
const initialData = {
  "rooms": [
    {
      "id": 1,
      "name": "Standard Queen",
      "availability": 4
    },
    {
      "id": 2,
      "name": "Deluxe King",
      "availability": 3
    },
    {
      "id": 3,
      "name": "Ocean View Suite",
      "availability": 2
    }
  ],
  "reservations": []
};

async function loadData() {
  try {
    if (!process.env.NETLIFY_BLOBS_SITE_ID || !process.env.NETLIFY_BLOBS_TOKEN) {
      throw new Error('Missing required environment variables for Netlify Blobs');
    }

    const store = getStore({
      name: 'hotel-reservations',
      siteID: process.env.NETLIFY_BLOBS_SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    
    let data = await store.get('hotel-data');
    
    if (!data) {
      // Initialize with default data if none exists
      await store.set('hotel-data', JSON.stringify(initialData));
      return initialData;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error("Error accessing blob store:", error);
    return initialData;
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
    const data = await loadData();
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