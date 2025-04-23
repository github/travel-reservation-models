## [0.1.5] - 2025-04-22

### Fixed
- Resolved `jinja2.exceptions.UndefinedError: 'res' is undefined` in `index.html` by wrapping all `{{ res.* }}` interpolations within the reservation list `v-for` loop with `{% raw %}` tags.

## [0.1.4] - 2025-04-22

### Fixed
- Resolved `jinja2.exceptions.UndefinedError: 'room' is undefined` in `index.html` by wrapping the `{{ room.name }}` interpolation inside the `<select>` options with `{% raw %}` tags.

## [0.1.3] - 2025-04-22

### Fixed
- Resolved `jinja2.exceptions.UndefinedError: 'room' is undefined` in `index.html` by wrapping Vue.js variable interpolations (`{{ room.name }}` and `{{ room.availability }}`) within the `v-for` loop in `{% raw %}` tags.

## [0.1.2] - 2025-04-22

### Fixed
- Resolved a second Jinja2 template syntax error in `index.html` by wrapping another Vue.js ternary expression (`{{ condition === value ? 'true' : 'false' }}`) in `{% raw %}` tags.

## [0.1.1] - 2025-04-22

### Fixed
- Resolved Jinja2 template syntax error in `index.html` by wrapping a Vue.js ternary expression (`{{ condition ? 'true' : 'false' }}`) in `{% raw %}` tags. This prevents Jinja from attempting to parse Vue-specific syntax.

## [0.1.0] - 2025-04-22

### Added
- Initial project structure based on README.
- Basic Flask backend (`app.py`) with API endpoints for rooms and reservations (GET, POST, DELETE).
- Data storage using `data.json`.
- `requirements.txt` with Flask dependency.
- Basic HTML template (`templates/index.html`) using Vue and Tailwind via CDN.
- Basic VueJS frontend (`src/main.js` and `static/js/main.js`) to display rooms, reservations, and allow booking/cancellation.
- Initial `README.md`, `LICENSE`, and `Changelog.md`.