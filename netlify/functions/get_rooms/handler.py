#!/usr/bin/env python3
import json
import os
import sys

def find_data_file():
    # Try multiple possible locations for data.json
    possible_paths = [
        # Production path
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'data.json'),
        # Development server path
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), 'data.json'),
        # Absolute fallback path
        os.path.join(os.environ.get('NETLIFY_WORKSPACE_ROOT', ''), 'data.json')
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
            
    # If we still can't find it, try to find it relative to cwd
    cwd = os.getcwd()
    while cwd and cwd != '/':
        path = os.path.join(cwd, 'data.json')
        if os.path.exists(path):
            return path
        cwd = os.path.dirname(cwd)
    
    return None

def load_data():
    data_path = find_data_file()
    if not data_path:
        print(f"Warning: Could not find data.json in any expected location", file=sys.stderr)
        return {"rooms": [], "reservations": []}
        
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"rooms": [], "reservations": []}
    except Exception as e:
        print(f"Error reading data file: {str(e)}", file=sys.stderr)
        return {"rooms": [], "reservations": []}

def handler(event, context):
    if event['httpMethod'] != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        data = load_data()
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(data['rooms'])
        }
    except Exception as e:
        print(f"Error in handler: {str(e)}", file=sys.stderr)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }

if __name__ == '__main__':
    try:
        event_data = json.loads(sys.stdin.read())
        result = handler(event_data['event'], event_data['context'])
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            'statusCode': 500,
            'body': json.dumps({'error': f'Input processing error: {str(e)}'})
        }))