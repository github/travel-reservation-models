## Operator Interaction
- When asked to fix code, first explain the problems found.
- When asked to generate tests, first explain what tests will be created.

## Security
- Check the code for vulnerabilities after generating.

## Environment Variables
- If a .env file exists, use it for locan environment variables

## Change Logging
- each time you generate code, note the changes in changelog.md

## For Python Projects Only
- always use a Python3 virtual environment: if no venv exists, create one and activate
- never use `flask run`, use `python3 -m flask run` instead
- always use and update a requirements.txt file for Python modules