# Usa una imagen slim para que el contenedor sea liviano
FROM python:3.11-slim

# Evita pyc y mejora logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Instala la librería del sistema que provee libsqlite3.so.0
RUN apt-get update \
 && apt-get install -y --no-install-recommends libsqlite3-0 \
 && rm -rf /var/lib/apt/lists/*

# Crea directorio de la app
WORKDIR /app

# Instala dependencias primero (mejor cache)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del proyecto
COPY . .

# Si usas Whitenoise para estáticos, puedes recogerlos al arrancar
# (lo haremos en el CMD para que use las env vars de Railway)

# Railway asigna el puerto en $PORT. Gunicorn debe escuchar ahí.
# Usamos /start.sh simple para migrar y servir
CMD sh -c "python manage.py migrate --noinput && python manage.py collectstatic --noinput || true && gunicorn sequoh.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120"
