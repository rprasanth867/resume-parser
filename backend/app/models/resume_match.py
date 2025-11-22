from datetime import datetime
from app.extensions import db

class ResumeMatch(db.Model):
    __tablename__ = 'resume_matches'
    
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    job_description_id = db.Column(db.Integer, db.ForeignKey('job_descriptions.id', ondelete='CASCADE'), nullable=False)
    
    # ATS Scoring
    match_score = db.Column(db.Numeric(5, 2))
    skills_match_score = db.Column(db.Numeric(5, 2))
    experience_match_score = db.Column(db.Numeric(5, 2))
    education_match_score = db.Column(db.Numeric(5, 2))
    
    # Matched Data
    matched_skills = db.Column(db.JSON)
    missing_skills = db.Column(db.JSON)
    recommendations = db.Column(db.JSON)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert match to dictionary"""
        return {
            'id': self.id,
            'resume_id': self.resume_id,
            'job_description_id': self.job_description_id,
            'scores': {
                'overall_match': float(self.match_score) if self.match_score else 0,
                'skills_match': float(self.skills_match_score) if self.skills_match_score else 0,
                'experience_match': float(self.experience_match_score) if self.experience_match_score else 0,
                'education_match': float(self.education_match_score) if self.education_match_score else 0
            },
            'matched_skills': self.matched_skills or [],
            'missing_skills': self.missing_skills or [],
            'recommendations': self.recommendations or [],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<ResumeMatch Resume:{self.resume_id} JD:{self.job_description_id}>'
