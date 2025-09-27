# app.py - Flask Backend Server (unchanged, but included for completeness)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import logging
from datetime import datetime
from bb84_core import run_bb84_qkd
import re
import numpy as np
import traceback

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for frontend communication

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Leak patterns for parsing (same as GUI)
LEAK_PATTERNS = {
    "total": r"(?i)\btotal\W*leak\b\s*:\s*(\d+)",
    "cascade": r"(?i)\bcascade\W*leak\b\s*:\s*(\d+)",
    "qber": r"(?i)\bqber\W*leak\b\s*:\s*(\d+)",
    "pa": r"(?i)\bpa\W*leak\b\s*:\s*(\d+)",
    "extra": r"(?i)\bextra\W*leak\b\s*:\s*(\d+)",
}

def parse_leaks_from_log(log_text: str):
    """Parse leak values from log text (same as GUI)"""
    def find_num(pat):
        m = re.search(pat, log_text)
        return int(m.group(1)) if m else 0
    
    total_leak = find_num(LEAK_PATTERNS["total"])
    cascade_leak = find_num(LEAK_PATTERNS["cascade"])
    qber_leak = find_num(LEAK_PATTERNS["qber"])
    pa_leak = find_num(LEAK_PATTERNS["pa"])
    extra_leak = find_num(LEAK_PATTERNS.get("extra", r"$^"))
    
    return total_leak, cascade_leak, qber_leak, pa_leak, extra_leak

@app.route('/')
def index():
    """Serve the main HTML file"""
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

@app.route('/api/run_qkd', methods=['POST'])
def api_run_qkd():
    """API endpoint to run QKD simulation"""
    try:
        # Get parameters from request
        data = request.get_json()
        
        # Validate required parameters
        required_params = ['n_bits', 'noise_prob', 'eve', 'cascade_leak', 'qber_leak', 'security_margin']
        for param in required_params:
            if param not in data:
                return jsonify({'error': f'Missing parameter: {param}'}), 400
        
        # Extract and validate parameters
        try:
            n_bits = data['n_bits']
            if isinstance(n_bits, np.ndarray):
                if n_bits.size != 1:
                    raise ValueError("n_bits must be a single integer, not a multi-element array")
                n_bits = n_bits.item()
            n_bits = int(n_bits)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid n_bits: must be an integer, got {data['n_bits']} ({type(data['n_bits'])})")

        try:
            noise_prob = data['noise_prob']
            if isinstance(noise_prob, np.ndarray):
                if noise_prob.size != 1:
                    raise ValueError("noise_prob must be a single number, not a multi-element array")
                noise_prob = noise_prob.item()
            elif isinstance(noise_prob, np.floating):
                noise_prob = float(noise_prob)
            noise_prob = float(noise_prob)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid noise_prob: must be a float, got {data['noise_prob']} ({type(data['noise_prob'])})")

        try:
            eve = data['eve']
            if isinstance(eve, np.ndarray):
                if eve.size != 1:
                    raise ValueError("eve must be a single boolean, not a multi-element array")
                eve = eve.item()
            eve = bool(eve)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid eve: must be a boolean, got {data['eve']} ({type(data['eve'])})")

        try:
            cascade_leak = data['cascade_leak']
            if isinstance(cascade_leak, np.ndarray):
                if cascade_leak.size != 1:
                    raise ValueError("cascade_leak must be a single integer, not a multi-element array")
                cascade_leak = cascade_leak.item()
            cascade_leak = int(cascade_leak)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid cascade_leak: must be an integer, got {data['cascade_leak']} ({type(data['cascade_leak'])})")

        try:
            qber_leak = data['qber_leak']
            if isinstance(qber_leak, np.ndarray):
                if qber_leak.size != 1:
                    raise ValueError("qber_leak must be a single number, not a multi-element array")
                qber_leak = qber_leak.item()
            elif isinstance(qber_leak, np.floating):
                qber_leak = float(qber_leak)
            qber_leak = float(qber_leak)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid qber_leak: must be a float, got {data['qber_leak']} ({type(data['qber_leak'])})")

        try:
            security_margin = data['security_margin']
            if isinstance(security_margin, np.ndarray):
                if security_margin.size != 1:
                    raise ValueError("security_margin must be a single integer, not a multi-element array")
                security_margin = security_margin.item()
            security_margin = int(security_margin)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid security_margin: must be an integer, got {data['security_margin']} ({type(data['security_margin'])})")

        try:
            qber_threshold = data.get('qber_threshold', 0.5)
            if isinstance(qber_threshold, np.ndarray):
                if qber_threshold.size != 1:
                    raise ValueError("qber_threshold must be a single number, not a multi-element array")
                qber_threshold = qber_threshold.item()
            elif isinstance(qber_threshold, np.floating):
                qber_threshold = float(qber_threshold)
            qber_threshold = float(qber_threshold)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid qber_threshold: must be a float, got {data.get('qber_threshold')} ({type(data.get('qber_threshold'))})")

        # Validate parameter ranges
        if n_bits < 100 or n_bits > 1000000:
            raise ValueError('Number of qubits must be between 100 and 1,000,000')
        
        if noise_prob < 0 or noise_prob > 1:
            raise ValueError('Noise probability must be between 0 and 1')
        
        if cascade_leak < 0 or qber_leak < 0 or security_margin < 0:
            raise ValueError('Leak values and security margin must be non-negative')
        
        logger.info(f"Running QKD simulation: n_bits={n_bits}, noise={noise_prob}, eve={eve}")
        
        # Call the BB84 core function
        try:
            log, qber, final_key, alice_sift, bob_sift = run_bb84_qkd(
                n_bits=n_bits,
                noise_prob=noise_prob,
                eve=eve,
                cascade_leak=cascade_leak,
                qber_leak=qber_leak,
                security_margin=security_margin,
                qber_threshold=qber_threshold
            )
        except ValueError as e:
            logger.error(f"QKD simulation error: {str(e)}\n{traceback.format_exc()}")
            if "truth value of an array" in str(e).lower():
                return jsonify({'error': f'Simulation failed due to NumPy array ambiguity in bb84_core: {str(e)}.'}), 500
            raise
        
        # Calculate key length and convert to hex
        keylen = len(final_key) if final_key is not None and final_key.size > 0 else 0
        hex_key = "N/A (Zero-length key)"
        binary_key = "N/A (Zero-length key)"
        
        if keylen > 0:
            # Convert final key to hex
            byte_length = (keylen + 7) // 8
            hex_key_raw = ''.join(str(bit) for bit in final_key)
            hex_key_int = int(hex_key_raw, 2) if hex_key_raw else 0
            hex_key_raw = hex(hex_key_int)[2:].upper().zfill(byte_length * 2)[:byte_length * 2]
            hex_key = " ".join(hex_key_raw[i:i+2] for i in range(0, len(hex_key_raw), 2))
            # Extract first 20 bits for binary key
            binary_key = ''.join(str(bit) for bit in final_key[:20]) if keylen >= 20 else ''.join(str(bit) for bit in final_key)
        
        # Parse leak information from log
        total_leak, cascade_leak_actual, qber_leak_bits, pa_leak_bits, extra_leak_bits = parse_leaks_from_log(log)
        
        # Add bit matches for bit agreement (from Alice and Bob sifted keys)
        bit_matches = []
        if alice_sift is not None and bob_sift is not None and len(alice_sift) > 0:
            sample_size = min(300, len(alice_sift))
            alice_sample = alice_sift[:sample_size]
            bob_sample = bob_sift[:sample_size]
            bit_matches = (alice_sample == bob_sample).astype(int).tolist()
        
        # Prepare response
        response_data = {
            'log': str(log),
            'qber': float(qber),
            'key_length': keylen,
            'total_leak': total_leak,
            'cascade_leak': cascade_leak_actual,
            'qber_leak': qber_leak_bits,
            'pa_leak': pa_leak_bits,
            'hex_key': hex_key,
            'binary_key': binary_key,
            'bit_matches': bit_matches,
            'alice_sift_length': len(alice_sift) if alice_sift is not None and alice_sift.size > 0 else 0,
            'bob_sift_length': len(bob_sift) if bob_sift is not None and bob_sift.size > 0 else 0,
            'success': True
        }
        
        logger.info(f"QKD simulation completed: QBER={qber:.3f}, Key Length={keylen}")
        
        return jsonify(response_data)
        
    except ValueError as e:
        logger.error(f"Input validation error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
        
    except Exception as e:
        logger.error(f"Unexpected error in QKD simulation: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': f'Simulation failed: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/export_data', methods=['POST'])
def export_data():
    """Export simulation data"""
    try:
        data = request.get_json()
        
        # Process export request
        export_format = data.get('format', 'csv')
        run_history = data.get('run_history', [])
        
        if not run_history:
            return jsonify({'error': 'No data to export'}), 400
        
        if export_format == 'csv':
            # Generate CSV content
            headers = ['Timestamp', 'Qubits', 'Noise (%)', 'Eve Enabled', 'QBER (%)', 'Key Length', 'Total Leak', 'Hex Key', 'Binary Key (First 20 Bits)']
            csv_lines = [','.join(headers)]
            
            for entry in run_history:
                row = [
                    entry.get('timestamp', ''),
                    str(entry.get('qubits', 0)),
                    f"{entry.get('noise_percent', 0):.2f}",
                    'Yes' if entry.get('eve_enabled', False) else 'No',
                    f"{entry.get('qber_percent', 0):.3f}",
                    str(entry.get('key_length', 0)),
                    str(entry.get('total_leak', 0)),
                    f'"{entry.get("hex_key", "")}"',
                    f'"{entry.get("binary_key", "")}"'
                ]
                csv_lines.append(','.join(row))
            
            csv_content = '\n'.join(csv_lines)
            
            return jsonify({
                'content': csv_content,
                'filename': f'qkd_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv',
                'content_type': 'text/csv'
            })
        
        else:
            return jsonify({'error': f'Unsupported export format: {export_format}'}), 400
            
    except Exception as e:
        logger.error(f"Export error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': f'Export failed: {str(e)}'}), 500

if __name__ == '__main__':
    # Create static directory if it doesn't exist
    os.makedirs('static', exist_ok=True)
    
    # Run the Flask development server
    app.run(host='0.0.0.0', port=5000, debug=True)