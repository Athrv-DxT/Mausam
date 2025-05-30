from flask import Flask, request, jsonify, send_from_directory
import requests
import os
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# API key from environment variable ONLY
API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")

# Check if API key is available
if not API_KEY:
    print("ERROR: OPENWEATHERMAP_API_KEY environment variable not found!")
    print("Please set your API key in the .env file")

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/weather', methods=['GET'])
def get_weather():
    try:
        if not API_KEY:
            return jsonify({'error': 'API key not configured'}), 500
            
        city = request.args.get('city')
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        if city:
            url = f'https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric'
        elif lat and lon:
            url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric'
        else:
            return jsonify({'error': 'Either city or lat/lon parameters are required'}), 400
        
        response = requests.get(url)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Failed to fetch weather data'}), response.status_code
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forecast', methods=['GET'])
def get_forecast():
    try:
        if not API_KEY:
            return jsonify({'error': 'API key not configured'}), 500
            
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        if not lat or not lon:
            return jsonify({'error': 'lat and lon parameters are required'}), 400
        
        url = f'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric'
        response = requests.get(url)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Failed to fetch forecast data'}), response.status_code
            
    except Exception e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)