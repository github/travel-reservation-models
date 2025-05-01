# Travel Reservations App

This project is a simple web application for managing hotel reservations. It uses JavaScript-based Netlify Functions for the backend API endpoints and VueJS for the frontend. The application uses Netlify's Blob Store for data persistence. VueJS and Tailwind CSS are loaded via CDN, eliminating the need for a frontend build step.

## Features

- View available hotel rooms.
- Make a reservation.
- Cancel a reservation.
- View all reservations.

## Technologies Used

- **Backend**: Netlify Functions (JavaScript)
- **Frontend**: VueJS (loaded via CDN), Tailwind CSS (via CDN)
- **Data Storage**: Netlify Blob Store
- **Deployment**: Netlify

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js and npm (for Netlify CLI and dependencies)

## Project Structure

```
project-root/
|-- netlify/            # Contains Netlify Functions
|   |-- functions/      # Serverless function endpoints
|       |-- get_rooms.js
|       |-- manage_reservations.js
|-- static/            # Contains static files served directly
|   |-- js/           # JavaScript application code
|       |-- main.js
|-- templates/         # Contains HTML templates
|   |-- index.html    # Loads Vue/Tailwind CDN and static/js/main.js
|-- data.json         # Local JSON file for storing hotel and reservation data
|-- netlify.toml      # Netlify configuration
|-- package.json      # Node.js dependencies
|-- README.md         # Project documentation
|-- LICENSE           # Project License
|-- Changelog.md      # Change history
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd travel-reservation-models
   ```

2. **Install Dependencies**:
   ```bash
   # Install Netlify CLI globally
   npm install -g netlify-cli

   # Install project dependencies
   npm install
   ```

## Development

1. **Start the Local Development Server**:
   ```bash
   netlify dev
   ```
   This will start the development server at `http://localhost:8888`

2. **Making Changes**:
   - Edit frontend code in `static/js/main.js` and `templates/index.html`
   - Edit Netlify Functions in `netlify/functions/`
   - Changes will be hot-reloaded automatically
   - Data persists in Netlify's Blob Store between function invocations

## Usage

- The homepage displays available hotel rooms.
- Use the reservation form to book a room.
- View and manage reservations through the "Reservations" page.

## API Endpoints

The frontend interacts with these Netlify Function endpoints:

- `/.netlify/functions/get_rooms`: Get available rooms
- `/.netlify/functions/manage_reservations`: Handle reservations (GET, POST, DELETE)

## Data Management

The application uses Netlify's Blob Store to persist hotel rooms and reservations data. The data is stored in a JSON format and accessed by the Netlify Functions to manage state.

**Example data structure:**
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

## Environment Variables

The application requires the following environment variables for Netlify Blob Store:

- `NETLIFY_BLOBS_SITE_ID`: Your Netlify site ID (found in Site settings)
- `NETLIFY_BLOBS_TOKEN`: Access token for Netlify Blob Store

For local development:
1. Copy `.env.example` to `.env`
2. Fill in your Netlify site ID and access token
3. The Netlify CLI will automatically load these variables during development

For production:
1. Add these environment variables in your Netlify site settings
2. Go to Site settings > Build & deploy > Environment variables
3. Add each variable with its corresponding value

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