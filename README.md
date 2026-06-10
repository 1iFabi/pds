# Genomia

Genomia es una plataforma para traducir datos genómicos complejos, originalmente estructurados en archivos de texto masivos con anotaciones técnicas, en una representación visual estructurada, clara y funcional.

El proyecto combina:
- un backend en Django para autenticación, gestión de usuarios, carga de datos y servicios de correo;
- un frontend en React/Vite para la experiencia visual y los paneles de usuario;
- un generador de reportes para exportar resultados en PDF.

## Qué resuelve

Genomia ayuda a convertir información genética difícil de interpretar en vistas comprensibles para distintos perfiles de usuario, como:
- pacientes;
- personal de recepción;
- analistas;
- administradores.

## Estructura del proyecto

- `backend/sequoh`: aplicación Django principal.
- `frontend`: interfaz web en React.
- `backend/report-generator`: generador de reportes PDF.

## Requisitos

- Python 3.11+ recomendado.
- Node.js 18+ recomendado.
- npm.
- Una base de datos PostgreSQL para producción o desarrollo avanzado.

## Configuración inicial

### 1. Backend

1. Entra a `backend/sequoh`.
2. Crea y activa un entorno virtual.
3. Instala dependencias:

```bash
pip install -r requirements.txt
```

4. Crea tu archivo `.env` a partir de `.env.example`.
5. Define al menos estas variables:

```env
SECRET_KEY=una-clave-larga-y-unica
DEBUG=True
ENVIRONMENT=development
DATABASE_URL=postgresql://usuario:password@localhost:5432/genomia
FRONTEND_DOMAIN=http://localhost:5173
```

Si vas a usar Gmail API para correos, configura también:

```env
GMAIL_CREDENTIALS_JSON={"installed":{...}}
GMAIL_TOKEN_JSON={"token":"...","refresh_token":"..."}
DEFAULT_FROM_EMAIL=GenomIA <tu-email@gmail.com>
```

### 2. Frontend

1. Entra a `frontend`.
2. Instala dependencias:

```bash
npm install
```

3. Crea o ajusta el archivo `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/auth
```

### 3. Generador de reportes

1. Entra a `backend/report-generator`.
2. Instala dependencias:

```bash
npm install
```

## Cómo ejecutar el proyecto

### Backend

Desde `backend/sequoh`:

```bash
python manage.py migrate
python manage.py runserver
```

Si necesitas un usuario administrador:

```bash
python manage.py createsuperuser
```

### Frontend

Desde `frontend`:

```bash
npm run dev
```

El frontend suele quedar disponible en `http://localhost:5173`.

### Reportes

Desde `backend/report-generator`:

```bash
npm run gen
```