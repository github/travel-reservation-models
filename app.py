from flask import Flask, jsonify, request, render_template
import json
from datetime import datetime
import uuid

app = Flask(__name__)

def load_data():
    try:
        with open('data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"rooms": [], "reservations": []}

def save_data(data):
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    data = load_data()
    return jsonify(data['rooms'])

@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    data = load_data()
    return jsonify(data['reservations'])

@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    data = load_data()
    new_reservation = request.json
    
    # Validate required fields
    required_fields = ['roomId', 'guestName', 'checkIn', 'checkOut']
    if not all(field in new_reservation for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Validate dates
    try:
        check_in = datetime.strptime(new_reservation['checkIn'], '%Y-%m-%d')
        check_out = datetime.strptime(new_reservation['checkOut'], '%Y-%m-%d')
        if check_out <= check_in:
            return jsonify({"error": "Check-out must be after check-in"}), 400
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    
    # Find room and check availability
    room = next((r for r in data['rooms'] if r['id'] == new_reservation['roomId']), None)
    if not room:
        return jsonify({"error": "Room not found"}), 404
    if room['availability'] <= 0:
        return jsonify({"error": "Room not available"}), 400
    
    # Create reservation
    new_reservation['id'] = str(uuid.uuid4())
    data['reservations'].append(new_reservation)
    
    # Update room availability
    room['availability'] -= 1
    
    save_data(data)
    return jsonify(new_reservation), 201

@app.route('/api/reservations/<reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id):
    data = load_data()
    
    # Find reservation
    reservation = next((r for r in data['reservations'] if r['id'] == reservation_id), None)
    if not reservation:
        return jsonify({"error": "Reservation not found"}), 404
    
    # Find room and update availability
    room = next((r for r in data['rooms'] if r['id'] == reservation['roomId']), None)
    if room:
        room['availability'] += 1
    
    # Remove reservation
    data['reservations'] = [r for r in data['reservations'] if r['id'] != reservation_id]
    save_data(data)
    
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)