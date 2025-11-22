from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.resume_match import ResumeMatch
from app.services.ats_scorer import ATSScorer
from app.extensions import db

job_descriptions_bp = Blueprint('job_descriptions', __name__)
ats_scorer = ATSScorer()

@job_descriptions_bp.route('', methods=['POST'])
@jwt_required()
def create_job_description():
    """Create a new job description"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('description'):
            return jsonify({'error': 'Title and description are required'}), 400
        
        # Create job description
        jd = JobDescription(
            user_id=current_user_id,
            title=data['title'],
            description=data['description'],
            required_skills=data.get('required_skills', []),
            preferred_skills=data.get('preferred_skills', []),
            experience_required=data.get('experience_required'),
            education_required=data.get('education_required')
        )
        
        db.session.add(jd)
        db.session.commit()
        
        return jsonify({
            'message': 'Job description created successfully',
            'job_description': jd.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to create job description: {str(e)}'}), 500

@job_descriptions_bp.route('', methods=['GET'])
@jwt_required()
def get_job_descriptions():
    """Get all job descriptions for current user"""
    try:
        current_user_id = int(get_jwt_identity())
        
        jds = JobDescription.query.filter_by(user_id=current_user_id)\
            .order_by(JobDescription.created_at.desc())\
            .all()
        
        return jsonify({
            'job_descriptions': [jd.to_dict() for jd in jds]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get job descriptions: {str(e)}'}), 500

@job_descriptions_bp.route('/<int:jd_id>', methods=['GET'])
@jwt_required()
def get_job_description(jd_id):
    """Get a specific job description"""
    try:
        current_user_id = int(get_jwt_identity())
        
        jd = JobDescription.query.get(jd_id)
        
        if not jd:
            return jsonify({'error': 'Job description not found'}), 404
        
        if jd.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify(jd.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get job description: {str(e)}'}), 500

@job_descriptions_bp.route('/<int:jd_id>/match/<int:resume_id>', methods=['POST'])
@jwt_required()
def match_resume_to_jd(jd_id, resume_id):
    """Match a resume against a job description"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Get job description
        jd = JobDescription.query.get(jd_id)
        if not jd or jd.user_id != current_user_id:
            return jsonify({'error': 'Job description not found'}), 404
        
        # Get resume
        resume = Resume.query.get(resume_id)
        if not resume or resume.user_id != current_user_id:
            return jsonify({'error': 'Resume not found'}), 404
        
        if resume.status != 'completed':
            return jsonify({'error': 'Resume analysis not completed yet'}), 400
        
        # Prepare resume data
        resume_data = {
            'skills': resume.analysis.skills if resume.analysis else [],
            'experience': resume.analysis.experience if resume.analysis else [],
            'education': resume.analysis.education if resume.analysis else [],
            'parsed_text': resume.parsed_text or ''
        }
        
        # Calculate match score
        match_result = ats_scorer.calculate_match_score(resume_data, jd)
        
        # Create or update match record
        match = ResumeMatch.query.filter_by(
            resume_id=resume_id,
            job_description_id=jd_id
        ).first()
        
        if not match:
            match = ResumeMatch(
                resume_id=resume_id,
                job_description_id=jd_id
            )
            db.session.add(match)
        
        # Update match data
        match.match_score = match_result['overall_score']
        match.skills_match_score = match_result['skills_match_score']
        match.experience_match_score = match_result['experience_match_score']
        match.education_match_score = match_result['education_match_score']
        match.matched_skills = match_result['matched_skills']
        match.missing_skills = match_result['missing_skills']
        match.recommendations = match_result['recommendations']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Resume matched successfully',
            'match': match.to_dict(),
            'job_description': jd.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to match resume: {str(e)}'}), 500

@job_descriptions_bp.route('/<int:jd_id>', methods=['DELETE'])
@jwt_required()
def delete_job_description(jd_id):
    """Delete a job description"""
    try:
        current_user_id = int(get_jwt_identity())
        
        jd = JobDescription.query.get(jd_id)
        
        if not jd:
            return jsonify({'error': 'Job description not found'}), 404
        
        if jd.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(jd)
        db.session.commit()
        
        return jsonify({
            'message': 'Job description deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete job description: {str(e)}'}), 500

@job_descriptions_bp.route('/matches', methods=['GET'])
@jwt_required()
def get_all_matches():
    """Get all resume matches for current user"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Get all matches for user's resumes
        matches = db.session.query(ResumeMatch)\
            .join(Resume)\
            .filter(Resume.user_id == current_user_id)\
            .order_by(ResumeMatch.created_at.desc())\
            .all()
        
        results = []
        for match in matches:
            match_dict = match.to_dict()
            match_dict['resume'] = match.resume.to_dict()
            match_dict['job_description'] = match.job_description.to_dict()
            results.append(match_dict)
        
        return jsonify({
            'matches': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get matches: {str(e)}'}), 500
