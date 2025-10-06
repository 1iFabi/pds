import React from 'react';

// Componente de mensaje de error reutilizable
// Props:
// - message: string (mensaje a mostrar)
// - className: string opcional para estilos adicionales
// - small: boolean opcional para tamaño compacto (por defecto true)
const ErrorCard = ({ message = 'Error - Credenciales Incorrectas.', className = '', small = true }) => {
  return (
    <div
      role="alert"
      className={[
        'bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-900 dark:text-red-100 rounded-lg flex items-center transition duration-200 ease-in-out',
        small ? 'p-2 text-xs' : 'p-3 text-sm',
        className
      ].join(' ')}
    >
      <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0 mr-2 text-red-600" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <p className="font-semibold">{message}</p>
    </div>
  );
}

export default ErrorCard;
