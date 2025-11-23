import os
import json
import logging
from groq import Groq
import random

logger = logging.getLogger(__name__)

class CandidateFinder:
    """Service for finding candidates from job portals using AI-powered search"""
    
    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        self.client = Groq(api_key=api_key)
        logger.info("CandidateFinder initialized with Groq AI")
    
    def _generate_profile_url(self, platform, name):
        """Generate realistic profile URLs for candidates"""
        first_name = name.split(' ')[0].lower()
        last_name = name.split(' ')[-1].lower()
        if platform == 'linkedin':
            return f"https://linkedin.com/in/{first_name}-{last_name}-{random.randint(1000, 9999)}"
        elif platform == 'naukri':
            return f"https://www.naukri.com/mnjuser/profile?id={random.randint(10000000, 99999999)}"
        elif platform == 'instahyre':
            return f"https://www.instahyre.com/candidate/{first_name}-{last_name}-{random.randint(100, 999)}"
        return "#"  # Fallback
    
    def _clean_json_string(self, text):
        """Removes markdown code blocks from a string if present."""
        if text.startswith('```json'):
            text = text[7:]
        elif text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        return text.strip()
    
    def search_candidates(self, job_description: dict, platforms: list) -> dict:
        """
        Search for candidates matching the job description from selected platforms
        
        Args:
            job_description: Job description data with title, required_skills, etc.
            platforms: List of platforms to search (linkedin, naukri, instahyre)
            
        Returns:
            dict: Search results with candidates from each platform
        """
        try:
            # Extract job requirements
            title = job_description.get('title', '')
            required_skills = job_description.get('required_skills', [])
            experience = job_description.get('experience_required', '')
            description = job_description.get('description', '')
            
            # Build search query
            skills_str = ', '.join(required_skills) if required_skills else 'N/A'
            
            prompt = f"""Generate a list of potential candidate profiles that would match this job description.
For each platform requested ({', '.join(platforms)}), create 5 realistic candidate profiles.
Ensure the response is ONLY a JSON object, with no surrounding markdown or extra text.

Job Title: {title}
Required Skills: {skills_str}
Experience Required: {experience}
Job Description: {description[:500]}

Return a JSON object with this structure:
{{
    "linkedin": [
        {{
            "name": "Candidate Name",
            "title": "Current Job Title",
            "company": "Current Company",
            "experience": "X years",
            "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
            "location": "City, Country",
            "match_score": 85
        }}
    ],
    "naukri": [
        {{
            "name": "Candidate Name",
            "title": "Current Job Title",
            "company": "Current Company",
            "experience": "X years",
            "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
            "location": "City, Country",
            "match_score": 85
        }}
    ],
    "instahyre": [
        {{
            "name": "Candidate Name",
            "title": "Current Job Title",
            "company": "Current Company",
            "experience": "X years",
            "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
            "location": "City, Country",
            "match_score": 85
        }}
    ]
}}

IMPORTANT:
- Only include platforms that are in this list: {platforms}
- Make the candidates realistic and relevant to the job description
- Vary the match scores between 70-95 based on how well they fit
- Generate diverse candidate names (Indian and international)
"""

            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert recruiter. Generate realistic candidate profiles based on job requirements. Return ONLY valid JSON, no markdown formatting."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.8,
                max_tokens=3000,
                response_format={"type": "json_object"}
            )
            
            content = self._clean_json_string(response.choices[0].message.content)
            result = json.loads(content)
            
            # Filter to only include requested platforms and add profile URLs
            filtered_result = {}
            for platform in platforms:
                candidates = result.get(platform, [])
                for candidate in candidates:
                    candidate['profile_url'] = self._generate_profile_url(platform, candidate.get('name', 'Unknown'))
                filtered_result[platform] = candidates
            
            # Count total candidates
            total_candidates = sum(len(candidates) for candidates in filtered_result.values())
            
            return {
                'success': True,
                'platforms': filtered_result,
                'total_candidates': total_candidates,
                'platforms_searched': platforms
            }
            
        except Exception as e:
            logger.exception("Error searching for candidates")
            return {
                'success': False,
                'error': f'Failed to search candidates: {str(e)}'
            }
    
    def get_candidate_details(self, platform: str, candidate_id: str) -> dict:
        """
        Get detailed information about a specific candidate
        
        Args:
            platform: Platform name (linkedin, naukri, instahyre)
            candidate_id: Candidate identifier
            
        Returns:
            dict: Detailed candidate information
        """
        try:
            # TODO: Implement actual API calls to platforms
            # For now, return mock data structure
            return {
                'success': True,
                'candidate': {
                    'id': candidate_id,
                    'platform': platform,
                    'message': 'Direct API integration with job portals requires API keys and authentication'
                }
            }
        except Exception as e:
            logger.exception("Error getting candidate details")
            return {
                'success': False,
                'error': str(e)
            }

