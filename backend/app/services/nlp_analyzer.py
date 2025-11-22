import spacy
import re
from collections import Counter

class NLPAnalyzer:
    """Service for NLP-based resume analysis using spaCy"""
    
    def __init__(self):
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except OSError:
            # If model not found, provide helpful error
            raise RuntimeError(
                'spaCy model not found. Please run: python -m spacy download en_core_web_sm'
            )
    
    def analyze_resume(self, text):
        """Analyze resume text and extract structured information"""
        doc = self.nlp(text)
        
        return {
            'skills': self._extract_skills(text, doc),
            'experience': self._extract_experience(text),
            'education': self._extract_education(text),
            'certifications': self._extract_certifications(text)
        }
    
    def _extract_skills(self, text, doc):
        """Extract skills from resume"""
        # Common technical skills (can be expanded)
        common_skills = {
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net',
            'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
            'machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow', 'pytorch',
            'agile', 'scrum', 'jira', 'confluence',
            'rest api', 'graphql', 'microservices', 'ci/cd',
            'linux', 'unix', 'windows', 'macos'
        }
        
        text_lower = text.lower()
        found_skills = []
        
        # Find skills mentioned in text
        for skill in common_skills:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        # Also extract from "Skills" section if present
        skills_section = self._extract_section(text, ['skills', 'technical skills', 'core competencies'])
        if skills_section:
            # Split by common delimiters
            skill_items = re.split(r'[,;•\n]', skills_section)
            for item in skill_items:
                item = item.strip()
                if item and len(item) < 50:  # Reasonable skill name length
                    if item not in found_skills:
                        found_skills.append(item)
        
        return list(set(found_skills))[:20]  # Return unique skills, max 20
    
    def _extract_experience(self, text):
        """Extract work experience from resume"""
        experience = []
        
        # Find experience section
        exp_section = self._extract_section(text, [
            'experience', 'work experience', 'professional experience', 
            'employment history', 'work history'
        ])
        
        if not exp_section:
            return experience
        
        # Split into individual experiences (heuristic: look for date patterns)
        date_pattern = r'\b(20\d{2}|19\d{2})\b'
        lines = exp_section.split('\n')
        
        current_exp = {}
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line contains a date (likely a job entry)
            if re.search(date_pattern, line):
                if current_exp:
                    experience.append(current_exp)
                current_exp = {'description': line}
            elif current_exp:
                current_exp['description'] += ' ' + line
        
        if current_exp:
            experience.append(current_exp)
        
        return experience[:5]  # Return max 5 experiences
    
    def _extract_education(self, text):
        """Extract education from resume"""
        education = []
        
        # Find education section
        edu_section = self._extract_section(text, [
            'education', 'academic background', 'qualifications'
        ])
        
        if not edu_section:
            return education
        
        # Common degree patterns
        degree_patterns = [
            r'\b(Ph\.?D\.?|PhD|Doctorate)\b',
            r'\b(M\.?S\.?|M\.?Sc\.?|Master\'?s?)\b',
            r'\b(B\.?S\.?|B\.?Sc\.?|Bachelor\'?s?)\b',
            r'\b(B\.?A\.?|Bachelor of Arts)\b',
            r'\b(M\.?B\.?A\.?|Master of Business Administration)\b'
        ]
        
        lines = edu_section.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line contains a degree
            for pattern in degree_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    education.append({'description': line})
                    break
        
        return education[:3]  # Return max 3 education entries
    
    def _extract_certifications(self, text):
        """Extract certifications from resume"""
        certifications = []
        
        # Find certifications section
        cert_section = self._extract_section(text, [
            'certifications', 'certificates', 'licenses', 'professional certifications'
        ])
        
        if not cert_section:
            return certifications
        
        # Split by common delimiters
        cert_items = re.split(r'[•\n]', cert_section)
        for item in cert_items:
            item = item.strip()
            if item and len(item) > 5 and len(item) < 200:
                certifications.append({'name': item})
        
        return certifications[:5]  # Return max 5 certifications
    
    def _extract_section(self, text, section_headers):
        """Extract a specific section from resume text"""
        text_lower = text.lower()
        
        # Find section start
        section_start = -1
        matched_header = None
        
        for header in section_headers:
            pattern = r'\b' + re.escape(header) + r'\b'
            match = re.search(pattern, text_lower)
            if match:
                section_start = match.start()
                matched_header = header
                break
        
        if section_start == -1:
            return None
        
        # Find section end (next major section or end of text)
        common_sections = [
            'experience', 'education', 'skills', 'certifications', 
            'projects', 'summary', 'objective', 'references'
        ]
        
        section_end = len(text)
        for section in common_sections:
            if section == matched_header:
                continue
            
            pattern = r'\b' + re.escape(section) + r'\b'
            match = re.search(pattern, text_lower[section_start + len(matched_header):])
            if match:
                potential_end = section_start + len(matched_header) + match.start()
                if potential_end < section_end:
                    section_end = potential_end
        
        return text[section_start:section_end].strip()
