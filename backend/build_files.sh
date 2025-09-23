#!/bin/bash

# Build the project
echo "Building the project..."

# Install dependencies
pip install -r requirements.txt

# Collect static files
python sequoh/manage.py collectstatic --noinput --clear

# Make migrations
python sequoh/manage.py makemigrations --noinput
python sequoh/manage.py migrate --noinput