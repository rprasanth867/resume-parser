from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

class ATSScorer:
    """Service for ATS (Applicant Tracking System) scoring based on Job Description"""
    
    def calculate_match_score(self, resume_data, job_description):
        """
        Calculate overall match score between resume and job description
        
        Args:
            resume_data: Dict containing parsed resume data
            job_description: JobDescription model instance
        
        Returns:
            Dict containing match scores and analysis
        """
        # Extract data
        resume_skills = set([s.lower() for s in resume_data.get('skills', [])])
        resume_text = resume_data.get('parsed_text', '')
        
        jd_required_skills = set([s.lower() for s in (job_description.required_skills or [])])
        jd_preferred_skills = set([s.lower() for s in (job_description.preferred_skills or [])])
        jd_text = job_description.description
        
        # Calculate individual scores
        skills_score = self._calculate_skills_match(
            resume_skills, jd_required_skills, jd_preferred_skills
        )
        
        experience_score = self._calculate_experience_match(
            resume_data.get('experience', []),
            job_description.experience_required
        )
        
        education_score = self._calculate_education_match(
            resume_data.get('education', []),
            job_description.education_required
        )
        
        # Text similarity score
        text_similarity = self._calculate_text_similarity(resume_text, jd_text)
        
        # Calculate overall match score (weighted average)
        overall_score = (
            skills_score * 0.40 +
            experience_score * 0.25 +
            education_score * 0.15 +
            text_similarity * 0.20
        )
        
        # Identify matched and missing skills
        matched_skills = list(resume_skills & jd_required_skills)
        missing_required_skills = list(jd_required_skills - resume_skills)
        matched_preferred_skills = list(resume_skills & jd_preferred_skills)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            skills_score, experience_score, education_score,
            missing_required_skills, jd_preferred_skills - resume_skills
        )
        
        return {
            'overall_score': round(overall_score, 2),
            'skills_match_score': round(skills_score, 2),
            'experience_match_score': round(experience_score, 2),
            'education_match_score': round(education_score, 2),
            'matched_skills': matched_skills,
            'missing_skills': missing_required_skills,
            'matched_preferred_skills': matched_preferred_skills,
            'recommendations': recommendations
        }
    
    def _calculate_skills_match(self, resume_skills, required_skills, preferred_skills):
        """Calculate skills match score"""
        if not required_skills:
            return 85.0  # Default score if no requirements
        
        # Required skills match
        matched_required = resume_skills & required_skills
        required_match_ratio = len(matched_required) / len(required_skills) if required_skills else 0
        
        # Preferred skills match (bonus)
        matched_preferred = resume_skills & preferred_skills
        preferred_match_ratio = len(matched_preferred) / len(preferred_skills) if preferred_skills else 0
        
        # Calculate score (required skills are weighted more heavily)
        score = (required_match_ratio * 80) + (preferred_match_ratio * 20)
        
        return min(score, 100.0)
    
    def _calculate_experience_match(self, resume_experience, required_experience):
        """Calculate experience match score"""
        if not required_experience:
            return 85.0  # Default score if no requirements
        
        # Extract years from requirement (e.g., "3-5 years", "5+ years")
        years_pattern = r'(\d+)'
        match = re.search(years_pattern, required_experience)
        
        if not match:
            return 75.0  # Can't determine, give average score
        
        required_years = int(match.group(1))
        
        # Estimate years from resume experience count (heuristic)
        # Assume each experience entry is ~2 years
        estimated_years = len(resume_experience) * 2
        
        if estimated_years >= required_years:
            return 100.0
        elif estimated_years >= required_years * 0.7:
            return 80.0
        elif estimated_years >= required_years * 0.5:
            return 60.0
        else:
            return 40.0
    
    def _calculate_education_match(self, resume_education, required_education):
        """Calculate education match score"""
        if not required_education:
            return 85.0  # Default score if no requirements
        
        if not resume_education:
            return 40.0  # No education listed
        
        required_lower = required_education.lower()
        
        # Check for degree level match
        degree_hierarchy = {
            'phd': 5, 'doctorate': 5,
            'master': 4, 'mba': 4,
            'bachelor': 3, 'bs': 3, 'ba': 3,
            'associate': 2,
            'diploma': 1
        }
        
        # Find highest degree in resume
        resume_degree_level = 0
        for edu in resume_education:
            edu_text = edu.get('description', '').lower()
            for degree, level in degree_hierarchy.items():
                if degree in edu_text:
                    resume_degree_level = max(resume_degree_level, level)
        
        # Find required degree level
        required_degree_level = 0
        for degree, level in degree_hierarchy.items():
            if degree in required_lower:
                required_degree_level = max(required_degree_level, level)
        
        # Calculate score based on match
        if resume_degree_level >= required_degree_level:
            return 100.0
        elif resume_degree_level >= required_degree_level - 1:
            return 75.0
        else:
            return 50.0
    
    def _calculate_text_similarity(self, resume_text, jd_text):
        """Calculate text similarity using TF-IDF and cosine similarity"""
        if not resume_text or not jd_text:
            return 50.0
        
        try:
            # Create TF-IDF vectors
            vectorizer = TfidfVectorizer(stop_words='english', max_features=100)
            vectors = vectorizer.fit_transform([resume_text, jd_text])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
            
            # Convert to percentage
            return similarity * 100
        except:
            return 50.0  # Default if calculation fails
    
    def _generate_recommendations(self, skills_score, exp_score, edu_score, 
                                   missing_skills, missing_preferred_skills):
        """Generate recommendations based on scores"""
        recommendations = []
        
        # Skills recommendations
        if skills_score < 70:
            if missing_skills:
                recommendations.append(
                    f"Add these required skills to your resume: {', '.join(missing_skills[:5])}"
                )
            recommendations.append(
                "Highlight relevant skills more prominently in your resume"
            )
        
        # Experience recommendations
        if exp_score < 70:
            recommendations.append(
                "Provide more detailed descriptions of your work experience"
            )
            recommendations.append(
                "Quantify your achievements with specific metrics and results"
            )
        
        # Education recommendations
        if edu_score < 70:
            recommendations.append(
                "Ensure your education section clearly lists your degrees and institutions"
            )
        
        # Preferred skills bonus
        if missing_preferred_skills:
            pref_skills_list = list(missing_preferred_skills)[:3]
            recommendations.append(
                f"Consider adding these preferred skills if applicable: {', '.join(pref_skills_list)}"
            )
        
        # General recommendations
        if skills_score >= 70 and exp_score >= 70:
            recommendations.append(
                "Your resume is a strong match! Consider tailoring your summary to this specific role"
            )
        
        return recommendations
