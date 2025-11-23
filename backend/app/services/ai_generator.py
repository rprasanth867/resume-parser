import os
import json
from groq import Groq

class AIGenerator:
    """Service for generating job descriptions using Groq"""
    
    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        # Initialize Groq client
        self.client = Groq(api_key=api_key)
        print(f"Groq API key configured: {api_key[:20]}...")
    
    def generate_job_description(self, requirements: str) -> dict:
        """
        Generate a structured job description from user requirements
        
        Args:
            requirements: User's requirements for the job description
            
        Returns:
            dict: Generated job description with title, description, required_skills, etc.
        """
        try:
            prompt = f"""Based on the following requirements, generate a detailed job description.

Requirements:
{requirements}

Return ONLY a valid JSON object (no markdown, no code blocks, no additional text) with this exact structure:
{{
    "title": "Job Title",
    "description": "Detailed job description (3-4 paragraphs)",
    "required_skills": ["skill1", "skill2", "skill3"],
    "preferred_skills": ["skill1", "skill2"],
    "experience_required": "X years",
    "education_required": "Education level",
    "responsibilities": ["responsibility1", "responsibility2"],
    "qualifications": ["qualification1", "qualification2"]
}}

Make the description professional, comprehensive, and ATS-friendly."""

            # Use Groq API with llama3 model
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Fast and powerful
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR professional. Return ONLY valid JSON, no markdown formatting, no code blocks."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
                content = content.strip()
            
            result = json.loads(content)
            
            return {
                'success': True,
                'data': result
            }
            
        except Exception as e:
            import traceback
            print(f"Error generating JD: {str(e)}")
            print(traceback.format_exc())
            return {
                'success': False,
                'error': str(e)
            }
    
    def enhance_job_description(self, existing_jd: dict) -> dict:
        """
        Enhance an existing job description
        
        Args:
            existing_jd: Existing job description data
            
        Returns:
            dict: Enhanced job description
        """
        try:
            prompt = f"""Enhance and improve the following job description to make it more professional and ATS-friendly:

Current Job Description:
Title: {existing_jd.get('title', '')}
Description: {existing_jd.get('description', '')}
Required Skills: {', '.join(existing_jd.get('required_skills', []))}

Return ONLY a valid JSON object (no markdown, no code blocks) with the enhanced version."""

            # Use Groq API
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR professional. Return ONLY valid JSON, no markdown formatting."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
                content = content.strip()
            
            result = json.loads(content)
            
            return {
                'success': True,
                'data': result
            }
            
        except Exception as e:
            import traceback
            print(f"Error enhancing JD: {str(e)}")
            print(traceback.format_exc())
            return {
                'success': False,
                'error': str(e)
            }

