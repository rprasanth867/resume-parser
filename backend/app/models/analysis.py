from datetime import datetime
from app.extensions import db
import json

class AnalysisResult(db.Model):
    __tablename__ = 'analysis_results'
    
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False, unique=True)
    
    # Extracted Sections (stored as JSON)
    skills = db.Column(db.JSON)
    experience = db.Column(db.JSON)
    education = db.Column(db.JSON)
    certifications = db.Column(db.JSON)
    
    # Analysis Scores
    overall_score = db.Column(db.Numeric(5, 2))
    formatting_score = db.Column(db.Numeric(5, 2))
    content_score = db.Column(db.Numeric(5, 2))
    keyword_score = db.Column(db.Numeric(5, 2))
    
    # Feedback (stored as JSON arrays)
    strengths = db.Column(db.JSON)
    weaknesses = db.Column(db.JSON)
    suggestions = db.Column(db.JSON)
    missing_sections = db.Column(db.JSON)
    
    # Metadata
    analyzed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert analysis to dictionary"""
        return {
            'id': self.id,
            'resume_id': self.resume_id,
            'extracted_data': {
                'skills': self.skills or [],
                'experience': self.experience or [],
                'education': self.education or [],
                'certifications': self.certifications or []
            },
            'scores': {
                'overall': float(self.overall_score) if self.overall_score else 0,
                'formatting': float(self.formatting_score) if self.formatting_score else 0,
                'content': float(self.content_score) if self.content_score else 0,
                'keywords': float(self.keyword_score) if self.keyword_score else 0
            },
            'feedback': {
                'strengths': self.strengths or [],
                'weaknesses': self.weaknesses or [],
                'suggestions': self.suggestions or [],
                'missing_sections': self.missing_sections or []
            },
            'analyzed_at': self.analyzed_at.isoformat() if self.analyzed_at else None
        }
    
    def __repr__(self):
        return f'<AnalysisResult for Resume {self.resume_id}>'
