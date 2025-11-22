import os
from flask import Flask
from app.config import config
from app.extensions import db, jwt, migrate, cors

def create_app(config_name=None):
    """Application factory pattern"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    
    # Create upload folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.resumes import resumes_bp
    from app.routes.users import users_bp
    from app.routes.job_descriptions import job_descriptions_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(resumes_bp, url_prefix='/api/v1/resumes')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(job_descriptions_bp, url_prefix='/api/v1/job-descriptions')
    
    # Register error handlers
    from app.middleware.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    return app
