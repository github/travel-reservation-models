#!/usr/bin/env python3
import json
import os
import uuid
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

def save_data(data):
    data_path = find_data_file()
    if not data_path:
        print(f"Warning: Could not find data.json to save", file=sys.stderr)
        return
        
    try:
        with open(data_path, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving data file: {str(e)}", file=sys.stderr)
        raise

def handler(event, context):
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    method = event.get('httpMethod', '')
    
    # Handle CORS preflight requests
    if method == 'OPTIONS':
        return {
            'statusCode': 204,
            'headers': headers,
            'body': ''
        }

    try:
        data = load_data()
        
        if method == 'GET':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(data['reservations'])
            }
        
        elif method == 'POST':
            try:
                body = json.loads(event.get('body', '{}'))
                new_reservation = {
                    'id': str(uuid.uuid4()),
                    'roomId': body['roomId'],
                    'guestName': body['guestName'],
                    'checkIn': body['checkIn'],
                    'checkOut': body['checkOut']
                }
                
                # Update room availability
                room_found = False
                for room in data['rooms']:
                    if room['id'] == new_reservation['roomId']:
                        room_found = True
                        if room['availability'] > 0:
                            room['availability'] -= 1
                        else:
                            return {
                                'statusCode': 400,
                                'headers': headers,
                                'body': json.dumps({'error': 'Room not available'})
                            }
                
                if not room_found:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Room not found'})
                    }
                
                data['reservations'].append(new_reservation)
                save_data(data)
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(new_reservation)
                }
            except (KeyError, json.JSONDecodeError) as e:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': str(e)})
                }
        
        elif method == 'DELETE':
            try:
                reservation_id = event.get('path', '').split('/')[-1]
                reservation = next((r for r in data['reservations'] if r['id'] == reservation_id), None)
                
                if reservation:
                    # Restore room availability
                    for room in data['rooms']:
                        if room['id'] == reservation['roomId']:
                            room['availability'] += 1
                    
                    data['reservations'] = [r for r in data['reservations'] if r['id'] != reservation_id]
                    save_data(data)
                    
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'message': 'Reservation cancelled successfully'})
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Reservation not found'})
                    }
            except Exception as e:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': str(e)})
                }
    except Exception as e:
        print(f"Error in handler: {str(e)}", file=sys.stderr)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'})
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