# Travel Reservations App

This project is a simple web application for managing hotel reservations. It is built using Flask for the backend and VueJS for the frontend. The application uses PostgreSQL for data storage, with SQLAlchemy as the ORM. VueJS and Tailwind CSS are loaded via CDN, eliminating the need for a frontend build step.

## Executive Summary

The Travel Reservations App provides a user-friendly interface for managing hotel room bookings. It allows users to view available rooms, make reservations, and cancel existing bookings. The application is designed with a modern architecture, utilizing Flask for the backend API, VueJS for the interactive frontend, and PostgreSQL for reliable data storage. This setup is suitable for production use with proper scalability and data persistence.

## Features

- View available hotel rooms
- Make a reservation for an available room
- Cancel an existing reservation
- View all current reservations
- Persistent data storage with PostgreSQL
- Transaction support for data integrity

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: VueJS 3 (loaded via CDN), Tailwind CSS (via CDN)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Additional**: python-dotenv for configuration

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.x (3.7+ recommended for type hints)
- pip (Python package installer)
- PostgreSQL server (14.0+ recommended)

## Project Structure

```
/
├── static/             # Static files served by Flask
│   └── js/
│       └── main.js     # Compiled/copied frontend JavaScript
├── src/                # Source files (not directly served)
│   └── main.js         # VueJS source code
├── templates/          # HTML templates (Jinja2)
│   └── index.html      # Main page template
├── .env                # Local environment variables (DO NOT COMMIT)
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore rules
├── app.py              # Main Flask application (backend API)
├── models.py           # SQLAlchemy database models
├── requirements.txt    # Python dependencies
├── README.md           # This file
└── Changelog.md        # Record of changes
```

## Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd travel-reservation-models
    ```

2.  **Set up PostgreSQL**:
    - Install PostgreSQL if not already installed
    - Start the PostgreSQL service:
      ```bash
      brew services start postgresql@14
      ```
    - Create a new database:
      ```bash
      createdb travel_reservations
      ```
    - Verify the database connection:
      ```bash
      psql travel_reservations -c "\conninfo"
      ```
    You should see a message confirming your connection to the database.

3.  **Set up Python Virtual Environment & Install Backend Dependencies**:
    ```bash
    # Create a virtual environment (recommended)
    python3 -m venv venv
    # Activate it (macOS/Linux)
    source venv/bin/activate
    # Activate it (Windows)
    # venv\\Scripts\\activate

    # Install Python dependencies
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables**:
    Copy the example environment file and update with your database credentials:
    ```bash
    cp .env.example .env
    ```
    Edit `.env` to set your database connection details:
    ```
    DATABASE_URL=postgresql://user:password@localhost:5432/travel_reservations
    # Or configure individual components:
    # DB_HOST=localhost
    # DB_PORT=5432
    # DB_NAME=travel_reservations
    # DB_USER=your_username
    # DB_PASSWORD=your_password
    ```

5.  **Prepare Frontend JavaScript**:
    Copy the frontend JavaScript to the static directory:
    ```bash
    # On macOS/Linux
    cp src/main.js static/js/main.js
    # On Windows
    # copy src\\main.js static\\js\\main.js
    ```

6.  **Initialize Database**:
    The application will automatically create tables and seed initial data when first run.
    This happens in the `init_db()` and `seed_db()` functions when the Flask app starts.

7.  **Run the Application**:
    ```bash
    # Ensure your virtual environment is active
    python3 app.py
    ```

8.  **Access the application**:
    Open your browser and navigate to `http://127.0.0.1:5000`

## Development

For development, ensure `FLASK_DEBUG=1` is set in your `.env` file. The backend will automatically reload when Python files change.

### Database Schema

#### Rooms Table
```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    availability INTEGER NOT NULL,
    price FLOAT NOT NULL
);
```

#### Reservations Table
```sql
CREATE TABLE reservations (
    id VARCHAR PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id),
    guest_name VARCHAR NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL
);
```

## API Endpoints

The Vue frontend interacts with the Flask backend via the following API endpoints:

### GET /api/rooms

Retrieves a list of all rooms.

**Response:**

```json
[
  {
    "id": 1,
    "name": "Standard Queen",
    "availability": 5,
    "price": 120
  },
  {
    "id": 2,
    "name": "Deluxe King",
    "availability": 3,
    "price": 180
  }
]
```

### GET /api/reservations

Retrieves a list of all reservations.

**Response:**

```json
[
  {
    "id": "res1_abcdef12",
    "roomId": 1,
    "guestName": "John Doe",
    "checkIn": "2025-05-01",
    "checkOut": "2025-05-05"
  }
]
```

### POST /api/reservations

Creates a new reservation. Expects JSON payload:

**Request Body:**

```json
{
  "roomId": 1,
  "guestName": "Jane Doe",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD"
}
```

**Response (Success - 201 Created):**

```json
{
  "id": "res2_fedcba21",
  "roomId": 1,
  "guestName": "Jane Doe",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD"
}
```

**Response (Error - 400 Bad Request):**

```json
{
  "error": "Missing required reservation data"
}
```

### DELETE /api/reservations/\<reservation_id>

Cancels an existing reservation using its string ID.

**Response (Success - 200 OK):**

```json
{
  "message": "Reservation res1_abcdef12 cancelled successfully"
}
```

**Response (Error - 404 Not Found):**

```json
{
  "error": "Reservation ID res1_abcdef12 not found"
}
```

## Workflow Diagrams

### Reservation Workflow

```mermaid
sequenceDiagram
    participant User
    participant Frontend (VueJS)
    participant Backend (Flask)
    participant Database (PostgreSQL)

    User->>Frontend: Submits reservation form
    Frontend->>Backend: POST /api/reservations
    Backend->>Database: Check room availability
    alt Room available
        Backend->>Database: Create reservation
        Backend->>Database: Update room availability
        Database-->>Backend: Success
        Backend-->>Frontend: 201 Created, reservation data
        Frontend-->>User: Confirmation
    else Room unavailable
        Database-->>Backend: Room not available
        Backend-->>Frontend: 400 Bad Request, error message
        Frontend-->>User: Error message
    end
```

### Cancellation Workflow

```mermaid
sequenceDiagram
    participant User
    participant Frontend (VueJS)
    participant Backend (Flask)
    participant Database (PostgreSQL)

    User->>Frontend: Clicks cancel reservation
    Frontend->>Backend: DELETE /api/reservations/<reservation_id>
    Backend->>Database: Find reservation
    alt Reservation exists
        Backend->>Database: Delete reservation
        Backend->>Database: Update room availability
        Database-->>Backend: Success
        Backend-->>Frontend: 200 OK, success message
        Frontend-->>User: Confirmation
    else Reservation does not exist
        Database-->>Backend: Not found
        Backend-->>Frontend: 404 Not Found, error message
        Frontend-->>User: Error message
    end
```

## Environment Variables

*   `FLASK_DEBUG`: Set to `1` to enable Flask's debug mode (auto-reloading, interactive debugger). Defaults to `0` (off).
*   `FLASK_RUN_HOST`: Host address to bind the server to (e.g., `0.0.0.0` to listen on all interfaces). Defaults to `127.0.0.1`.
*   `FLASK_RUN_PORT`: Port number for the server. Defaults to `5000`.

*(Add these to `.env` and `.env.example` if you need to change defaults)*

## Data Management

The application uses PostgreSQL to store information about hotel rooms and reservations. The database schema is managed by SQLAlchemy ORM and consists of two main tables:

1. The `rooms` table stores information about hotel rooms, including their availability and pricing
2. The `reservations` table tracks all bookings, with foreign key relationships to the rooms table

The database is automatically initialized with sample data when the application first starts. See the Database Schema section above for the detailed table structures.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.