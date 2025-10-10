"""
Script manual para generar token de Gmail API
Usa el flujo out-of-band (OOB) que no requiere servidor local
"""
import os
import sys
from google_auth_oauthlib.flow import InstalledAppFlow
from pathlib import Path

# Configurar rutas
BASE_DIR = Path(__file__).resolve().parent
CRED_PATH = BASE_DIR / 'config' / 'credentials.json'
TOKEN_PATH = BASE_DIR / 'config' / 'token.json'
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def main():
    print(f"Usando credenciales desde: {CRED_PATH}")
    print(f"Guardará token en: {TOKEN_PATH}")
    
    if not CRED_PATH.exists():
        print(f"\n❌ ERROR: No se encontró el archivo de credenciales en {CRED_PATH}")
        sys.exit(1)
    
    print("\n🔐 Iniciando flujo de autenticación OAuth...")
    print("Se abrirá tu navegador para que autorices la aplicación.\n")
    
    try:
        flow = InstalledAppFlow.from_client_secrets_file(
            str(CRED_PATH),
            SCOPES
        )
        
        # Intentar con servidor local en varios puertos
        ports = [8080, 9090, 8888, 0]  # 0 = puerto aleatorio
        creds = None
        
        for port in ports:
            try:
                print(f"Intentando puerto {port}...")
                creds = flow.run_local_server(
                    host='localhost',
                    port=port,
                    open_browser=True,
                    authorization_prompt_message='',
                    success_message='✅ Autorización exitosa. Puedes cerrar esta ventana.',
                    authorization_url_kwargs={
                        'access_type': 'offline',
                        'prompt': 'consent',
                        'login_hint': 'proyectogenomia@gmail.com'
                    }
                )
                break  # Si funcionó, salir del loop
            except OSError as e:
                if port == ports[-1]:  # Si es el último puerto, lanzar error
                    raise
                print(f"Puerto {port} ocupado, intentando siguiente...")
                continue
        
        if not creds:
            print("\n❌ No se pudo obtener las credenciales")
            sys.exit(1)
        
        # Guardar token
        TOKEN_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(TOKEN_PATH, 'w', encoding='utf-8') as f:
            f.write(creds.to_json())
        
        print(f"\n✅ Token guardado exitosamente en: {TOKEN_PATH}")
        print(f"✅ Cuenta autorizada: proyectogenomia@gmail.com")
        print("\n¡Listo! Ahora puedes usar la API de Gmail.")
        
    except Exception as e:
        print(f"\n❌ Error durante la autenticación: {e}")
        print("\nSi el navegador no se abre automáticamente:")
        print("1. Copia la URL que aparece en la consola")
        print("2. Ábrela manualmente en tu navegador")
        print("3. Autoriza la aplicación con proyectogenomia@gmail.com")
        sys.exit(1)

if __name__ == '__main__':
    main()
