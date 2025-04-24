# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2025-04-24

### Changed
- Removed visible reservation IDs from the frontend reservation list.
- Added `price` field to each room in `data.json`.
- Displayed room price in both the room list and the reservation dropdown in the frontend.

## [0.2.1] - 2025-04-24

### Fixed
- Resolved `jinja2.exceptions.UndefinedError` by wrapping the Vue app container in `templates/index.html` with `{% raw %}` tags to prevent Jinja2 from interpreting VueJS delimiters.

## [0.2.0] - 2025-04-24

### Added
- Frontend implementation using VueJS 3 (via CDN) in `src/main.js`.
- Tailwind CSS styling (via CDN) in `templates/index.html`.
- Vue app displays rooms and reservations fetched from the API.
- Vue app handles reservation form submission (POST to `/api/reservations`).
- `DELETE /api/reservations/<reservation_id>` endpoint in Flask backend (`app.py`).
- Cancellation button and functionality in the Vue frontend.
- `python-dotenv` dependency added to `requirements.txt`.
- Type hints added to Flask backend functions in `app.py`.
- Basic input validation and error handling in API endpoints.

### Changed
- Updated `templates/index.html` to integrate Vue app structure and Tailwind.
- Updated `README.md` with VueJS details, improved setup/run instructions, and DELETE endpoint documentation.
- Refined data loading/saving logic in `app.py` for robustness.
- Flask app (`app.py`) now reads `FLASK_DEBUG`, `FLASK_RUN_HOST`, `FLASK_RUN_PORT` from `.env`.

## [0.1.0] - 2025-04-24

### Added
- Initial project structure with Flask backend.
- Basic API endpoints for rooms and reservations (`GET /api/rooms`, `GET /api/reservations`, `POST /api/reservations`).
- Data storage using `data.json`.
- Basic HTML template (`index.html`) and placeholder JavaScript (`main.js`).
- Setup instructions and documentation in `README.md`.
- `.gitignore` for Python projects.
- `.env` and `.env.example` for environment variables.
- Initial `Changelog.md`.