import os
from datetime import datetime
from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
from models import Room, Reservation, init_db, seed_db, get_db
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Tuple

load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')

# Initialize database tables on startup
with app.app_context():
    init_db()
    seed_db()

# Get database session for each request
def get_session():
    """Get database session for the current request."""
    for session in get_db():
        return session

# Serve the main HTML page
@app.route('/')
def index() -> str:
    """Serves the main index.html page."""
    return render_template('index.html')

# API endpoint to get rooms
@app.route('/api/rooms', methods=['GET'])
def get_rooms() -> Tuple[Any, int]:
    """Returns the list of all rooms."""
    db = get_session()
    rooms = db.query(Room).all()
    return jsonify([room.to_dict() for room in rooms]), 200

# API endpoint to get reservations
@app.route('/api/reservations', methods=['GET'])
def get_reservations() -> Tuple[Any, int]:
    """Returns the list of all reservations."""
    db = get_session()
    reservations = db.query(Reservation).all()
    return jsonify([reservation.to_dict() for reservation in reservations]), 200

# API endpoint to create a reservation
@app.route('/api/reservations', methods=['POST'])
def create_reservation() -> Tuple[Any, int]:
    """Creates a new reservation if the room is available."""
    db = get_session()
    new_reservation_data = request.json

    # --- Input Validation ---
    required_fields = ['roomId', 'guestName', 'checkIn', 'checkOut']
    if not new_reservation_data or not all(k in new_reservation_data for k in required_fields):
        return jsonify({"error": "Missing required reservation data"}), 400

    try:
        room_id = int(new_reservation_data['roomId'])
        guest_name = str(new_reservation_data['guestName']).strip()
        check_in = datetime.strptime(new_reservation_data['checkIn'], '%Y-%m-%d').date()
        check_out = datetime.strptime(new_reservation_data['checkOut'], '%Y-%m-%d').date()

        if not guest_name:
            return jsonify({"error": "Guest name cannot be empty"}), 400
        if check_out <= check_in:
            return jsonify({"error": "Check-out date must be after check-in date"}), 400

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid data types in reservation request"}), 400
    # --- End Input Validation ---

    # --- Check Room Availability ---
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        return jsonify({"error": f"Room ID {room_id} not found"}), 404
    if room.availability <= 0:
        return jsonify({"error": f"Room ID {room_id} is not available"}), 400
    # --- End Check Room Availability ---

    # --- Create and Save Reservation ---
    # Generate a unique ID (in a real app, use UUID)
    import os
    reservation_id = f"res{db.query(Reservation).count() + 1}_{os.urandom(4).hex()}"

    new_reservation = Reservation(
        id=reservation_id,
        room_id=room_id,
        guest_name=guest_name,
        check_in=check_in,
        check_out=check_out
    )

    try:
        db.add(new_reservation)
        # Decrement room availability
        room.availability -= 1
        db.commit()
    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to create reservation"}), 500

    return jsonify(new_reservation.to_dict()), 201

# API endpoint to delete a reservation
@app.route('/api/reservations/<string:reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id: str) -> Tuple[Any, int]:
    """Deletes a reservation by its ID."""
    db = get_session()
    
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        return jsonify({"error": f"Reservation ID {reservation_id} not found"}), 404

    try:
        # Increment room availability
        room = db.query(Room).filter(Room.id == reservation.room_id).first()
        if room:
            room.availability += 1
        
        # Delete the reservation
        db.delete(reservation)
        db.commit()
    except Exception as e:
        db.rollback()
        return jsonify({"error": "Failed to delete reservation"}), 500

    return jsonify({"message": f"Reservation {reservation_id} cancelled successfully"}), 200

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    host = os.environ.get('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.environ.get('FLASK_RUN_PORT', 5000))
    app.run(host=host, port=port, debug=debug_mode)
