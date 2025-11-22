import PyPDF2
import pdfplumber
import docx
import re

class TextExtractor:
    """Service for extracting text from PDF and DOCX files"""
    
    def extract_text(self, file_path, file_type):
        """Extract text from file based on type"""
        if file_type == 'pdf':
            return self._extract_from_pdf(file_path)
        elif file_type in ['docx', 'doc']:
            return self._extract_from_docx(file_path)
        else:
            raise ValueError(f'Unsupported file type: {file_type}')
    
    def _extract_from_pdf(self, file_path):
        """Extract text from PDF file"""
        text = ''
        
        try:
            # Try with pdfplumber first (better for complex layouts)
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + '\n'
        except Exception as e:
            # Fallback to PyPDF2
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + '\n'
            except Exception as e2:
                raise ValueError(f'Failed to extract text from PDF: {str(e2)}')
        
        return text.strip()
    
    def _extract_from_docx(self, file_path):
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            raise ValueError(f'Failed to extract text from DOCX: {str(e)}')
    
    def extract_contact_info(self, text):
        """Extract contact information from text"""
        contact_info = {
            'email': None,
            'phone': None,
            'name': None
        }
        
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Extract phone (various formats)
        phone_patterns = [
            r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # +1-234-567-8900
            r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # (234) 567-8900
            r'\d{10}',  # 2345678900
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                contact_info['phone'] = phone_match.group()
                break
        
        # Extract name (first line or first few words, heuristic)
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and len(line.split()) <= 4 and len(line) < 50:
                # Likely a name if it's short and at the top
                if not any(char.isdigit() for char in line) and '@' not in line:
                    contact_info['name'] = line
                    break
        
        return contact_info
