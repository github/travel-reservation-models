from flask import Flask, jsonify, request, render_template
import json
from datetime import datetime
import uuid

app = Flask(__name__)

def load_data():
    with open('data.json', 'r') as f:
        return json.load(f)

def save_data(data):
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

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
    reservation = request.json
    
    # Validate required fields
    required_fields = ['roomId', 'guestName', 'checkIn', 'checkOut']
    if not all(field in reservation for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Find room and check availability
    room = next((r for r in data['rooms'] if r['id'] == reservation['roomId']), None)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    if room['availability'] <= 0:
        return jsonify({'error': 'Room not available'}), 400
    
    # Create reservation
    reservation['id'] = str(uuid.uuid4())
    data['reservations'].append(reservation)
    
    # Update room availability
    room['availability'] -= 1
    
    save_data(data)
    return jsonify(reservation), 201

@app.route('/api/reservations/<reservation_id>', methods=['DELETE'])
def cancel_reservation(reservation_id):
    data = load_data()
    
    # Find and remove reservation
    reservation = next((r for r in data['reservations'] if r['id'] == reservation_id), None)
    if not reservation:
        return jsonify({'error': 'Reservation not found'}), 404
    
    # Update room availability
    room = next((r for r in data['rooms'] if r['id'] == reservation['roomId']), None)
    if room:
        room['availability'] += 1
    
    data['reservations'] = [r for r in data['reservations'] if r['id'] != reservation_id]
    save_data(data)
    
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)