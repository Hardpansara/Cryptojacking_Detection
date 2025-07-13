
# System Monitor Dashboard

A comprehensive real-time system monitoring and security analysis dashboard built with React and Flask. This application provides advanced system monitoring capabilities including CPU/memory tracking, process monitoring, network analysis, traffic anomaly detection, cryptojacking detection, and file scanning.

## 🚀 Features

### Frontend Features
- **Real-time System Overview**: Live CPU and memory usage monitoring with color-coded status indicators
- **Process Monitor**: View running processes with detailed information and resource usage
- **Network Monitor**: Track network connections and identify suspicious activities
- **Traffic Anomalies**: Detect and visualize network traffic patterns and anomalies
- **Cryptojacking Detection**: Advanced security scanning to detect cryptocurrency mining malware
- **File Scanner**: Upload and analyze files for potential security threats
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui components
- **Dark Theme**: Professional dark-themed interface for better visibility

### Backend Features
- **System Metrics API**: Real-time CPU, memory, and system statistics
- **Process Analysis**: Comprehensive process monitoring with security checks
- **Network Analysis**: Connection tracking and suspicious activity detection
- **Cryptojacking Detection**: Advanced behavioral analysis for mining malware
- **File Analysis**: Upload and scan files for security threats including:
  - Entropy analysis for packed/encrypted files
  - Keyword scanning for mining-related terms
  - Hash generation and metadata extraction
- **Report Generation**: Automated security reports in JSON format
- **Real-time Scanning**: Live system scans with detailed findings

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization and charts
- **React Router** - Client-side routing

### Backend
- **Flask** - Python web framework
- **psutil** - System and process utilities
- **Python 3.x** - Backend runtime

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Python 3.7+**
- **pip** (Python package manager)

## 🚀 Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Hardpansara/Cryptojacking_Detection.git
cd Cryptojacking_Detection

```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be available at `http://localhost:8080`

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```
The backend API will be available at `http://localhost:5000`

## 📁 Project Structure

```
system-monitor-dashboard/
├── src/
│   ├── components/
│   │   ├── sections/
│   │   │   ├── Home.tsx              # Dashboard overview
│   │   │   ├── CpuMemory.tsx         # CPU/Memory monitoring
│   │   │   ├── ProcessMonitor.tsx    # Process monitoring
│   │   │   ├── NetworkMonitor.tsx    # Network monitoring
│   │   │   ├── TrafficAnomalies.tsx  # Traffic analysis
│   │   │   ├── CryptojackingDetection.tsx # Security scanning
│   │   │   └── FileScanner.tsx       # File analysis
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── Layout.tsx                # Main layout component
│   │   └── StatusCard.tsx            # Status display component
│   ├── pages/
│   │   └── Index.tsx                 # Main page router
│   └── main.tsx                      # Application entry point
├── backend/
│   ├── app.py                        # Flask application
│   ├── scan_utils.py                 # File scanning utilities
│   ├── blacklist.json               # Security blacklists
│   └── requirements.txt              # Python dependencies
└── README.md
```

## 🔧 API Endpoints

### System Monitoring
- `GET /api/cpu-memory` - Get CPU and memory usage statistics
- `GET /api/processes` - Get running processes information
- `GET /api/network-connections` - Get network connections

### Security Features
- `GET /api/cryptojacking-check` - Perform cryptojacking detection scan
- `POST /api/scan-file` - Upload and analyze files for threats
- `GET /api/full-scan` - Run comprehensive system security scan
- `GET /api/save-scan` - Save current scan results
- `GET /api/traffic-stats` - Get network traffic anomaly data

## 🛡️ Security Features

### Cryptojacking Detection
The system uses advanced behavioral analysis to detect cryptocurrency mining malware:

- **Process Analysis**: Monitors for suspicious process names and high CPU usage
- **Network Analysis**: Detects connections to known mining pools
- **Behavioral Analysis**: Identifies unusual system resource consumption
- **Dynamic Detection**: Real-time analysis without relying solely on static signatures

### File Scanner
Upload files for comprehensive security analysis:

- **Entropy Analysis**: Detects packed or encrypted malicious files
- **Keyword Scanning**: Searches for mining-related terms and commands
- **Hash Generation**: Creates unique file fingerprints (SHA256)
- **Metadata Extraction**: Analyzes file properties and characteristics

## 📊 Monitoring Capabilities

### Real-time Metrics
- CPU usage percentage with color-coded alerts
- Memory usage with warning thresholds
- System status and connectivity monitoring
- Network activity tracking

### Process Monitoring
- Real-time process list with resource usage
- Suspicious process detection
- Process command line analysis
- Resource consumption alerts

### Network Analysis
- Active network connections
- Suspicious connection detection
- Traffic pattern analysis
- Anomaly detection and alerts

## 🎨 User Interface

### Dashboard Overview
- Clean, modern dark theme interface
- Real-time status cards with color coding
- Quick action buttons for common tasks
- Responsive design for all screen sizes

### Navigation
- Sidebar navigation with clear section separation
- Tab-based content switching
- Intuitive iconography using Lucide icons
- Consistent styling throughout the application

## ⚙️ Configuration

### Backend Configuration
- Modify `blacklist.json` to customize security detection patterns
- Adjust CPU and memory thresholds in the Flask application
- Configure file upload limits and allowed file types

### Frontend Configuration
- Update API endpoints in component files if backend URL changes
- Customize refresh intervals for real-time data
- Modify color themes in Tailwind configuration

## 🔍 Usage

### Basic Monitoring
1. Start both frontend and backend servers
2. Navigate to the dashboard at `http://localhost:8080`
3. View real-time system metrics on the home page
4. Use navigation to explore different monitoring sections

### Security Scanning
1. Click "Check Cryptojacking" for immediate threat detection
2. Use "Run Full Scan" for comprehensive system analysis
3. Navigate to "File Scanner" to analyze uploaded files
4. Review reports and download results as needed

### File Analysis
1. Go to the File Scanner section
2. Upload a file using drag-and-drop or file selection
3. Click "Scan File" to analyze for threats
4. Review detailed results and download reports

## 🚨 Troubleshooting

### Common Issues
- **Backend Connection Failed**: Ensure Flask server is running on port 5000
- **CORS Issues**: Flask-CORS is configured; check firewall settings
- **File Upload Errors**: Verify file size limits and supported formats
- **Permission Errors**: Some system monitoring features may require elevated privileges

### Performance Considerations
- Monitor refresh intervals can be adjusted for performance
- Large file uploads may take time to process
- System scans are resource-intensive operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- Machine learning-based anomaly detection
- Historical data storage and trending
- Email/SMS alert notifications
- Custom security rule configuration
- Multi-system monitoring dashboard
- Advanced threat intelligence integration

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review console logs for error details
3. Ensure all dependencies are properly installed
4. Verify system permissions for monitoring features

**Linkedin** : [Hard Pansara](http://linkedin.com/in/hard-pansara-22582a288) 
---

**Note**: This application is designed for educational and monitoring purposes. Ensure you have appropriate permissions before monitoring systems in production environments.
