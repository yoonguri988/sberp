#!/bin/bash
cd "$(dirname "$0")/../analytics-django"
source .venv/bin/activate
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
