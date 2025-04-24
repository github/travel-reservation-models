import json
import pytest
import uuid

# Language: python
# File: test_app.py

from app import app  # import the app and functions

# Original data from #file:data.json (without comments)
ORIGINAL_DATA = {
    "rooms": [
        {
            "id": 1,
            "name": "Standard Queen",
            "availability": 5,
            "price": 100
        },
        {
            "id": 2,
            "name": "Deluxe King",
            "availability": 2,
            "price": 150
        },
        {
            "id": 3,
            "name": "Suite",
            "availability": 2,
            "price": 250
        }
    ],
    "reservations": [
        {
            "roomId": 2,
            "guestName": "Kedasha",
            "checkIn": "2025-04-26",
            "checkOut": "2025-04-30",
            "id": "630b342b-14eb-4e56-ab68-d451a0bc5e72"
        }
    ]
}

@pytest.fixture(autouse=True)
def test_data(tmp_path, monkeypatch):
    """
    Creates a temporary data.json file using ORIGINAL_DATA and
    monkeypatches app.load_data and app.save_data to use this file.
    """
    data_file = tmp_path / "data.json"
    data_file.write_text(json.dumps(ORIGINAL_DATA, indent=2))
    
    def load_data_override():
        with open(data_file, 'r') as f:
            return json.load(f)
    
    def save_data_override(data):
        with open(data_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    monkeypatch.setattr("app.load_data", load_data_override)
    monkeypatch.setattr("app.save_data", save_data_override)
    return data_file

@pytest.fixture
def client():
    app.testing = True
    return app.test_client()

def test_index_route(client):
    response = client.get("/")
    assert response.status_code == 200
    # Check if HTML content includes some expected text
    assert b"Hotel Rooms" in response.data

def test_get_rooms(client, test_data):
    response = client.get("/api/rooms")
    assert response.status_code == 200
    rooms = response.get_json()
    # Validate against ORIGINAL_DATA['rooms']
    assert rooms == ORIGINAL_DATA["rooms"]

def test_get_reservations(client, test_data):
    response = client.get("/api/reservations")
    assert response.status_code == 200
    reservations = response.get_json()
    # Validate against ORIGINAL_DATA['reservations']
    assert reservations == ORIGINAL_DATA["reservations"]

def test_create_reservation_success(client, test_data):
    # Prepare a new reservation payload
    new_reservation = {
        "roomId": 1,
        "guestName": "Test Guest",
        "checkIn": "2025-05-01",
        "checkOut": "2025-05-05"
    }
    # Get current room availability for roomId 1.
    rooms_initial = client.get("/api/rooms").get_json()
    initial_availability = next(r for r in rooms_initial if r["id"] == 1)["availability"]
    
    response = client.post("/api/reservations", json=new_reservation)
    assert response.status_code == 201
    res_data = response.get_json()
    # Ensure an id was assigned
    assert "id" in res_data
    # Verify new reservation is in reservations list
    reservations_after = client.get("/api/reservations").get_json()
    assert any(r["id"] == res_data["id"] for r in reservations_after)
    # Verify room availability decreased by 1.
    rooms_after = client.get("/api/rooms").get_json()
    updated_room = next(r for r in rooms_after if r["id"] == 1)
    assert updated_room["availability"] == initial_availability - 1

def test_create_reservation_missing_field(client, test_data):
    # Missing 'guestName'
    invalid_reservation = {
        "roomId": 1,
        "checkIn": "2025-05-01",
        "checkOut": "2025-05-05"
    }
    response = client.post("/api/reservations", json=invalid_reservation)
    assert response.status_code == 400
    error_data = response.get_json()
    assert "error" in error_data

def test_cancel_reservation(client, test_data):
    # First, create a new reservation so we have one to cancel
    new_reservation = {
        "roomId": 3,
        "guestName": "Cancel Test",
        "checkIn": "2025-06-01",
        "checkOut": "2025-06-05"
    }
    # Get initial availability for roomId 3
    rooms_initial = client.get("/api/rooms").get_json()
    initial_availability = next(r for r in rooms_initial if r["id"] == 3)["availability"]
    
    create_response = client.post("/api/reservations", json=new_reservation)
    assert create_response.status_code == 201
    created = create_response.get_json()
    reservation_id = created["id"]
    
    # Now cancel the reservation
    cancel_response = client.delete(f"/api/reservations/{reservation_id}")
    assert cancel_response.status_code == 204
    
    # Verify that reservation is removed
    reservations_after = client.get("/api/reservations").get_json()
    assert not any(r["id"] == reservation_id for r in reservations_after)
    
    # Verify room availability increased
    rooms_after = client.get("/api/rooms").get_json()
    updated_room = next(r for r in rooms_after if r["id"] == 3)
    assert updated_room["availability"] == initial_availability

# End of test_app.py