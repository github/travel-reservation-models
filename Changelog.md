# Changelog

## [1.2.0] - 2025-04-30

### Changed
- Converted Python Netlify Functions to pure JavaScript implementations
- Removed Python dependencies as they are not supported on Netlify.com
- Added uuid npm package for generating reservation IDs
- Updated package.json with correct dependencies

### Removed
- Python function handlers (get_rooms/handler.py and manage_reservations/handler.py)
- Python-specific configuration files

## [1.1.4] - 2025-04-30

### Fixed
- Restructured Netlify Functions to follow proper module resolution
- Fixed Python handler path resolution in JavaScript wrappers
- Improved error handling and logging for Python script execution

## [1.1.3] - 2025-04-30

### Fixed
- Improved data.json path resolution to handle both development and production environments
- Added fallback path resolution strategies for Netlify Functions
- Enhanced error handling and logging for file operations

## [1.1.2] - 2025-04-30

### Fixed
- Updated Vue.js CDN link to use stable version 3.3.4 instead of non-existent version

## [1.1.1] - 2025-04-30

### Fixed
- Fixed Netlify redirect configuration to properly handle function routes
- Updated frontend API paths to use new /api/functions/ prefix

## [1.1.0] - 2025-04-30

### Added
- Netlify deployment configuration
- Serverless functions for API endpoints
- Local development instructions for Netlify
- Netlify build and redirect rules

### Changed
- Converted Flask routes to Netlify serverless functions
- Updated API endpoint paths for Netlify Functions
- Modified README with Netlify deployment instructions

### Infrastructure
- Added netlify.toml configuration
- Created Netlify functions directory structure
- Implemented get_rooms and manage_reservations as serverless functions

## [0.1.0] - 2025-04-22

### Added
- Initial README, LICENSE, Copilot Instructions, and gitignore