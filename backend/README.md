
# System Monitor Backend

This is the Flask backend for the System Monitor Dashboard.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask application:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

- `/api/cpu-memory` - Get CPU and memory usage
- `/api/processes` - Get running processes
- `/api/network-connections` - Get network connections
- `/api/traffic-stats` - Get traffic anomaly data
- `/api/full-scan` - Run complete system scan
- `/api/save-scan` - Save current scan results
- `/api/cryptojacking-check` - Check for cryptojacking activity (NEW!)

## Cryptojacking Detection

The new `/api/cryptojacking-check` endpoint scans for:
- Suspicious process names (miners, crypto-related software)
- High CPU usage processes (>70%)
- Connections to known mining pools/domains
- Suspicious ports commonly used by miners

Results are saved to `cryptojacking_report.json` and include:
- List of suspicious processes
- List of suspicious network connections
- Risk level assessment
- Overall verdict

## Configuration

The cryptojacking detection uses patterns from `blacklist.json`. You can customize this file to add or remove suspicious:
- Process names
- Domain names
- Port numbers

## CORS Setup

If you encounter CORS issues, add this to your app.py:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Add this line after creating the Flask app
```
