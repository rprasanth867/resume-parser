from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models.resume import Resume
from app.models.user import User
from app.services.resume_parser import ResumeParser
from app.extensions import db
import os

resumes_bp = Blueprint('resumes', __name__)
resume_parser = ResumeParser()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@resumes_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    """Upload multiple resume files"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Check if files are present
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        
        if not files or files[0].filename == '':
            return jsonify({'error': 'No files selected'}), 400
            
        uploaded_resumes = []
        errors = []
        
        import uuid
        
        for file in files:
            try:
                if not file or file.filename == '':
                    continue
                    
                if not allowed_file(file.filename):
                    errors.append({'filename': file.filename, 'error': 'File type not allowed'})
                    continue
                
                # Secure filename
                filename = secure_filename(file.filename)
                file_ext = filename.rsplit('.', 1)[1].lower()
                
                # Create unique filename
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                
                # Save file
                file.save(file_path)
                file_size = os.path.getsize(file_path)
                
                # Create resume record
                resume = Resume(
                    user_id=current_user_id,
                    filename=filename,
                    file_path=file_path,
                    file_size=file_size,
                    file_type=file_ext,
                    status='pending'
                )
                
                db.session.add(resume)
                db.session.commit()
                
                uploaded_resumes.append({
                    'id': resume.id,
                    'filename': resume.filename,
                    'status': resume.status
                })
                
                # Parse resume asynchronously
                try:
                    resume_parser.parse_resume(resume.id)
                except Exception as e:
                    print(f"Error parsing resume {resume.id}: {str(e)}")
                    
            except Exception as e:
                errors.append({'filename': file.filename, 'error': str(e)})
                continue
        
        if not uploaded_resumes and errors:
            return jsonify({'error': 'Failed to upload files', 'details': errors}), 400
            
        return jsonify({
            'message': f'Successfully uploaded {len(uploaded_resumes)} resumes',
            'resumes': uploaded_resumes,
            'errors': errors
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@resumes_bp.route('/<int:resume_id>/analysis', methods=['GET'])
@jwt_required()
def get_resume_analysis(resume_id):
    """Get resume analysis"""
    try:
        current_user_id = int(get_jwt_identity())
        
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        if resume.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        if resume.status != 'completed':
            return jsonify({
                'message': f'Resume is {resume.status}',
                'status': resume.status
            }), 200
        
        # Get analysis
        analysis = resume.analysis
        
        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404
        
        return jsonify({
            'resume': resume.to_dict(),
            'analysis': analysis.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get analysis: {str(e)}'}), 500

@resumes_bp.route('', methods=['GET'])
@jwt_required()
def get_user_resumes():
    """Get all resumes for current user"""
    try:
        current_user_id = int(get_jwt_identity())
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Query resumes
        pagination = Resume.query.filter_by(user_id=current_user_id)\
            .order_by(Resume.uploaded_at.desc())\
            .paginate(page=page, per_page=limit, error_out=False)
        
        resumes = []
        for resume in pagination.items:
            resume_dict = resume.to_dict()
            if resume.analysis:
                resume_dict['overall_score'] = float(resume.analysis.overall_score) if resume.analysis.overall_score else None
            resumes.append(resume_dict)
        
        return jsonify({
            'resumes': resumes,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get resumes: {str(e)}'}), 500

@resumes_bp.route('/<int:resume_id>', methods=['DELETE'])
@jwt_required()
def delete_resume(resume_id):
    """Delete a resume"""
    try:
        current_user_id = int(get_jwt_identity())
        
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        if resume.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete file
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
        
        # Delete from database
        db.session.delete(resume)
        db.session.commit()
        
        return jsonify({
            'message': 'Resume deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete resume: {str(e)}'}), 500
