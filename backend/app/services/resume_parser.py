from app.services.text_extractor import TextExtractor
from app.services.nlp_analyzer import NLPAnalyzer
from app.services.feedback_generator import FeedbackGenerator
from app.models.resume import Resume
from app.models.analysis import AnalysisResult
from app.extensions import db

class ResumeParser:
    """Main service for parsing resumes and generating analysis"""
    
    def __init__(self):
        self.text_extractor = TextExtractor()
        self.nlp_analyzer = NLPAnalyzer()
        self.feedback_generator = FeedbackGenerator()
    
    def parse_resume(self, resume_id):
        """
        Parse resume and create analysis
        
        Args:
            resume_id: ID of the resume to parse
        
        Returns:
            AnalysisResult instance
        """
        # Get resume
        resume = Resume.query.get(resume_id)
        if not resume:
            raise ValueError('Resume not found')
        
        try:
            # Update status
            resume.status = 'processing'
            db.session.commit()
            
            # Extract text
            parsed_text = self.text_extractor.extract_text(
                resume.file_path,
                resume.file_type
            )
            
            # Extract contact info
            contact_info = self.text_extractor.extract_contact_info(parsed_text)
            
            # Update resume with extracted info
            resume.parsed_text = parsed_text
            resume.candidate_name = contact_info.get('name')
            resume.candidate_email = contact_info.get('email')
            resume.candidate_phone = contact_info.get('phone')
            
            # Analyze with NLP
            analysis_data = self.nlp_analyzer.analyze_resume(parsed_text)
            
            # Prepare resume data for feedback
            resume_data = {
                'skills': analysis_data['skills'],
                'experience': analysis_data['experience'],
                'education': analysis_data['education'],
                'certifications': analysis_data['certifications'],
                'parsed_text': parsed_text
            }
            
            # Calculate scores
            scores = self.feedback_generator.calculate_scores(resume_data, parsed_text)
            
            # Generate feedback
            feedback = self.feedback_generator.generate_feedback(resume_data, scores)
            
            # Create or update analysis result
            analysis = AnalysisResult.query.filter_by(resume_id=resume_id).first()
            if not analysis:
                analysis = AnalysisResult(resume_id=resume_id)
                db.session.add(analysis)
            
            # Update analysis
            analysis.skills = analysis_data['skills']
            analysis.experience = analysis_data['experience']
            analysis.education = analysis_data['education']
            analysis.certifications = analysis_data['certifications']
            
            analysis.overall_score = scores['overall']
            analysis.formatting_score = scores['formatting']
            analysis.content_score = scores['content']
            analysis.keyword_score = scores['keywords']
            
            analysis.strengths = feedback['strengths']
            analysis.weaknesses = feedback['weaknesses']
            analysis.suggestions = feedback['suggestions']
            analysis.missing_sections = feedback['missing_sections']
            
            # Update resume status
            resume.status = 'completed'
            
            db.session.commit()
            
            return analysis
            
        except Exception as e:
            resume.status = 'failed'
            db.session.commit()
            raise Exception(f'Failed to parse resume: {str(e)}')
