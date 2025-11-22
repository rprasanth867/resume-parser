import re

class FeedbackGenerator:
    """Service for generating resume feedback and suggestions"""
    
    def generate_feedback(self, resume_data, scores):
        """
        Generate comprehensive feedback for resume
        
        Args:
            resume_data: Dict containing parsed resume data
            scores: Dict containing various scores
        
        Returns:
            Dict with strengths, weaknesses, suggestions, and missing sections
        """
        strengths = []
        weaknesses = []
        suggestions = []
        missing_sections = []
        
        # Analyze content
        has_skills = bool(resume_data.get('skills'))
        has_experience = bool(resume_data.get('experience'))
        has_education = bool(resume_data.get('education'))
        has_certifications = bool(resume_data.get('certifications'))
        
        parsed_text = resume_data.get('parsed_text', '')
        
        # Check for missing sections
        if not has_skills:
            missing_sections.append('Skills section')
        if not has_experience:
            missing_sections.append('Work experience section')
        if not has_education:
            missing_sections.append('Education section')
        
        # Analyze strengths
        if has_skills and len(resume_data.get('skills', [])) >= 5:
            strengths.append('Comprehensive skills section with diverse technical abilities')
        
        if has_experience and len(resume_data.get('experience', [])) >= 2:
            strengths.append('Strong work history with multiple relevant positions')
        
        if has_education:
            strengths.append('Clear educational background')
        
        if has_certifications:
            strengths.append('Professional certifications demonstrate continued learning')
        
        # Check for quantifiable achievements
        if self._has_quantifiable_achievements(parsed_text):
            strengths.append('Includes quantifiable achievements and metrics')
        
        # Check for action verbs
        if self._has_strong_action_verbs(parsed_text):
            strengths.append('Uses strong action verbs to describe accomplishments')
        
        # Analyze weaknesses
        if not has_skills or len(resume_data.get('skills', [])) < 5:
            weaknesses.append('Limited or missing skills section')
        
        if not has_experience:
            weaknesses.append('No work experience listed')
        elif len(resume_data.get('experience', [])) < 2:
            weaknesses.append('Limited work experience details')
        
        if not self._has_quantifiable_achievements(parsed_text):
            weaknesses.append('Lacks quantifiable achievements and metrics')
        
        if len(parsed_text) < 500:
            weaknesses.append('Resume content is too brief')
        elif len(parsed_text) > 5000:
            weaknesses.append('Resume is too lengthy - consider condensing')
        
        # Check for summary/objective
        if not self._has_summary_section(parsed_text):
            weaknesses.append('Missing professional summary or objective')
        
        # Generate suggestions
        if not has_skills or len(resume_data.get('skills', [])) < 5:
            suggestions.append('Add a dedicated skills section highlighting your technical and soft skills')
        
        if not self._has_quantifiable_achievements(parsed_text):
            suggestions.append('Include specific metrics and numbers to quantify your achievements (e.g., "Increased sales by 25%")')
        
        if not self._has_summary_section(parsed_text):
            suggestions.append('Add a professional summary at the top highlighting your key qualifications')
        
        if not self._has_strong_action_verbs(parsed_text):
            suggestions.append('Use strong action verbs like "Led", "Developed", "Implemented", "Achieved"')
        
        # Formatting suggestions
        suggestions.append('Ensure consistent formatting throughout (fonts, spacing, bullet points)')
        suggestions.append('Use bullet points for better readability')
        suggestions.append('Keep resume to 1-2 pages for optimal length')
        
        # Tailor suggestion
        suggestions.append('Tailor your resume to each job application by highlighting relevant skills')
        
        return {
            'strengths': strengths,
            'weaknesses': weaknesses,
            'suggestions': suggestions[:8],  # Limit to top 8 suggestions
            'missing_sections': missing_sections
        }
    
    def _has_summary_section(self, text):
        """Check if resume has a summary or objective section"""
        text_lower = text.lower()
        summary_keywords = ['summary', 'objective', 'profile', 'about me', 'professional summary']
        return any(keyword in text_lower for keyword in summary_keywords)
    
    def _has_quantifiable_achievements(self, text):
        """Check if resume contains numbers/metrics"""
        # Look for percentages, numbers with context
        patterns = [
            r'\d+%',  # Percentages
            r'\$\d+',  # Dollar amounts
            r'\d+\+',  # Numbers with plus
            r'increased.*\d+',  # Increased by X
            r'reduced.*\d+',  # Reduced by X
            r'grew.*\d+',  # Grew by X
        ]
        
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def _has_strong_action_verbs(self, text):
        """Check if resume uses strong action verbs"""
        action_verbs = [
            'led', 'developed', 'created', 'implemented', 'managed', 'designed',
            'built', 'achieved', 'improved', 'increased', 'reduced', 'launched',
            'delivered', 'established', 'optimized', 'streamlined', 'spearheaded'
        ]
        
        text_lower = text.lower()
        found_count = sum(1 for verb in action_verbs if verb in text_lower)
        
        return found_count >= 3  # At least 3 strong action verbs
    
    def calculate_scores(self, resume_data, parsed_text):
        """Calculate various resume scores"""
        # Formatting score (based on structure)
        formatting_score = self._calculate_formatting_score(resume_data, parsed_text)
        
        # Content score (based on completeness)
        content_score = self._calculate_content_score(resume_data, parsed_text)
        
        # Keyword score (based on relevant keywords)
        keyword_score = self._calculate_keyword_score(resume_data)
        
        # Overall score (weighted average)
        overall_score = (
            formatting_score * 0.3 +
            content_score * 0.5 +
            keyword_score * 0.2
        )
        
        return {
            'overall': round(overall_score, 2),
            'formatting': round(formatting_score, 2),
            'content': round(content_score, 2),
            'keywords': round(keyword_score, 2)
        }
    
    def _calculate_formatting_score(self, resume_data, parsed_text):
        """Calculate formatting score"""
        score = 50.0  # Base score
        
        # Check for sections
        if resume_data.get('skills'):
            score += 10
        if resume_data.get('experience'):
            score += 15
        if resume_data.get('education'):
            score += 10
        if resume_data.get('certifications'):
            score += 5
        
        # Check length (optimal 500-3000 chars)
        text_length = len(parsed_text)
        if 500 <= text_length <= 3000:
            score += 10
        elif text_length < 500:
            score += 5
        
        return min(score, 100.0)
    
    def _calculate_content_score(self, resume_data, parsed_text):
        """Calculate content score"""
        score = 40.0  # Base score
        
        # Skills
        skills_count = len(resume_data.get('skills', []))
        if skills_count >= 10:
            score += 15
        elif skills_count >= 5:
            score += 10
        elif skills_count > 0:
            score += 5
        
        # Experience
        exp_count = len(resume_data.get('experience', []))
        if exp_count >= 3:
            score += 20
        elif exp_count >= 2:
            score += 15
        elif exp_count >= 1:
            score += 10
        
        # Education
        if resume_data.get('education'):
            score += 10
        
        # Quantifiable achievements
        if self._has_quantifiable_achievements(parsed_text):
            score += 10
        
        # Action verbs
        if self._has_strong_action_verbs(parsed_text):
            score += 5
        
        return min(score, 100.0)
    
    def _calculate_keyword_score(self, resume_data):
        """Calculate keyword score based on skills"""
        skills_count = len(resume_data.get('skills', []))
        
        if skills_count >= 15:
            return 100.0
        elif skills_count >= 10:
            return 85.0
        elif skills_count >= 5:
            return 70.0
        elif skills_count > 0:
            return 50.0
        else:
            return 30.0
