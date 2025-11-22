from datetime import datetime
from app.extensions import db

class Resume(db.Model):
    __tablename__ = 'resumes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    file_type = db.Column(db.String(50))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='pending')  # pending, processing, completed, failed
    
    # Extracted Information
    parsed_text = db.Column(db.Text)
    candidate_name = db.Column(db.String(255))
    candidate_email = db.Column(db.String(255))
    candidate_phone = db.Column(db.String(50))
    
    # Relationships
    analysis = db.relationship('AnalysisResult', backref='resume', uselist=False, cascade='all, delete-orphan')
    matches = db.relationship('ResumeMatch', backref='resume', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_analysis=False):
        """Convert resume to dictionary"""
        data = {
            'id': self.id,
            'filename': self.filename,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'status': self.status,
            'candidate_name': self.candidate_name,
            'candidate_email': self.candidate_email,
            'candidate_phone': self.candidate_phone
        }
        
        if include_analysis and self.analysis:
            data['analysis'] = self.analysis.to_dict()
        
        return data
    
    def __repr__(self):
        return f'<Resume {self.filename}>'
