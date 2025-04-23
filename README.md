# Travel Reservations App

This project is a simple web application for managing hotel reservations. It is built using Flask for the backend and VueJS with Tailwind CSS for the frontend. The application uses local JSON data to simulate a database.

## Features

- View available hotel rooms.
- Make a reservation.
- Cancel a reservation.
- View all reservations.

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: VueJS, Tailwind CSS
- **Data Storage**: Local JSON files

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.x
- pip3 (Python package installer)
- Node.js (which includes npm)

## Project Structure

```
project-root/
|-- static/          # Contains static files (Compiled CSS/JS, images)
|   |-- css/         # Compiled Tailwind CSS
|   |-- js/          # Compiled VueJS code
|-- src/             # Frontend source files (Vue components, main JS, base CSS)
|   |-- components/  # Vue components
|   |-- main.js      # Main Vue application entry point
|   |-- index.css    # Base CSS with Tailwind directives
|-- templates/       # Contains HTML templates for Flask (e.g., index.html loading the Vue app)
|-- app.py           # Main Flask application
|-- data.json        # Local JSON file for storing hotel and reservation data
|-- package.json     # Node.js dependencies
|-- tailwind.config.js # Tailwind configuration
|-- postcss.config.js  # PostCSS configuration (often used with Tailwind)
|-- README.md        # Project documentation
```
*(Note: The exact frontend structure might vary based on your VueJS project setup)*

## Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd project-root
    ```

2.  **Set up Python Virtual Environment & Install Backend Dependencies**:
    ```bash
    # Set up Python virtual environment (recommended)
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

    # Install Flask and other Python dependencies
    pip install flask

    # Consider adding a requirements.txt file
    pip freeze > requirements.txt
    ```

3.  **Install Frontend Dependencies**:
    ```bash
    # Install Node.js dependencies (VueJS, Tailwind CSS, etc.)
    npm install
    ```

4.  **Build Frontend Assets**:
    ```bash
    # Compile VueJS and Tailwind CSS for production
    npm run build
    ```

5.  **Run the Application (Production Mode)**:
    ```bash
    # Ensure your virtual environment is active
    python app.py
    ```

6.  **Access the application**:
    Open your browser and navigate to `http://127.0.0.1:5000`.

## Development

For development, you can run the Flask backend and the Vue frontend development server separately. This allows for features like hot-reloading.

1.  **Run the Flask Backend (Development Mode)**:
    ```bash
    # Ensure your virtual environment is active
    # Set environment variables (optional but recommended)
    export FLASK_APP=app.py  # On Windows use `set FLASK_APP=app.py`
    export FLASK_ENV=development # On Windows use `set FLASK_ENV=development`

    flask run
    ```
    The backend will typically run on `http://127.0.0.1:5000`.

2.  **Run the Vue Frontend Development Server**:
    ```bash
    # In a separate terminal
    npm run serve # Or the command specified in your package.json for development
    ```
    The frontend development server will usually run on a different port (e.g., `http://localhost:8080`). Access the application via this URL during development.

## Usage

- The homepage displays available hotel rooms.
- Use the reservation form to book a room.
- View and manage reservations through the "Reservations" page.

## API Endpoints (Example)

The Vue frontend interacts with the Flask backend via the following API endpoints:

-   `GET /api/rooms`: Retrieves a list of available rooms.
-   `GET /api/reservations`: Retrieves a list of all reservations.
-   `POST /api/reservations`: Creates a new reservation. Expects reservation details in the request body.
-   `DELETE /api/reservations/<reservation_id>`: Cancels an existing reservation.

*(Note: Update these endpoints based on your actual implementation in `app.py`)*

## Data Management

The application uses a `data.json` file to store information about hotel rooms and reservations. This file is read and updated by the Flask backend to simulate database operations.

**Example `data.json` structure:**

```json
{
  "rooms": [
    { "id": 1, "name": "Standard Queen", "availability": 5 },
    { "id": 2, "name": "Deluxe King", "availability": 3 }
  ],
  "reservations": [
    { "id": "res123", "roomId": 1, "guestName": "John Doe", "checkIn": "2025-05-01", "checkOut": "2025-05-05" }
  ]
}
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.