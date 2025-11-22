# Backend README

## Flask Resume Parser API

### Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Set up environment
cp .env.example .env

# Initialize database
flask db upgrade

# Run server
python run.py
```

### Project Structure

```
backend/
├── app/
│   ├── __init__.py          # App factory
│   ├── config.py            # Configuration
│   ├── extensions.py        # Flask extensions
│   ├── models/              # Database models
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   │   ├── auth_service.py
│   │   ├── resume_parser.py
│   │   ├── text_extractor.py
│   │   ├── nlp_analyzer.py
│   │   ├── ats_scorer.py
│   │   └── feedback_generator.py
│   └── middleware/          # Error handlers
├── migrations/              # Database migrations
├── uploads/                 # Uploaded files
├── requirements.txt
└── run.py                   # Entry point
```

### Environment Variables

See `.env.example` for all configuration options.

### Database Migrations

```bash
# Create migration
flask db migrate -m "Description"

# Apply migration
flask db upgrade

# Rollback
flask db downgrade
```

### API Testing

Use the provided curl commands in the main README or use Postman/Insomnia.
