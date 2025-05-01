const { getStore } = require('@netlify/blobs');
const { v4: uuidv4 } = require('uuid');

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

async function saveData(data) {
  try {
    if (!process.env.NETLIFY_BLOBS_SITE_ID || !process.env.NETLIFY_BLOBS_TOKEN) {
      throw new Error('Missing required environment variables for Netlify Blobs');
    }

    const store = getStore({
      name: 'hotel-reservations',
      siteID: process.env.NETLIFY_BLOBS_SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    await store.set('hotel-data', JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to blob store:", error);
    throw error;
  }
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    const data = await loadData();

    switch (event.httpMethod) {
      case 'GET':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data.reservations)
        };

      case 'POST':
        try {
          const body = JSON.parse(event.body || '{}');
          const newReservation = {
            id: uuidv4(),
            roomId: body.roomId,
            guestName: body.guestName,
            checkIn: body.checkIn,
            checkOut: body.checkOut
          };

          const room = data.rooms.find(r => r.id === newReservation.roomId);
          if (!room) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Room not found' })
            };
          }

          if (room.availability <= 0) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Room not available' })
            };
          }

          room.availability -= 1;
          data.reservations.push(newReservation);
          await saveData(data);

          return {
            statusCode: 201,
            headers,
            body: JSON.stringify(newReservation)
          };
        } catch (error) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: error.message })
          };
        }

      case 'DELETE':
        const reservationId = event.path.split('/').pop();
        const reservationIndex = data.reservations.findIndex(r => r.id === reservationId);

        if (reservationIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Reservation not found' })
          };
        }

        const reservation = data.reservations[reservationIndex];
        const room = data.rooms.find(r => r.id === reservation.roomId);
        if (room) {
          room.availability += 1;
        }

        data.reservations.splice(reservationIndex, 1);
        await saveData(data);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Reservation cancelled successfully' })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};