const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

function saveData(data) {
  const dataPath = findDataFile();
  if (!dataPath) {
    console.warn("Could not find data.json to save");
    return;
  }

  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving data file:", error);
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
    const data = loadData();

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

          // Update room availability
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
          saveData(data);

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
        // Restore room availability
        const room = data.rooms.find(r => r.id === reservation.roomId);
        if (room) {
          room.availability += 1;
        }

        data.reservations.splice(reservationIndex, 1);
        saveData(data);

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