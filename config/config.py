import os

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', 5000))
    
    # QKD Simulation limits
    MAX_QUBITS = int(os.environ.get('MAX_QUBITS', 1000000))
    MIN_QUBITS = int(os.environ.get('MIN_QUBITS', 100))
    MAX_NOISE = float(os.environ.get('MAX_NOISE', 1.0))
    MAX_LEAK = int(os.environ.get('MAX_LEAK', 10000))

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SECRET_KEY = os.environ.get('SECRET_KEY')

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}