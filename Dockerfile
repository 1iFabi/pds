# Dockerfile en la RAÍZ del repo
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# Para sqlite3 de Python
RUN apt-get update \
  && apt-get install -y --no-install-recommends libsqlite3-0 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# requirements está en backend/sequoh
COPY backend/sequoh/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos SOLO el backend/sequoh (ahí está manage.py y sequoh/)
COPY backend/sequoh/ .

# Arranque: migrate + collectstatic + gunicorn
CMD sh -c "python manage.py migrate --noinput \
  && python manage.py collectstatic --noinput || true \
  && gunicorn sequoh.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120"
