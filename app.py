import json
import uuid
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

DATA_FILE = 'data.json'

def load_data():
    """Loads data from the JSON file."""
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default structure if file doesn't exist
        return {"rooms": [], "reservations": []}
    except json.JSONDecodeError:
        # Handle empty or invalid JSON file
        print(f"Warning: {DATA_FILE} is empty or contains invalid JSON. Starting with empty data.")
        return {"rooms": [], "reservations": []}


def save_data(data):
    """Saves data to the JSON file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    """Serves the main HTML page."""
    return render_template('index.html')

# --- API Endpoints ---

@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    """Retrieves a list of available rooms."""
    data = load_data()
    # In a real app, you might filter by actual availability based on reservations
    return jsonify(data.get('rooms', []))

@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    """Retrieves a list of all reservations."""
    data = load_data()
    return jsonify(data.get('reservations', []))

@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    """Creates a new reservation."""
    data = load_data()
    reservation_details = request.json

    if not reservation_details or not all(k in reservation_details for k in ('roomId', 'guestName', 'checkIn', 'checkOut')):
        return jsonify({"error": "Missing reservation details"}), 400

    # Basic validation (more needed in a real app)
    room_id = reservation_details.get('roomId')
    rooms = {room['id']: room for room in data.get('rooms', [])}

    if room_id not in rooms:
        return jsonify({"error": "Invalid room ID"}), 400

    # TODO: Add availability check based on dates and existing reservations

    new_reservation = {
        "id": str(uuid.uuid4()), # Generate a unique ID
        "roomId": room_id,
        "guestName": reservation_details.get('guestName'),
        "checkIn": reservation_details.get('checkIn'),
        "checkOut": reservation_details.get('checkOut')
    }

    if 'reservations' not in data:
        data['reservations'] = []
    data['reservations'].append(new_reservation)
    save_data(data)

    return jsonify(new_reservation), 201

@app.route('/api/reservations/<reservation_id>', methods=['DELETE'])
def cancel_reservation(reservation_id):
    """Cancels an existing reservation."""
    data = load_data()
    reservations = data.get('reservations', [])
    initial_length = len(reservations)

    # Filter out the reservation to be deleted
    data['reservations'] = [res for res in reservations if res.get('id') != reservation_id]

    if len(data['reservations']) == initial_length:
        return jsonify({"error": "Reservation not found"}), 404

    # TODO: Update room availability if needed

    save_data(data)
    return jsonify({"message": "Reservation cancelled"}), 200

if __name__ == '__main__':
    # Use 0.0.0.0 to make it accessible on the network if needed
    # Debug=True enables auto-reloading and debug messages (use False in production)
    app.run(host='0.0.0.0', port=5000, debug=True)
