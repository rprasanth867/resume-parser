from datetime import datetime
from app.extensions import db

class JobDescription(db.Model):
    __tablename__ = 'job_descriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.JSON)
    preferred_skills = db.Column(db.JSON)
    experience_required = db.Column(db.String(100))
    education_required = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    matches = db.relationship('ResumeMatch', backref='job_description', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert job description to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'required_skills': self.required_skills or [],
            'preferred_skills': self.preferred_skills or [],
            'experience_required': self.experience_required,
            'education_required': self.education_required,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<JobDescription {self.title}>'
