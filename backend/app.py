
from flask import Flask, jsonify, request
from flask_cors import CORS
import psutil
import json
import os
from datetime import datetime
from scan_utils import save_file, calculate_entropy, hash_file, scan_file_content

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store for anomaly detection
traffic_baseline = None
last_traffic_stats = None

# File scanning constants
UPLOAD_FOLDER = "uploads"
KEYWORDS = ["stratum+tcp", "xmr", "donate-level", "xmrig", "monero", "coinhive", "minergate", "cryptonight", "pool.minexmr.com", "bitcoin", "miner", "crypto"]

# Load blacklist for cryptojacking detection
def load_blacklist():
    """Load blacklist from JSON file"""
    try:
        with open('blacklist.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default blacklist if file doesn't exist
        return {
            "processes": ["xmrig", "minerd", "powershell", "cryptonight", "monero", "bitcoin", "miner", "crypto"],
            "domains": ["minexmr.com", "coinhive.com", "cryptonight.net", "pool.minexmr.com", "xmr.pool.minergate.com"],
            "ports": [3333, 4444, 8080, 14444, 45700]
        }

BLACKLIST = load_blacklist()

@app.route("/api/scan-file", methods=["POST"])
def scan_file():
    """Scan uploaded file for cryptojacking indicators"""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part in request"}), 400
        
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        print(f"Scanning file: {file.filename}")
        
        # Save file and get metadata
        path = save_file(file, UPLOAD_FOLDER)
        size = os.path.getsize(path)
        file_hash = hash_file(path)
        
        # Read binary data for entropy analysis
        with open(path, "rb") as f:
            binary_data = f.read()

        # Calculate entropy
        entropy = calculate_entropy(binary_data)
        
        # Scan for suspicious keywords
        keyword_hits = scan_file_content(path, KEYWORDS)
        
        # Check for suspicious filename patterns
        suspicious_names = ["xmrig", "miner", "crypto", "monero", "bitcoin", "coinhive"]
        filename_suspicious = any(name in file.filename.lower() for name in suspicious_names)
        
        # Determine if file is suspicious
        high_entropy = entropy > 7.5
        has_keywords = len(keyword_hits) > 0
        suspicious = high_entropy or has_keywords or filename_suspicious
        
        # Create detailed analysis
        analysis = []
        if high_entropy:
            analysis.append(f"High entropy ({entropy}) - possible packed/encrypted content")
        if has_keywords:
            analysis.append(f"Contains cryptomining keywords: {', '.join(keyword_hits)}")
        if filename_suspicious:
            analysis.append("Suspicious filename pattern detected")
        if not analysis:
            analysis.append("No obvious cryptojacking indicators found")

        result = {
            "filename": file.filename,
            "filesize_bytes": size,
            "filesize_human": f"{size / 1024:.2f} KB" if size < 1024*1024 else f"{size / (1024*1024):.2f} MB",
            "sha256": file_hash,
            "entropy": entropy,
            "keywords_matched": keyword_hits,
            "filename_suspicious": filename_suspicious,
            "verdict": "Suspicious" if suspicious else "Clean",
            "risk_level": "HIGH" if (high_entropy and has_keywords) else "MEDIUM" if suspicious else "LOW",
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }

        # Save scan result
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        report_path = f"{UPLOAD_FOLDER}/{file.filename}_report.json"
        with open(report_path, "w") as report_file:
            json.dump(result, report_file, indent=4)

        print(f"File scan completed: {result['verdict']}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error during file scan: {str(e)}")
        return jsonify({'error': f'File scan failed: {str(e)}'}), 500

def detect_suspicious_processes():
    """Detect suspicious processes using dynamic analysis"""
    flagged = []
    
    # Get current process list
    processes = list(psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent', 'memory_percent', 'create_time']))
    
    # Calculate average CPU usage to detect outliers
    cpu_values = [p.info['cpu_percent'] for p in processes if p.info['cpu_percent'] is not None and p.info['cpu_percent'] > 0]
    avg_cpu = sum(cpu_values) / len(cpu_values) if cpu_values else 0
    
    for proc in processes:
        try:
            name = proc.info['name'].lower() if proc.info['name'] else ""
            cmd = ' '.join(proc.info['cmdline']).lower() if proc.info['cmdline'] else ""
            cpu_percent = proc.info['cpu_percent'] or 0
            memory_percent = proc.info['memory_percent'] or 0
            
            # Dynamic detection criteria
            reasons = []
            
            # 1. Check against known mining process names
            mining_keywords = ["xmrig", "minerd", "miner", "crypto", "monero", "bitcoin", "coinhive", "cryptonight", "ethminer", "claymore"]
            if any(keyword in name or keyword in cmd for keyword in mining_keywords):
                reasons.append("Contains cryptocurrency mining keywords")
            
            # 2. High CPU usage (relative to system average and absolute threshold)
            if cpu_percent > 70 or (avg_cpu > 0 and cpu_percent > avg_cpu * 3):
                reasons.append(f"Abnormally high CPU usage ({cpu_percent:.1f}%)")
            
            # 3. Suspicious command line patterns
            suspicious_patterns = ["stratum+tcp", "pool.", "donate-level", "--cpu", "--threads", "--algo"]
            if any(pattern in cmd for pattern in suspicious_patterns):
                reasons.append("Command line contains mining-related parameters")
            
            # 4. High memory usage combined with high CPU
            if memory_percent > 50 and cpu_percent > 50:
                reasons.append(f"High resource consumption (CPU: {cpu_percent:.1f}%, Memory: {memory_percent:.1f}%)")
            
            # 5. Process running from suspicious locations
            suspicious_locations = ["temp", "tmp", "appdata\\local\\temp", "/tmp", "downloads"]
            if any(location in cmd for location in suspicious_locations) and cpu_percent > 20:
                reasons.append("Running from temporary directory with high CPU usage")
            
            if reasons:
                flagged.append({
                    "pid": proc.info['pid'],
                    "name": proc.info['name'],
                    "cmdline": cmd,
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory_percent,
                    "create_time": datetime.fromtimestamp(proc.info['create_time']).isoformat() if proc.info['create_time'] else None,
                    "reason": "; ".join(reasons)
                })
                
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    
    return flagged

def detect_suspicious_connections():
    """Detect suspicious network connections using dynamic analysis"""
    flagged = []
    
    # Get all network connections
    connections = psutil.net_connections(kind='inet')
    
    # Analyze connection patterns
    for conn in connections:
        try:
            if not conn.raddr:
                continue
                
            ip, port = conn.raddr
            local_addr = f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "N/A"
            remote_addr = f"{ip}:{port}"
            
            reasons = []
            
            # 1. Check for mining pool ports (common mining ports)
            mining_ports = [3333, 4444, 5555, 7777, 8080, 8333, 9999, 14444, 45700]
            if port in mining_ports:
                reasons.append(f"Connection to common mining port {port}")
            
            # 2. Check for known mining pool domains/IPs
            mining_domains = ["minexmr", "pool", "nanopool", "dwarfpool", "f2pool", "antpool", "slushpool", "coinhive", "minergate"]
            if any(domain in ip.lower() for domain in mining_domains):
                reasons.append("Connection to known mining pool domain")
            
            # 3. Detect unusual port ranges often used by miners
            if 30000 <= port <= 50000:
                reasons.append(f"Connection to unusual high port range ({port})")
            
            # 4. Check for encrypted/proxy connections that might hide mining traffic
            if port in [443, 8443, 9443] and any(keyword in str(conn.pid) for keyword in ["miner", "crypto"] if conn.pid):
                reasons.append("Encrypted connection from potentially suspicious process")
            
            # 5. Multiple connections to same IP (possible pool connection)
            same_ip_connections = [c for c in connections if c.raddr and c.raddr[0] == ip]
            if len(same_ip_connections) > 3:
                reasons.append(f"Multiple connections ({len(same_ip_connections)}) to same IP")
            
            if reasons:
                flagged.append({
                    "laddr": local_addr,
                    "raddr": remote_addr,
                    "status": conn.status,
                    "pid": conn.pid,
                    "reason": "; ".join(reasons)
                })
                
        except Exception:
            continue
    
    return flagged

@app.route("/api/cryptojacking-check")
def cryptojacking_check():
    """Check for cryptojacking activity using dynamic detection"""
    try:
        print("Starting comprehensive cryptojacking detection scan...")
        
        suspicious_processes = detect_suspicious_processes()
        suspicious_connections = detect_suspicious_connections()
        total_flags = len(suspicious_processes) + len(suspicious_connections)
        
        # Dynamic risk assessment
        high_risk_indicators = 0
        medium_risk_indicators = 0
        
        # Analyze process risk levels
        for proc in suspicious_processes:
            if any(keyword in proc['reason'].lower() for keyword in ['mining keywords', 'abnormally high cpu', 'mining-related parameters']):
                high_risk_indicators += 1
            else:
                medium_risk_indicators += 1
        
        # Analyze connection risk levels  
        for conn in suspicious_connections:
            if any(keyword in conn['reason'].lower() for keyword in ['mining port', 'mining pool', 'multiple connections']):
                high_risk_indicators += 1
            else:
                medium_risk_indicators += 1
        
        # Determine overall verdict
        if high_risk_indicators >= 2:
            verdict = "HIGH RISK: Strong indicators of cryptojacking activity detected!"
            risk_level = "HIGH"
        elif high_risk_indicators >= 1 or medium_risk_indicators >= 3:
            verdict = "MEDIUM RISK: Suspicious activity that may indicate cryptojacking"
            risk_level = "MEDIUM"
        elif total_flags > 0:
            verdict = "LOW RISK: Some unusual activity detected, monitor closely"
            risk_level = "LOW"
        else:
            verdict = "CLEAN: No obvious signs of cryptojacking detected"
            risk_level = "LOW"

        result = {
            "timestamp": datetime.now().isoformat(),
            "suspicious_processes": suspicious_processes,
            "suspicious_connections": suspicious_connections,
            "total_flags": total_flags,
            "verdict": verdict,
            "scan_summary": {
                "processes_flagged": len(suspicious_processes),
                "connections_flagged": len(suspicious_connections),
                "high_risk_indicators": high_risk_indicators,
                "medium_risk_indicators": medium_risk_indicators,
                "risk_level": risk_level
            },
            "detection_methods": [
                "Dynamic CPU usage analysis",
                "Process name and command line inspection", 
                "Network connection pattern analysis",
                "Resource consumption monitoring",
                "Behavioral anomaly detection"
            ]
        }

        # Save comprehensive report to file
        with open("cryptojacking_report.json", "w") as f:
            json.dump(result, f, indent=4)
        
        print(f"Cryptojacking scan completed. Risk Level: {risk_level}, Found {total_flags} suspicious items.")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error during cryptojacking scan: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ... keep existing code (all your original routes and functions for cpu-memory, processes, network-connections, traffic-stats, full-scan, save-scan)

@app.route('/api/cpu-memory')
def get_cpu_memory():
    """Get CPU and memory usage"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        return jsonify({
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'memory_used': memory.used,
            'memory_total': memory.total,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/processes')
def get_processes():
    """Get running processes with suspicious activity detection"""
    try:
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent', 'memory_percent', 'create_time']):
            try:
                info = proc.info
                # Simple suspicious activity detection
                suspicious = (
                    info['cpu_percent'] and info['cpu_percent'] > 80 or
                    info['memory_percent'] and info['memory_percent'] > 50 or
                    any(keyword in (info['name'] or '').lower() for keyword in ['miner', 'crypto', 'hack'])
                )
                
                processes.append({
                    'pid': info['pid'],
                    'name': info['name'] or 'Unknown',
                    'cmdline': ' '.join(info['cmdline']) if info['cmdline'] else '',
                    'cpu_percent': info['cpu_percent'] or 0,
                    'memory_percent': info['memory_percent'] or 0,
                    'create_time': datetime.fromtimestamp(info['create_time']).isoformat() if info['create_time'] else '',
                    'suspicious': suspicious
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        return jsonify(processes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/network-connections')
def get_network_connections():
    """Get network connections with suspicious port detection"""
    try:
        connections = []
        suspicious_ports = [1337, 4444, 5555, 6666, 7777, 8080, 9999]
        
        for conn in psutil.net_connections():
            if conn.status == 'ESTABLISHED':
                local_port = conn.laddr.port if conn.laddr else 0
                remote_port = conn.raddr.port if conn.raddr else 0
                
                suspicious = (
                    local_port in suspicious_ports or 
                    remote_port in suspicious_ports or
                    local_port > 60000 or remote_port > 60000
                )
                
                connections.append({
                    'pid': conn.pid or 0,
                    'laddr': f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "N/A",
                    'raddr': f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "N/A",
                    'status': conn.status,
                    'suspicious': suspicious
                })
        
        return jsonify(connections)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/traffic-stats')
def get_traffic_stats():
    """Get network traffic statistics with anomaly detection"""
    global traffic_baseline, last_traffic_stats
    
    try:
        # Get current network stats
        net_io = psutil.net_io_counters()
        current_stats = {
            'bytes_sent': net_io.bytes_sent,
            'bytes_recv': net_io.bytes_recv,
            'timestamp': datetime.now().isoformat()
        }
        
        # Calculate bytes per second if we have previous data
        sent_bytes_per_sec = 0
        recv_bytes_per_sec = 0
        
        if last_traffic_stats:
            time_diff = 1  # Assume 1 second for simplicity
            sent_bytes_per_sec = max(0, (current_stats['bytes_sent'] - last_traffic_stats['bytes_sent']) / time_diff)
            recv_bytes_per_sec = max(0, (current_stats['bytes_recv'] - last_traffic_stats['bytes_recv']) / time_diff)
        
        # Simple anomaly detection (threshold: 1MB/s)
        anomaly_threshold = 1000000  # 1MB/s
        anomaly = sent_bytes_per_sec > anomaly_threshold or recv_bytes_per_sec > anomaly_threshold
        
        last_traffic_stats = current_stats
        
        return jsonify({
            'sent_bytes_per_sec': sent_bytes_per_sec,
            'recv_bytes_per_sec': recv_bytes_per_sec,
            'total_sent': current_stats['bytes_sent'],
            'total_recv': current_stats['bytes_recv'],
            'anomaly': anomaly,
            'timestamp': current_stats['timestamp']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/full-scan')
def full_scan():
    """Perform a comprehensive system scan"""
    try:
        # Get all data
        cpu_data = get_cpu_memory().get_json()
        process_data = get_processes().get_json()
        network_data = get_network_connections().get_json()
        traffic_data = get_traffic_stats().get_json()
        
        scan_result = {
            'scan_time': datetime.now().isoformat(),
            'cpu_memory': cpu_data,
            'processes': process_data,
            'network': network_data,
            'traffic': traffic_data,
            'summary': {
                'total_processes': len(process_data) if isinstance(process_data, list) else 0,
                'suspicious_processes': len([p for p in process_data if p.get('suspicious', False)]) if isinstance(process_data, list) else 0,
                'active_connections': len(network_data) if isinstance(network_data, list) else 0,
                'suspicious_connections': len([c for c in network_data if c.get('suspicious', False)]) if isinstance(network_data, list) else 0,
                'traffic_anomaly': traffic_data.get('anomaly', False) if isinstance(traffic_data, dict) else False
            }
        }
        
        return jsonify({
            'status': 'completed',
            'message': 'Full system scan completed successfully',
            'results': scan_result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-scan')
def save_scan():
    """Save current system state to JSON file"""
    try:
        # Get current scan data
        scan_data = full_scan().get_json()
        
        # Save to file
        filename = 'last_scan.json'
        with open(filename, 'w') as f:
            json.dump(scan_data, f, indent=2)
        
        return jsonify({
            'status': 'saved',
            'message': f'System state saved to {filename}',
            'filename': filename,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting System Monitor Flask Backend...")
    print("Available endpoints:")
    print("- http://localhost:5000/api/cpu-memory")
    print("- http://localhost:5000/api/processes")
    print("- http://localhost:5000/api/network-connections")
    print("- http://localhost:5000/api/traffic-stats")
    print("- http://localhost:5000/api/full-scan")
    print("- http://localhost:5000/api/save-scan")
    print("- http://localhost:5000/api/cryptojacking-check")
    print("- http://localhost:5000/api/scan-file")
    app.run(debug=True, host='0.0.0.0', port=5000)
