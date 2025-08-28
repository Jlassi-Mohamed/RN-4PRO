#!/bin/sh
set -e

echo "🚀 Entrypoint started..."
echo "DEBUG: Database settings:"
echo "MYSQLHOST: $MYSQLHOST"
echo "MYSQLUSER: $MYSQLUSER"
echo "MYSQLDATABASE: $MYSQLDATABASE"
echo "MYSQLPORT: $MYSQLPORT"

# Retry migrate until DB is ready
RETRIES=10
until python manage.py migrate --noinput; do
  if [ $RETRIES -le 0 ]; then
    echo "❌ Migrations failed after multiple attempts."
    exit 1
  fi
  echo "⚠️ Database not ready yet... retrying in 10s"
  RETRIES=$((RETRIES-1))
  sleep 10
done

echo "✅ Migrations applied successfully."

echo "Creating superusers if missing..."
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

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "🚀 Starting Gunicorn on 0.0.0.0:$PORT ..."
exec gunicorn backend.wsgi:application --bind 0.0.0.0:"$PORT" --workers 4 --threads 2 --log-level info
