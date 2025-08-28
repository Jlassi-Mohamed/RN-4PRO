#!/bin/sh
set -e

echo "🚀 Entrypoint started..."

# DB connection info
DB_HOST='mysql-production-b881.up.railway.app'
DB_PORT='3306'
DB_USER='root'
DB_PASSWORD='pzDXZzJhszWaJAtblsnpBxqNUYytYaBj'
DB_NAME='gestion'

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL at $DB_HOST:$DB_PORT..."
RETRIES=20
until nc -z $DB_HOST $DB_PORT; do
  RETRIES=$((RETRIES-1))
  if [ $RETRIES -le 0 ]; then
    echo "❌ MySQL not reachable at $DB_HOST:$DB_PORT"
    exit 1
  fi
  echo "⚠️ MySQL not ready yet... retrying in 5s"
  sleep 5
done
echo "✅ MySQL is ready!"

# Run migrations
echo "📦 Running migrations..."
python manage.py migrate --noinput

# Create superusers if missing
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

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput || true

# Start Gunicorn
echo "🚀 Starting Gunicorn on 0.0.0.0:$PORT ..."
exec gunicorn backend.wsgi:application --bind 0.0.0.0:"$PORT" --workers 4 --threads 2 --log-level info
