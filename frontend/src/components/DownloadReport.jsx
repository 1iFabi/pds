import React, { useState } from 'react';
import { API_ENDPOINTS, getToken } from '../config/api';

const DownloadReport = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDownload = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            // Aseguramos que la URL base termine sin barra y agregamos el path
            const baseUrl = API_ENDPOINTS.BASE_URL.endsWith('/') 
                ? API_ENDPOINTS.BASE_URL.slice(0, -1) 
                : API_ENDPOINTS.BASE_URL;
            
            const response = await fetch(`${baseUrl}/api/auth/report/pdf/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Reporte_Genetico.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            setError('No se pudo descargar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button 
                onClick={handleDownload} 
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                style={{
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Generando PDF...' : 'Descargar Reporte Genético'}
            </button>
            {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
        </div>
    );
};

export default DownloadReport;
