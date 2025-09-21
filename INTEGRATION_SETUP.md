# Configuración de Integración Frontend-Backend

## Pasos para probar la funcionalidad completa

### 1. Configurar y ejecutar el Backend (Django)

```powershell
# Navegar al directorio del backend
cd backend

# Activar el entorno virtual
.\.venv\Scripts\Activate.ps1

# Navegar al proyecto Django
cd sequoh

# Aplicar migraciones para crear las tablas de base de datos
python manage.py migrate

# Crear un superusuario (opcional, para acceder al admin)
python manage.py createsuperuser

# Ejecutar el servidor de desarrollo
python manage.py runserver
```

El backend estará disponible en: `http://127.0.0.1:8000/`

### 2. Configurar y ejecutar el Frontend (React)

```powershell
# En una nueva terminal, navegar al directorio frontend
cd frontend

# Instalar dependencias (si no están instaladas)
npm install

# Ejecutar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173/`

### 3. Probar la funcionalidad

#### Registro de usuarios:
1. Ir a `http://localhost:5173/register`
2. Llenar el formulario con:
   - Nombre: Cualquier nombre
   - Correo: Un email válido (ej: `test@example.com`)
   - Teléfono: Solo números, máximo 11 dígitos
   - Contraseña: Mínimo 10 caracteres, debe contener:
     - Al menos 1 mayúscula
     - Al menos 1 número
     - Al menos 1 símbolo especial (!@#$%^&*)
   - Repetir contraseña: Debe coincidir
   - Aceptar términos y condiciones
3. Hacer clic en "Registrarse"
4. Si es exitoso, serás redirigido automáticamente al login

#### Inicio de sesión:
1. Ir a `http://localhost:5173/login`
2. Usar las credenciales del usuario recién registrado:
   - Correo: El email que usaste en el registro
   - Contraseña: La contraseña que creaste
3. Hacer clic en "Ingresa tu cuenta"

### 4. Endpoints disponibles

- **Registro**: `POST http://127.0.0.1:8000/api/auth/register/`
- **Login**: `POST http://127.0.0.1:8000/api/auth/login/`
- **Admin Django**: `http://127.0.0.1:8000/admin/`

### 5. Estructura de datos

#### Registro (POST /api/auth/register/):
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "telefono": "1234567890",
  "contraseña": "MiPassword123!",
  "repetirContraseña": "MiPassword123!",
  "terminos": true
}
```

#### Login (POST /api/auth/login/):
```json
{
  "username": "juan@example.com",
  "password": "MiPassword123!"
}
```

### 6. Validaciones implementadas

#### Frontend:
- Validación en tiempo real de contraseña
- Verificación de coincidencia de contraseñas
- Validación de formato de teléfono (solo números, max 11)
- Validación de aceptación de términos

#### Backend:
- Validación de campos obligatorios
- Validación de formato de email
- Validación de complejidad de contraseña
- Verificación de usuario duplicado
- Manejo de errores con mensajes específicos

### 7. Características técnicas

- **CORS configurado** para desarrollo
- **CSRF deshabilitado** para APIs (solo desarrollo)
- **Validación robusta** tanto en frontend como backend
- **Manejo de errores** con mensajes amigables
- **Estados de carga** en la interfaz
- **Configuración centralizada** de APIs en el frontend

### 8. Próximos pasos sugeridos

1. Implementar dashboard/página principal después del login
2. Agregar funcionalidad de "Olvidé mi contraseña"
3. Crear modelo Profile personalizado para datos adicionales
4. Implementar logout
5. Añadir autenticación JWT para APIs más robustas
6. Configurar variables de entorno para URLs de producción