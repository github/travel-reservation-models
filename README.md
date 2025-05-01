# Travel Reservations App

This project is a simple web application for managing hotel reservations. It is built using Flask for the backend and VueJS for the frontend. The application uses local JSON data to simulate a database. VueJS and Tailwind CSS are loaded via CDN, eliminating the need for a frontend build step.

## Features

- View available hotel rooms.
- Make a reservation.
- Cancel a reservation.
- View all reservations.

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: VueJS (loaded via CDN), Tailwind CSS (via CDN)
- **Data Storage**: Local JSON files

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.x
- pip3 (Python package installer)

## Project Structure

```
project-root/
|-- static/          # Contains static files served directly
|   |-- js/          # Copied JavaScript application code
|       |-- main.js
|-- src/             # Frontend source file (not directly served)
|   |-- main.js      # Contains all Vue component logic and templates
|-- templates/       # Contains HTML templates for Flask
|   |-- index.html   # Loads Vue/Tailwind CDN and static/js/main.js
|-- app.py           # Main Flask application
|-- data.json        # Local JSON file for storing hotel and reservation data
|-- requirements.txt # Python dependencies
|-- README.md        # Project documentation
|-- LICENSE          # Project License
|-- Changelog.md     # Change history
```

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

    # Install Python dependencies
    pip install -r requirements.txt

    # Add a requirements.txt file
    pip freeze > requirements.txt
    ```

3.  **Prepare Frontend JavaScript**:
    The frontend JavaScript (`src/main.js`) needs to be copied to the static directory to be served by Flask.
    ```bash
    # On macOS/Linux
    cp src/main.js static/js/main.js

    # On Windows
    copy src\main.js static\js\main.js
    ```
    *(Note: You need to repeat this copy step whenever you modify `src/main.js`)*

4.  **Run the Application**:
    ```bash
    # Ensure your virtual environment is active
    python3 app.py
    ```
    *(Alternatively, for development mode with auto-reload for backend changes):*
    ```bash
    export FLASK_DEBUG=1 # On Windows use `set FLASK_DEBUG=1`
    python3 -m flask run
    ```

5.  **Access the application**:
    Open your browser and navigate to `http://127.0.0.1:5000`.

## Development

Development involves running the Flask backend and manually copying the frontend JavaScript file after making changes.

1.  **Run the Flask Backend (Development Mode)**:
    ```bash
    # Ensure your virtual environment is active
    export FLASK_DEBUG=1 # On Windows use `set FLASK_DEBUG=1`
    python3 -m flask run
    ```
    The backend will run on `http://127.0.0.1:5000` and automatically reload when backend Python files change.

2.  **Modify Frontend JavaScript**:
    Edit the `src/main.js` file.

3.  **Copy Updated Frontend JavaScript**:
    After saving changes to `src/main.js`, copy it to the static folder:
    ```bash
    # On macOS/Linux
    cp src/main.js static/js/main.js

    # On Windows
    copy src\main.js static\js\main.js
    ```

4.  **Refresh Browser**: Refresh your browser page (`http://127.0.0.1:5000`) to see the frontend changes.

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

## Netlify Deployment

This application is configured for deployment on Netlify using serverless functions. The backend API routes have been converted to Netlify Functions, and the frontend is served as a static site.

### Deployment Steps

1. **Connect to Netlify**:
   - Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
   - Log in to Netlify and click "New site from Git"
   - Choose your repository and follow the prompts

2. **Configure Build Settings**:
   - Build command: `mkdir -p dist && cp -r static/* dist/ && cp -r templates/* dist/`
   - Publish directory: `dist`
   - These settings are already configured in `netlify.toml`

3. **Environment Variables**:
   No additional environment variables are required for basic functionality.

### Local Development with Netlify

To test the application locally with Netlify Functions:

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Run the development server:
   ```bash
   netlify dev
   ```

3. Access the application at `http://localhost:8888`

### API Endpoints

The API endpoints are now served as Netlify Functions:

- `/.netlify/functions/get_rooms`: Get available rooms
- `/.netlify/functions/manage_reservations`: Handle reservations (GET, POST, DELETE)

Note: The frontend code automatically handles the correct API paths.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.