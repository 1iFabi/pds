@echo off
echo Iniciando servidor Django en IP de red (192.168.0.6:8000)...
echo.
echo IMPORTANTE: 
echo - El servidor sera accesible desde otros dispositivos en tu red
echo - URL del backend: http://192.168.0.6:8000/api/auth
echo - Para acceder desde otros dispositivos, ve a: https://pds-kappa.vercel.app
echo.
cd sequoh
python manage.py runserver 192.168.0.6:8000