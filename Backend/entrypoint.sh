#!/bin/sh
set -e

echo "🚀 Entrypoint started..."

echo "📦 Running migrations..."
python manage.py migrate --noinput

echo "👤 Creating superusers..."
python manage.py shell <<'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
superusers = {
    "admin": "A8$!kWz7pF3qLx2",
    "manager": "M9#dZp4!uV6hRq8",
    "stock": "S7&nGt5^eX2bWp9",
}
for username, password in superusers.items():
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, password=password)
        print(f"✅ Created superuser '{username}'")
    else:
        print(f"ℹ️ Superuser '{username}' already exists")
EOF

echo "📁 Collecting static files..."
python manage.py collectstatic --noinput || true

echo "🚀 Starting Gunicorn on 0.0.0.0:$PORT ..."
exec gunicorn backend.wsgi:application --bind 0.0.0.0:"$PORT" --workers 4 --threads 2 --log-level info
