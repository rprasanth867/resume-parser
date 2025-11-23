import os
import json
import logging
from groq import Groq

logger = logging.getLogger(__name__)

class AIATSScorer:
    """Advanced ATS Scorer using AI for comprehensive resume evaluation"""
    
    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        self.client = Groq(api_key=api_key)
        logger.info("AIATSScorer initialized with Groq AI")
    
    def calculate_advanced_score(self, resume_data: dict, job_description: dict) -> dict:
        """
        Calculate comprehensive ATS score using AI with weighted criteria:
        - Academic Institution: 10%
        - Academic Score: 15%
        - Company Quality: 20%
        - Job Stability: 25%
        - Skills Match: 30%
        
        Args:
            resume_data: Dictionary with parsed resume information
            job_description: Job description data
            
        Returns:
            dict: Detailed scoring breakdown
        """
        try:
            # Extract resume information
            resume_text = resume_data.get('parsed_text', '')
            candidate_name = resume_data.get('candidate_name', 'Candidate')
            
            # Extract JD information
            jd_title = job_description.get('title', '')
            jd_skills = job_description.get('required_skills', [])
            skill_weights = job_description.get('skill_weights', {})
            jd_experience = job_description.get('experience_required', '')
            jd_description = job_description.get('description', '')
            
            # Build comprehensive prompt
            prompt = f"""Analyze this resume against the job description and provide a detailed ATS score.

RESUME TEXT:
{resume_text}

JOB DESCRIPTION:
Title: {jd_title}
Required Skills: {', '.join(jd_skills) if jd_skills else 'Not specified'}
Skill Weights: {json.dumps(skill_weights) if skill_weights else 'Not specified - equal weight'}
Experience Required: {jd_experience}
Description: {jd_description[:300]}...

SCORING CRITERIA (Total 100%):

1. ACADEMIC INSTITUTION (10% weightage):
   - Score 10: Tier 1 - Top 20 in India (IIT BE, BITS/BIT BE)
   - Score 9: Tier 1.5 - Top 50 in India (NITs, second level IITs)
   - Score 8: Tier 2 - Top 100 in India (VIT, MIT, top-5 college in each state)
   - Score 6.5: Tier 3 - Top 10 colleges in all major states
   - Score 5: Other colleges
   
2. ACADEMIC SCORE (15% weightage):
   - Extract CGPA or Percentage
   - If percentage: divide by 9.25 to normalize
   - Use normalized score (0-10 scale)
   
3. COMPANY QUALITY (20% weightage):
   - Calculate average across all companies in experience
   - Score 10: Top MNCs (FAANG, Microsoft, etc.)
   - Score 9: Tier 2 MNCs and startups (Cisco, SAP, unicorns)
   - Score 8: Tier 1 Indian companies, tier 3 MNCs, high-end services
   - Score 7: US services companies (Cognizant, Accenture)
   - Score 6: Indian services companies (TCS, Wipro, Infosys)
   - Score 5: Rest
   
4. JOB STABILITY (25% weightage):
   - Calculate average tenure across all jobs
   - Score 10: Average span > 5 years
   - Score 8: Average span 3-5 years
   - Score 6: Average span < 3 years
   
5. SKILLS MATCH (30% weightage):
   - Match candidate skills with required skills
   - If skill weights are provided, use them to calculate weighted skill match
   - If no weights provided, treat all skills equally
   - Consider both technical and soft skills
   - Account for experience level with each skill
   - Each matched skill contributes based on its weight percentage

IMPORTANT:
- Be realistic and fair in evaluation
- Handle missing information gracefully (assign neutral scores)
- Provide clear reasoning for each score
- Calculate weighted scores accurately

Return ONLY valid JSON in this exact format:
{{
  "candidate_name": "{candidate_name}",
  "overall_score": 85.5,
  "breakdown": {{
    "academic_institution": {{
      "college_name": "IIT Delhi",
      "tier": "Tier 1",
      "raw_score": 10,
      "weightage": 10,
      "weighted_score": 1.0,
      "reasoning": "Premier IIT, top 5 in India"
    }},
    "academic_performance": {{
      "cgpa": 8.5,
      "percentage": null,
      "normalized_score": 8.5,
      "raw_score": 8.5,
      "weightage": 15,
      "weighted_score": 1.275,
      "reasoning": "Strong academic performance"
    }},
    "company_quality": {{
      "companies": [
        {{
          "name": "Google",
          "tier": "Top MNC",
          "score": 10,
          "duration_years": 3.0
        }}
      ],
      "average_score": 9.5,
      "raw_score": 9.5,
      "weightage": 20,
      "weighted_score": 1.9,
      "reasoning": "Excellent company track record"
    }},
    "job_stability": {{
      "jobs": [
        {{
          "company": "Google",
          "duration_years": 3.0,
          "start_date": "2020",
          "end_date": "2023"
        }}
      ],
      "average_tenure_years": 3.5,
      "raw_score": 8,
      "weightage": 25,
      "weighted_score": 2.0,
      "reasoning": "Good stability with 3-5 year average"
    }},
    "skills_match": {{
      "matched_skills": [
        {{"skill": "React", "weight": 30, "has_skill": true}},
        {{"skill": "JavaScript", "weight": 25, "has_skill": true}}
      ],
      "missing_skills": [
        {{"skill": "TypeScript", "weight": 20, "has_skill": false}}
      ],
      "additional_skills": ["Python", "Docker"],
      "weighted_match_percentage": 70.5,
      "total_weight_matched": 55,
      "total_weight_possible": 100,
      "match_percentage": 70,
      "raw_score": 7.0,
      "weightage": 30,
      "weighted_score": 2.1,
      "reasoning": "Strong match with core requirements, weighted by skill importance"
    }}
  }},
  "total_weighted_score": 8.275,
  "percentage_score": 82.75,
  "recommendation": "Strong candidate with excellent academic background and relevant experience",
  "strengths": [
    "Top-tier educational background",
    "Experience with leading tech companies"
  ],
  "areas_for_improvement": [
    "Could benefit from cloud computing experience"
  ]
}}"""

            # Call Groq AI
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert ATS (Applicant Tracking System) that provides detailed, fair, and accurate resume evaluations. Return ONLY valid JSON, no markdown formatting."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Low temperature for consistent scoring
                max_tokens=2500,
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
            logger.exception("Error in AI ATS scoring")
            return {
                'success': False,
                'error': f'Failed to calculate advanced score: {str(e)}'
            }
    
    def calculate_basic_match_score(self, resume_skills: list, required_skills: list) -> float:
        """
        Quick skills-only match score (for backwards compatibility)
        
        Args:
            resume_skills: List of candidate skills
            required_skills: List of required skills from JD
            
        Returns:
            float: Match percentage (0-100)
        """
        if not required_skills:
            return 50.0  # Neutral score if no requirements
        
        if not resume_skills:
            return 0.0
        
        # Normalize skills to lowercase for comparison
        resume_skills_lower = [skill.lower().strip() for skill in resume_skills]
        required_skills_lower = [skill.lower().strip() for skill in required_skills]
        
        # Count matches
        matches = sum(1 for req_skill in required_skills_lower 
                     if any(req_skill in resume_skill or resume_skill in req_skill 
                           for resume_skill in resume_skills_lower))
        
        # Calculate percentage
        match_percentage = (matches / len(required_skills)) * 100
        
        return round(match_percentage, 2)

