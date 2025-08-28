#!/bin/sh
set -e

: "${PORT:=8000}"
: "${MYSQLHOST:=mysql.railway.internal}"
: "${MYSQLPORT:=3306}"
: "${MYSQLUSER:=root}"
: "${MYSQLPASSWORD:=}"
: "${MYSQLDATABASE:=gestion}"

echo "🚀 Entrypoint: waiting for MySQL at $MYSQLHOST:$MYSQLPORT ..."

# Python-based wait loop (no nc required)
until python - <<PY
import sys, os
try:
    import pymysql
    pymysql.connect(
        host=os.getenv('MYSQLHOST'),
        user=os.getenv('MYSQLUSER'),
        password=os.getenv('MYSQLPASSWORD'),
        database=os.getenv('MYSQLDATABASE'),
        port=int(os.getenv('MYSQLPORT', 3306)),
        connect_timeout=5
    ).close()
except Exception as e:
    sys.exit(1)
PY
do
  echo "Database not ready yet... retrying in 3s"
  sleep 3
done

echo "✅ MySQL is up - applying migrations..."
python manage.py migrate --noinput

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

echo "Starting Gunicorn on 0.0.0.0:$PORT..."
exec gunicorn backend.wsgi:application --bind 0.0.0.0:"$PORT" --workers 4 --threads 2 --log-level info
