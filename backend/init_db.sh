#!/bin/bash

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until python -c "import pymysql; pymysql.connect(host='mysql', user='resume_user', password='resume_pass', database='resume_parser')" 2>/dev/null; do
    sleep 2
done

echo "MySQL is ready!"

# Initialize migrations if not exists
if [ ! -d "migrations" ]; then
    echo "Initializing database migrations..."
    flask db init
fi

# Create migration
echo "Creating migration..."
flask db migrate -m "Initial migration" || true

# Apply migrations
echo "Applying migrations..."
flask db upgrade

# Start the application
echo "Starting Flask application..."
exec python run.py
