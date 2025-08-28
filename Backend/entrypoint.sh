#!/bin/sh
set -e

# Default port fallback
: "${PORT:=8000}"

# Default MySQL settings (Railway environment variables)
: "${MYSQLHOST:=mysql.railway.internal}"
: "${MYSQLPORT:=3306}"
: "${MYSQLUSER:=root}"
: "${MYSQLPASSWORD:=}"
: "${MYSQLDATABASE:=gestion}"

echo "🚀 Starting entrypoint..."
echo "Waiting for MySQL at $MYSQLHOST:$MYSQLPORT ..."

# Wait for database connection using Python (no nc needed)
until python - <<PYTHON
import sys
import pymysql
try:
    conn = pymysql.connect(
        host="$MYSQLHOST",
        user="$MYSQLUSER",
        password="$MYSQLPASSWORD",
        database="$MYSQLDATABASE",
        port=int("$MYSQLPORT"),
        connect_timeout=5
    )
    conn.close()
except Exception as e:
    sys.exit(1)
PYTHON
do
  echo "Database not ready yet... retrying in 3s"
  sleep 3
done

echo "✅ MySQL is up - continuing..."

# Apply migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Create fixed superusers if they don't exist
echo "Creating superusers if needed..."
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
echo "Collecting static files..."
python manage.py collectstatic --noinput || true

# Start Gunicorn
echo "Starting Gunicorn on 0.0.0.0:$PORT..."
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:"$PORT" \
    --workers 4 \
    --threads 2 \
    --log-level info
