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
    # Set up Python virtual environment (optional but recommended)
    python3 -m venv venv
    source venv/bin/activate

    # Install Flask
    pip install flask
    ```

3.  **Install Frontend Dependencies**:
    *   Ensure you have Node.js and npm installed.
    ```bash
    # Install Node.js dependencies (VueJS, Tailwind CSS, etc.)
    npm install

    # Build frontend assets
    npm run build
    ```

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Access the application**:
   Open your browser and navigate to `http://127.0.0.1:5000`.

## Usage

- The homepage displays available hotel rooms.
- Use the reservation form to book a room.
- View and manage reservations through the "Reservations" page.

## Data Management

The application uses a `data.json` file to store information about hotel rooms and reservations. This file is read and updated by the Flask backend to simulate database operations.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Development notes

Use a python3 venv