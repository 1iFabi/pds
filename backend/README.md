# GenomIA Backend 🧬

Backend de la plataforma GenomIA - Sistema de análisis genético con Django + PostgreSQL.

## 🚀 Stack Tecnológico

- **Framework**: Django 5.2.6 + Django REST Framework
- **Base de datos**: PostgreSQL (local y producción)
- **Autenticación**: JWT + django-allauth
- **Email**: Gmail API (sin SMTP)
- **Deploy**: Render (backend) + Vercel (frontend)

---

## 📋 Prerrequisitos

### Instalaciones necesarias:

1. **Python 3.9 o superior**
   ```bash
   python --version
   ```

2. **PostgreSQL 12 o superior**
   - Windows: [Descargar PostgreSQL](https://www.postgresql.org/download/windows/)
   - Incluye pgAdmin para gestión visual
   - Durante instalación, anota tu password de `postgres`

3. **Git**
   ```bash
   git --version
   ```

---

## 🛠️ Setup Local (Primera vez)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/genomia.git
cd genomia/pds/backend/sequoh
```

### 2. Crear entorno virtual

```bash
# Crear
python -m venv .venv

# Activar
.venv\Scripts\activate  # Windows PowerShell
# .venv\Scripts\activate.bat  # Windows CMD
# source .venv/bin/activate  # Linux/Mac
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar PostgreSQL

#### Opción A: Usando pgAdmin (Visual)

1. Abrir pgAdmin
2. Click derecho en "Databases" → "Create" → "Database..."
3. Llenar:
   - **Database name**: `genomia_db`
   - **Owner**: `postgres` (o crear usuario nuevo)
4. Guardar

#### Opción B: Usando SQL (Terminal)

```bash
# Conectar a PostgreSQL
psql -U postgres

# Ejecutar SQL
CREATE DATABASE genomia_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Chile.1252'
    LC_CTYPE = 'Spanish_Chile.1252';

# Salir
\q
```

#### Opcional: Crear usuario específico

```sql
-- Crear usuario (recomendado para producción)
CREATE USER genomia_user WITH PASSWORD 'tu_password_seguro';

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE genomia_db TO genomia_user;

-- Conectar a la BD y otorgar permisos en schema
\c genomia_db
GRANT ALL ON SCHEMA public TO genomia_user;
```

### 5. Configurar variables de entorno

```bash
# Copiar plantilla
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Editar .env con tus credenciales
notepad .env  # o tu editor favorito
```

**Ejemplo de `.env` local:**

```env
# Django
SECRET_KEY=django-insecure-clave-super-segura-cambiar-en-produccion
DEBUG=True
ENVIRONMENT=development

# PostgreSQL Local - Opción 1 (Recomendado)
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/genomia_db

# Frontend
FRONTEND_DOMAIN=http://localhost:5173

# Gmail API (opcional en desarrollo, necesario para emails)
GMAIL_CREDENTIALS_FILE=C:/Users/TuUsuario/Desktop/GenomIA/pds/backend/sequoh/config/credentials.json
GMAIL_TOKEN_FILE=C:/Users/TuUsuario/Desktop/GenomIA/pds/backend/sequoh/config/token.json
```

> ⚠️ **IMPORTANTE**: Cambia `tu_password` por tu password real de PostgreSQL

### 6. Probar conexión a PostgreSQL

```bash
# Desde Python
python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:tu_password@localhost:5432/genomia_db'); print('✅ Conexión exitosa'); conn.close()"
```

Si ves "✅ Conexión exitosa", todo está bien.

### 7. Aplicar migraciones

```bash
python manage.py migrate
```

Deberías ver algo como:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, autenticacion, ...
Running migrations:
  Applying contenttypes.0001_initial... OK
  ...
```

### 8. Crear superusuario

```bash
python manage.py createsuperuser

# Llenar:
# Email: admin@genomia.com
# Password: (tu password seguro)
```

### 9. Correr el servidor

```bash
python manage.py runserver
```

Visita: http://127.0.0.1:8000/ciff/ (Admin Django)

---

## 🔄 Setup en equipo nuevo (clonar existente)

Si ya clonaste el proyecto antes y estás en otra máquina:

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/genomia.git
cd genomia/pds/backend/sequoh

# 2. Activar entorno virtual
python -m venv .venv
.venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar .env (copiar y llenar)
copy .env.example .env
notepad .env

# 5. Crear base de datos en PostgreSQL (si no existe)
# Ver paso 4 del setup inicial

# 6. Migrar
python manage.py migrate

# 7. Correr
python manage.py runserver
```

---

## 🌐 Deploy en Producción (Render)

### 1. Crear cuenta en Render

Ir a [render.com](https://render.com) y crear cuenta con GitHub.

### 2. Crear PostgreSQL Database

1. Dashboard → "New +" → "PostgreSQL"
2. Configurar:
   - **Name**: `genomia-db`
   - **Region**: Oregon (más cercano a Sudamérica)
   - **Plan**: Free
3. Crear
4. **Copiar "Internal Database URL"** (algo como `postgresql://...`)

### 3. Crear Web Service

1. Dashboard → "New +" → "Web Service"
2. Conectar tu repo de GitHub
3. Configurar:
   - **Name**: `genomia-backend`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: `pds/backend/sequoh`
   - **Runtime**: Python 3
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - **Start Command**:
     ```bash
     gunicorn sequoh.wsgi:application
     ```
   - **Plan**: Free

### 4. Variables de entorno en Render

En el Web Service, ir a "Environment" y agregar:

```
SECRET_KEY=genera-una-nueva-clave-segura-para-produccion
DEBUG=False
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@host:5432/db  # Copiar de la BD creada
FRONTEND_DOMAIN=https://tu-frontend.vercel.app
RENDER_EXTERNAL_HOSTNAME=genomia-backend.onrender.com  # Tu URL de Render
```

> 💡 **Generar SECRET_KEY segura**:
> ```bash
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

### 5. Deploy automático

Render detectará pushes a `main` y desplegará automáticamente.

---

## 🗂️ Estructura del Proyecto

```
sequoh/
├── sequoh/              # Configuración Django
│   ├── settings.py      # ⚙️ Configuración principal
│   ├── urls.py
│   ├── wsgi.py
│   └── security.py
├── autenticacion/       # 🔐 App principal
│   ├── models.py        # Modelos: Profile, SNP, UserSNP
│   ├── views.py         # APIs: Login, Register, Upload
│   ├── urls.py
│   ├── email_utils.py   # Sistema de emails
│   └── jwt_utils.py     # Autenticación JWT
├── config/              # 🔑 Credenciales Gmail (no versionado)
│   ├── credentials.json
│   └── token.json
├── manage.py
├── requirements.txt
├── .env                 # 🚫 NO VERSIONAR (local)
├── .env.example         # ✅ Plantilla versionada
└── README.md
```

---

## 🔐 Seguridad

### ❌ NUNCA versionar:

- `.env` (credenciales locales)
- `config/credentials.json` (Gmail API)
- `config/token.json` (Gmail OAuth)
- `db.sqlite3` (base de datos local)

### ✅ SÍ versionar:

- `.env.example` (plantilla sin valores reales)
- Migraciones (`autenticacion/migrations/`)
- `requirements.txt`

---

## 🧪 Comandos Útiles

### Base de datos

```bash
# Ver estado de migraciones
python manage.py showmigrations

# Crear migración tras cambiar modelos
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Resetear base de datos (⚠️ PELIGRO - borra todo)
python manage.py flush

# Backup PostgreSQL
pg_dump -U postgres -d genomia_db > backup.sql

# Restaurar backup
psql -U postgres -d genomia_db < backup.sql
```

### Django

```bash
# Shell interactivo
python manage.py shell

# Crear superusuario
python manage.py createsuperuser

# Recolectar archivos estáticos
python manage.py collectstatic

# Ver rutas registradas
python manage.py show_urls  # (si tienes django-extensions)
```

---

## 🐛 Troubleshooting

### Error: "FATAL: password authentication failed"

**Solución**:
1. Verificar password en `.env`
2. Probar conexión manual:
   ```bash
   psql -U postgres -d genomia_db
   # Si pide password, usar el correcto
   ```
3. Si olvidaste el password, resetear:
   - Windows: Services → PostgreSQL → Properties → Reset password

### Error: "could not connect to server"

**Solución**:
1. Verificar que PostgreSQL está corriendo:
   - Windows: Services → Buscar "postgresql" → Estado debe ser "Running"
2. Verificar puerto:
   ```bash
   netstat -an | findstr 5432
   ```

### Error: "relation does not exist"

**Solución**: Faltan migraciones
```bash
python manage.py migrate
```

### Error: "No module named 'psycopg2'"

**Solución**:
```bash
pip install psycopg2-binary
```

### Error: "ModuleNotFoundError: No module named 'dotenv'"

**Solución**:
```bash
pip install python-dotenv
```

---

## 📞 Contacto

Para dudas o problemas, contactar al equipo de desarrollo.

---

## 📄 Licencia

Proyecto privado - GenomIA © 2025
