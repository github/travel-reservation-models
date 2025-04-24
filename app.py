import json
import os
from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
from typing import Dict, List, Any, Tuple # Added type hints

load_dotenv() # Load environment variables from .env file

app = Flask(__name__, static_folder='static', template_folder='templates')

DATA_FILE = 'data.json'

# Load data from JSON file
def load_data() -> Dict[str, List[Dict[str, Any]]]:
    """Loads room and reservation data from the JSON file."""
    try:
        with open(DATA_FILE, 'r') as f:
            # Ensure both keys exist even if file is empty/malformed initially
            data = json.load(f)
            if 'rooms' not in data:
                data['rooms'] = []
            if 'reservations' not in data:
                data['reservations'] = []
            return data
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Warning: {DATA_FILE} not found or invalid. Starting with empty data.")
        # Return default structure if file is missing or corrupt
        return {"rooms": [], "reservations": []}

# Save data to JSON file
def save_data(data: Dict[str, List[Dict[str, Any]]]) -> None:
    """Saves the provided data structure to the JSON file."""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except IOError as e:
        print(f"Error saving data to {DATA_FILE}: {e}")


# Serve the main HTML page
@app.route('/')
def index() -> str:
    """Serves the main index.html page."""
    return render_template('index.html')

# API endpoint to get rooms
@app.route('/api/rooms', methods=['GET'])
def get_rooms() -> Tuple[Any, int]:
    """Returns the list of all rooms."""
    data = load_data()
    return jsonify(data.get('rooms', [])), 200

# API endpoint to get reservations
@app.route('/api/reservations', methods=['GET'])
def get_reservations() -> Tuple[Any, int]:
    """Returns the list of all reservations."""
    data = load_data()
    return jsonify(data.get('reservations', [])), 200

# API endpoint to create a reservation
@app.route('/api/reservations', methods=['POST'])
def create_reservation() -> Tuple[Any, int]:
    """Creates a new reservation if the room is available."""
    data = load_data()
    new_reservation_data = request.json

    # --- Input Validation ---
    required_fields = ['roomId', 'guestName', 'checkIn', 'checkOut']
    if not new_reservation_data or not all(k in new_reservation_data for k in required_fields):
        return jsonify({"error": "Missing required reservation data"}), 400

    try:
        room_id = int(new_reservation_data['roomId']) # Ensure room ID is an int
        guest_name = str(new_reservation_data['guestName']).strip()
        check_in = str(new_reservation_data['checkIn']) # Keep as string for now, could parse/validate dates
        check_out = str(new_reservation_data['checkOut'])

        if not guest_name:
             return jsonify({"error": "Guest name cannot be empty"}), 400
        # Basic date validation (more robust needed for real app)
        if check_out <= check_in:
             return jsonify({"error": "Check-out date must be after check-in date"}), 400

    except (ValueError, TypeError):
         return jsonify({"error": "Invalid data types in reservation request"}), 400
    # --- End Input Validation ---


    # --- Check Room Availability ---
    room_to_book = None
    for room in data.get('rooms', []):
        if room.get('id') == room_id:
            if room.get('availability', 0) > 0:
                room_to_book = room
                break
            else:
                return jsonify({"error": f"Room ID {room_id} is not available"}), 400 # Changed status code

    if not room_to_book:
        return jsonify({"error": f"Room ID {room_id} not found"}), 404
    # --- End Check Room Availability ---

    # --- Create and Save Reservation ---
    # Decrement availability (Consider potential race conditions in a real multi-user app)
    # room_to_book['availability'] -= 1 # Commented out: Let's not modify availability for now

    # Generate a more unique ID (e.g., using UUID) in a real app
    reservation_id = f"res{len(data.get('reservations', [])) + 1}_{os.urandom(4).hex()}"

    final_reservation = {
        "id": reservation_id,
        "roomId": room_id,
        "guestName": guest_name,
        "checkIn": check_in,
        "checkOut": check_out
    }

    data.setdefault('reservations', []).append(final_reservation)
    save_data(data)
    # --- End Create and Save Reservation ---

    return jsonify(final_reservation), 201

# API endpoint to delete a reservation
@app.route('/api/reservations/<string:reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id: str) -> Tuple[Any, int]:
    """Deletes a reservation by its ID."""
    data = load_data()
    reservations = data.get('reservations', [])
    initial_length = len(reservations)

    # Find and remove the reservation
    data['reservations'] = [res for res in reservations if res.get('id') != reservation_id]

    if len(data['reservations']) == initial_length:
        return jsonify({"error": f"Reservation ID {reservation_id} not found"}), 404

    # Optional: Increment room availability if needed
    # This requires finding the original room ID from the deleted reservation
    # and then finding that room in the rooms list to increment its availability.
    # Add logic here if required.

    save_data(data)
    return jsonify({"message": f"Reservation {reservation_id} cancelled successfully"}), 200


if __name__ == '__main__':
    # Use environment variable for debug mode, default to False
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    # Consider using environment variables for host and port as well
    host = os.environ.get('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.environ.get('FLASK_RUN_PORT', 5000))
    app.run(host=host, port=port, debug=debug_mode)
