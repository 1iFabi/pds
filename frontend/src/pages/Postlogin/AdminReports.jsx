import React, { useState, useEffect } from 'react';
import { Search, Upload, Edit, Trash2, FileText, Menu, X } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import PatientVariantsModal from '../../components/PatientVariantsModal/PatientVariantsModal';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import './AdminReports.css';

const initialPatients = [
  {
    id: "P001",
    name: "María González",
    rut: "12.345.678-9",
    email: "maria.gonzalez@email.com",
    hasReport: true,
    reportDate: "2024-01-15",
    reportName: "reporte_genetico_maria.vcf",
  },
];

export default function AdminReports({ user }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [variantsModalOpen, setVariantsModalOpen] = useState(false);
  const [selectedPatientForVariants, setSelectedPatientForVariants] = useState(null);
  const [reportStatusFilter, setReportStatusFilter] = useState('todos');

  // Función para capitalizar primera letra
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiRequest(API_ENDPOINTS.GET_USERS, { method: 'GET' });
        if (response.ok && response.data) {
          const users = Array.isArray(response.data) ? response.data : response.data.results || [];
          // Filtrar para excluir usuarios con permisos de admin o staff
          const filteredUsers = users.filter(user => !user.is_staff && !user.is_superuser);
          
          // Mapear usuarios y obtener estado real de reportes
          const mappedPatients = await Promise.all(
            filteredUsers.map(async (user) => {
              let hasReport = false;
              let reportName = null;
              let reportDate = null;
              let serviceStatus = 'NO_PURCHASED';
              
              try {
                // Obtener estado real del reporte
                const statusUrl = `${API_ENDPOINTS.GET_USERS.replace('/users/', '/user-report-status/')}${user.id}/`;
                const statusResponse = await apiRequest(statusUrl, { method: 'GET' });
                if (statusResponse.ok) {
                  hasReport = statusResponse.data.has_report;
                  serviceStatus = statusResponse.data.service_status || 'NO_PURCHASED';
                  if (hasReport) {
                    reportName = statusResponse.data.report_filename;
                    reportDate = statusResponse.data.report_date;
                  }
                }
              } catch (error) {
                console.error(`Error fetching report status for user ${user.id}:`, error);
              }
              
              return {
                id: `P${String(user.id).padStart(3, '0')}`,
                userId: user.id,
                name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username || 'Sin nombre',
                rut: user.rut || 'N/A',
                email: user.email || 'N/A',
                hasReport: hasReport,
                reportDate: reportDate,
                reportName: reportName,
                serviceStatus: serviceStatus,
              };
            })
          );
          
          setPatients(mappedPatients);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
    clearToken();
    navigate('/');
  };

  const filteredPatients = patients.filter((patient) => {
    // Filtro de búsqueda
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.rut.includes(searchTerm) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de estado de reporte
    let matchesStatus = true;
    if (reportStatusFilter === 'sin_reporte') {
      matchesStatus = !patient.hasReport;
    } else if (reportStatusFilter === 'pendiente') {
      matchesStatus = !patient.hasReport && patient.serviceStatus === 'PENDING';
    } else if (reportStatusFilter === 'subido') {
      matchesStatus = patient.hasReport;
    }
    // 'todos' siempre es true

    return matchesSearch && matchesStatus;
  });

  const handleUpload = (patient) => {
    setSelectedPatient(patient);
    setUploadDialogOpen(true);
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setEditDialogOpen(true);
  };

  const handleDelete = (patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const extractRutFromFilename = (filename) => {
    // Formato esperado: nombre_rut.txt -> fayala_205165851.txt
    // Extrae todo después del último underscore y antes del .txt
    const match = filename.match(/_([0-9]+)\.txt$/);
    return match ? match[1] : null;
  };

  const confirmUpload = async () => {
    if (selectedPatient && selectedFile) {
      try {
        // Extraer RUT del nombre del archivo
        const rutFromFile = extractRutFromFilename(selectedFile.name);
        
        if (!rutFromFile) {
          alert('El nombre del archivo debe tener formato: nombre_rut.txt (ej: fayala_205165851.txt)');
          return;
        }
        
        // Validar que el RUT del archivo coincida con el RUT del paciente
        if (selectedPatient.rut !== 'N/A') {
          const rutClean = selectedPatient.rut.replace('-', '').replace('.', '');
          if (rutFromFile !== rutClean) {
            alert(`El RUT del archivo (${rutFromFile}) no coincide con el RUT del paciente (${selectedPatient.rut}). Por favor, verifica el archivo.`);
            return;
          }
        }
        
        // Leer archivo .txt
        const fileContent = await selectedFile.text();
        
        // Enviar al backend
        const response = await apiRequest(
          API_ENDPOINTS.UPLOAD_GENETIC_FILE,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: parseInt(selectedPatient.id.replace('P', '')),
              fileContent: fileContent,
              rutFromFile: rutFromFile,
              filename: selectedFile.name
            })
          }
        );
        
        if (response.ok) {
          // Actualizar la tabla localmente
          setPatients(
            patients.map((p) =>
              p.id === selectedPatient.id
                ? {
                    ...p,
                    hasReport: true,
                    reportDate: new Date().toISOString().split("T")[0],
                    reportName: selectedFile.name,
                  }
                : p
            )
          );
          setUploadDialogOpen(false);
          setSelectedFile(null);
          setSelectedPatient(null);
          alert(`Archivo procesado correctamente. ${response.data.snps_count} variantes genéticas agregadas.`);
        } else {
          alert('Error al procesar el archivo: ' + (response.data?.error || 'Error desconocido'));
        }
      } catch (error) {
        console.error('Error procesando archivo:', error);
        alert('Error al procesar el archivo genético');
      }
    }
  };

  const confirmEdit = async () => {
    if (selectedPatient && selectedFile) {
      try {
        // Extraer RUT del nombre del archivo
        const rutFromFile = extractRutFromFilename(selectedFile.name);
        
        if (!rutFromFile) {
          alert('El nombre del archivo debe tener formato: nombre_rut.txt (ej: fayala_205165851.txt)');
          return;
        }
        
        // Validar que el RUT del archivo coincida con el RUT del paciente
        if (selectedPatient.rut !== 'N/A') {
          const rutClean = selectedPatient.rut.replace('-', '').replace('.', '');
          if (rutFromFile !== rutClean) {
            alert(`El RUT del archivo (${rutFromFile}) no coincide con el RUT del paciente (${selectedPatient.rut}). Por favor, verifica el archivo.`);
            return;
          }
        }
        
        // Leer archivo .txt
        const fileContent = await selectedFile.text();
        
        // Enviar al backend
        const response = await apiRequest(
          API_ENDPOINTS.UPLOAD_GENETIC_FILE,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: parseInt(selectedPatient.id.replace('P', '')),
              fileContent: fileContent,
              rutFromFile: rutFromFile,
              filename: selectedFile.name
            })
          }
        );
        
        if (response.ok) {
          // Actualizar la tabla localmente
          setPatients(
            patients.map((p) =>
              p.id === selectedPatient.id
                ? {
                    ...p,
                    reportDate: new Date().toISOString().split("T")[0],
                    reportName: selectedFile.name,
                  }
                : p
            )
          );
          setEditDialogOpen(false);
          setSelectedFile(null);
          setSelectedPatient(null);
          alert(`Archivo procesado correctamente. ${response.data.snps_count} variantes genéticas agregadas.`);
        } else {
          alert('Error al procesar el archivo: ' + (response.data?.error || 'Error desconocido'));
        }
      } catch (error) {
        console.error('Error procesando archivo:', error);
        alert('Error al procesar el archivo genético');
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedPatient) {
      try {
        // Llamar al backend para eliminar
        const response = await apiRequest(
          API_ENDPOINTS.DELETE_GENETIC_FILE,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: parseInt(selectedPatient.id.replace('P', ''))
            })
          }
        );
        
        if (response.ok) {
          // Actualizar la tabla localmente
          setPatients(
            patients.map((p) =>
              p.id === selectedPatient.id
                ? {
                    ...p,
                    hasReport: false,
                    reportDate: null,
                    reportName: null,
                  }
                : p
            )
          );
          setDeleteDialogOpen(false);
          setSelectedPatient(null);
          alert(`Reporte eliminado correctamente. ${response.data.deleted_count} variantes removidas.`);
        } else {
          alert('Error al eliminar el archivo: ' + (response.data?.error || 'Error desconocido'));
        }
      } catch (error) {
        console.error('Error eliminando archivo:', error);
        alert('Error al eliminar el reporte genético');
      }
    }
  };

  const handleServiceStatusChange = async (patient, newStatus) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.UPDATE_SERVICE_STATUS,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: patient.userId,
            status: newStatus
          })
        }
      );
      
      if (response.ok) {
        // Actualizar estado localmente
        setPatients(
          patients.map((p) =>
            p.id === patient.id
              ? { ...p, serviceStatus: newStatus }
              : p
          )
        );
        alert('Estado actualizado correctamente');
      } else {
        alert('Error al actualizar el estado: ' + (response.data?.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const withReportCount = patients.filter((p) => p.hasReport).length;
  const withoutReportCount = patients.filter((p) => !p.hasReport).length;

  const handleViewVariants = (patient) => {
    if (patient.hasReport) {
      setSelectedPatientForVariants(patient);
      setVariantsModalOpen(true);
    }
  };

  if (loading) return <div></div>;

  return (
    <div className="admin-reports-wrapper">
      {isMobile && (
        <button 
          className="admin-reports__burger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      <aside className="admin-reports__sidebar">
        <AdminSidebar 
          onLogout={handleLogout} 
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </aside>

      <main className="admin-reports">
        <div className="admin-reports__header">
          <div className="admin-reports__headline">
            <h1 className="admin-reports__title">Administrar Reportes Genéticos</h1>
            <p className="admin-reports__subtitle">
              Gestiona y visualiza todos los reportes genéticos de los pacientes
            </p>
          </div>
        </div>

        <div className="admin-reports__container">
          <div className="admin-reports__search-card">
            <div className="admin-reports__search-top">
              <div className="admin-reports__search-input-container">
                <Search size={18} className="admin-reports__search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RUT o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-reports__search-input"
                />
              </div>
              <div className="admin-reports__status-filter-container">
                <label className="admin-reports__filter-label">Estado del Reporte</label>
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="admin-reports__status-filter"
                >
                  <option value="todos">Todos</option>
                  <option value="sin_reporte">Sin Reporte</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="subido">Subido</option>
                </select>
              </div>
            </div>

            <div className="admin-reports__stats">
              <div className="admin-reports__stat-item admin-reports__stat-item--with-icon" title="Reportes completados y subidos">
                <div className="admin-reports__stat-icon admin-reports__stat-icon--success">✓</div>
                <div className="admin-reports__stat-number">{withReportCount}</div>
                <div className="admin-reports__stat-label">Con Reporte</div>
              </div>
              <div className="admin-reports__stat-item admin-reports__stat-item--with-icon" title="Reportes pendientes de subir o procesar">
                <div className="admin-reports__stat-icon admin-reports__stat-icon--warning">!</div>
                <div className="admin-reports__stat-number">{withoutReportCount}</div>
                <div className="admin-reports__stat-label">Sin Reporte</div>
              </div>
              <div className="admin-reports__stat-item admin-reports__stat-item--with-icon" title="Total de pacientes en el sistema">
                <div className="admin-reports__stat-icon admin-reports__stat-icon--info">👥</div>
                <div className="admin-reports__stat-number">{patients.length}</div>
                <div className="admin-reports__stat-label">Total Pacientes</div>
              </div>
            </div>
          </div>

          <div className="admin-reports__table-card">
            <div className="admin-reports__table-header">
              <h2 className="admin-reports__table-title">Pacientes Registrados</h2>
              <p className="admin-reports__table-description">
                Lista completa de pacientes y el estado de sus reportes genéticos
              </p>
            </div>

            <div className="admin-reports__table-wrapper">
              <table className="admin-reports__table">
                <thead className="admin-reports__table-head">
                  <tr className="admin-reports__table-row">
                    <th className="admin-reports__table-cell">ID</th>
                    <th className="admin-reports__table-cell">Paciente</th>
                    <th className="admin-reports__table-cell">RUT</th>
                    <th className="admin-reports__table-cell">Email</th>
                    <th className="admin-reports__table-cell">Estado Reporte</th>
                    <th className="admin-reports__table-cell">Archivo</th>
                    <th className="admin-reports__table-cell">Fecha</th>
                    <th className="admin-reports__table-cell admin-reports__table-cell--align-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="admin-reports__table-body">
                  {filteredPatients.length === 0 ? (
                    <tr className="admin-reports__table-row">
                      <td colSpan="8" className="admin-reports__table-cell admin-reports__table-cell--center">
                        No se encontraron pacientes
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                      <tr key={patient.id} className="admin-reports__table-row">
                        <td className="admin-reports__table-cell admin-reports__table-cell--bold">
                          {patient.id}
                        </td>
                        <td className="admin-reports__table-cell">
                          {patient.hasReport ? (
                            <button
                              className="admin-reports__patient-name-btn"
                              onClick={() => handleViewVariants(patient)}
                              title="Ver variantes genéticas"
                            >
                              {patient.name}
                            </button>
                          ) : (
                            patient.name
                          )}
                        </td>
                        <td className="admin-reports__table-cell">{patient.rut}</td>
                        <td className="admin-reports__table-cell admin-reports__table-cell--muted">
                          {patient.email}
                        </td>
                        <td className="admin-reports__table-cell">
                          {patient.hasReport ? (
                            <span className="admin-reports__badge admin-reports__badge--success">
                              Completado
                            </span>
                          ) : (
                            <select
                              value={patient.serviceStatus}
                              onChange={(e) => handleServiceStatusChange(patient, e.target.value)}
                              className="admin-reports__service-status-select"
                            >
                              <option value="NO_PURCHASED">Sin Reporte</option>
                              <option value="PENDING">Pendiente</option>
                            </select>
                          )}
                        </td>
                        <td className="admin-reports__table-cell">
                          {patient.reportName ? (
                            <div className="admin-reports__file-cell">
                              <FileText size={16} className="admin-reports__file-icon" />
                              <span className="admin-reports__file-name" title={patient.reportName}>
                                {patient.reportName}
                              </span>
                            </div>
                          ) : (
                            <span className="admin-reports__table-cell--muted">-</span>
                          )}
                        </td>
                        <td className="admin-reports__table-cell admin-reports__table-cell--muted">
                          {patient.reportDate || "-"}
                        </td>
                        <td className="admin-reports__table-cell admin-reports__table-cell--actions">
                          <div className="admin-reports__actions">
                            {!patient.hasReport ? (
                              <button
                                className="admin-reports__action-btn admin-reports__action-btn--upload"
                                onClick={() => handleUpload(patient)}
                                title="Subir reporte"
                              >
                                <Upload size={18} />
                                <span>Subir</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  className="admin-reports__action-btn admin-reports__action-btn--edit"
                                  onClick={() => handleEdit(patient)}
                                  title="Editar reporte"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  className="admin-reports__action-btn admin-reports__action-btn--delete"
                                  onClick={() => handleDelete(patient)}
                                  title="Eliminar reporte"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {uploadDialogOpen && (
          <div className="admin-reports__overlay" onClick={() => setUploadDialogOpen(false)}>
            <div className="admin-reports__dialog" onClick={(e) => e.stopPropagation()}>
              <div className="admin-reports__dialog-header">
                <h2 className="admin-reports__dialog-title">Subir Reporte Genético</h2>
                <p className="admin-reports__dialog-description">
                  Sube el archivo de reporte genético para {selectedPatient?.name}
                </p>
              </div>
              <div className="admin-reports__dialog-content">
                <div className="admin-reports__form-group">
                  <label className="admin-reports__label">Archivo (.txt)</label>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="admin-reports__file-input"
                  />
                  {selectedFile && (
                    <p className="admin-reports__file-selected">
                      Archivo seleccionado: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="admin-reports__dialog-footer">
                <button className="admin-reports__btn admin-reports__btn--secondary" onClick={() => setUploadDialogOpen(false)}>
                  Cancelar
                </button>
                <button className="admin-reports__btn admin-reports__btn--primary" onClick={confirmUpload} disabled={!selectedFile}>
                  Subir archivo
                </button>
              </div>
            </div>
          </div>
        )}

        {editDialogOpen && (
          <div className="admin-reports__overlay" onClick={() => setEditDialogOpen(false)}>
            <div className="admin-reports__dialog" onClick={(e) => e.stopPropagation()}>
              <div className="admin-reports__dialog-header">
                <h2 className="admin-reports__dialog-title">Editar Reporte Genético</h2>
                <p className="admin-reports__dialog-description">
                  Reemplaza el archivo de reporte genético para {selectedPatient?.name}
                </p>
              </div>
              <div className="admin-reports__dialog-content">
                <div className="admin-reports__form-group">
                  <label className="admin-reports__label">Archivo actual</label>
                  <div className="admin-reports__current-file">
                    <FileText size={16} className="admin-reports__file-icon" />
                    <span>{selectedPatient?.reportName}</span>
                  </div>
                </div>
                <div className="admin-reports__form-group">
                  <label className="admin-reports__label">Nuevo archivo (.txt)</label>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="admin-reports__file-input"
                  />
                  {selectedFile && (
                    <p className="admin-reports__file-selected">
                      Nuevo archivo: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="admin-reports__dialog-footer">
                <button className="admin-reports__btn admin-reports__btn--secondary" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </button>
                <button className="admin-reports__btn admin-reports__btn--primary" onClick={confirmEdit} disabled={!selectedFile}>
                  Actualizar archivo
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteDialogOpen && (
          <div className="admin-reports__overlay" onClick={() => setDeleteDialogOpen(false)}>
            <div className="admin-reports__dialog" onClick={(e) => e.stopPropagation()}>
              <div className="admin-reports__dialog-header">
                <h2 className="admin-reports__dialog-title">Eliminar Reporte Genético</h2>
                <p className="admin-reports__dialog-description">
                  ¿Estás seguro de que deseas eliminar el reporte genético de {selectedPatient?.name}?
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="admin-reports__dialog-content">
                <div className="admin-reports__delete-warning">
                  <FileText size={16} className="admin-reports__warning-icon" />
                  <span>{selectedPatient?.reportName}</span>
                </div>
              </div>
              <div className="admin-reports__dialog-footer">
                <button className="admin-reports__btn admin-reports__btn--secondary" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </button>
                <button className="admin-reports__btn admin-reports__btn--danger" onClick={confirmDelete}>
                  Eliminar archivo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Patient Variants Modal */}
        <PatientVariantsModal
          isOpen={variantsModalOpen}
          onClose={() => setVariantsModalOpen(false)}
          patient={selectedPatientForVariants}
        />
      </main>
    </div>
  );
}
