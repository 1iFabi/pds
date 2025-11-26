import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, UserPlus, UserMinus, RefreshCw, Menu, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminAnalystAccess.css';

const AdminAnalystAccess = ({ user }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    const resp = await apiRequest(API_ENDPOINTS.GET_USERS, { method: 'GET' });
    if (resp.ok) {
      setUsers(resp.data || []);
    } else {
      setError(resp.data?.error || 'No se pudo cargar la lista de usuarios.');
    }
    setLoading(false);
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
    loadUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesion', error);
    }
    clearToken();
    navigate('/');
  };

  const analystCount = useMemo(
    () => users.filter((u) => u.is_analyst || u.roles?.includes('ANALISTA')).length,
    [users],
  );

  const toggleAnalyst = async (targetUserId, grant) => {
    setSaving(true);
    setError('');
    setMessage('');
    const resp = await apiRequest(API_ENDPOINTS.ADMIN_ANALYSTS, {
      method: 'POST',
      body: JSON.stringify({ userId: targetUserId, grant }),
    });
    if (resp.ok) {
      const { is_analyst: isAnalystFlag } = resp.data;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUserId
            ? {
                ...u,
                is_analyst: typeof isAnalystFlag === 'boolean' ? isAnalystFlag : grant,
                roles: Array.from(new Set([...(u.roles || []), ...(grant ? ['ANALISTA'] : [])])).filter(
                  (r) => (grant ? true : r !== 'ANALISTA'),
                ),
              }
            : u,
        ),
      );
      setMessage(`Permiso de Analista ${grant ? 'asignado' : 'revocado'} correctamente.`);
    } else {
      setError(resp.data?.error || 'No se pudo actualizar el permiso.');
    }
    setSaving(false);
  };

  const getDisplayName = (u) => {
    if (u.first_name && u.last_name) {
      return `${u.first_name} ${u.last_name}`;
    }
    return u.name || u.first_name || u.username || u.email || 'Usuario';
  };

  const visibleUsers = useMemo(() => {
    let filtered = users.filter((u) => u.id !== user?.id);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => {
        const fullName = getDisplayName(u).toLowerCase();
        const email = (u.email || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        return fullName.includes(term) || email.includes(term) || username.includes(term);
      });
    }
    
    return filtered;
  }, [users, user?.id, searchTerm]);

  const isAdmin = user?.is_staff || user?.is_superuser || user?.roles?.includes('ADMIN');

  return (
    <div className="admin-analysts-wrapper">
      {isMobile && (
        <button 
          className="admin-analysts__burger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      <aside className="admin-analysts__sidebar">
        <AdminSidebar 
          onLogout={handleLogout} 
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isAdmin={isAdmin}
        />
      </aside>

      <main className="admin-analysts">
        <div className="admin-analysts__header">
          <div className="admin-analysts__headline">
            <h1 className="admin-analysts__title">Otorgar Permisos</h1>
            <p className="admin-analysts__subtitle">
              Asigna o revoca acceso a la vista Analista. Los usuarios con este permiso pueden operar en la vista avanzada de administración.
            </p>
          </div>
          <div className="admin-analysts__meta">
            <span>{analystCount} cuentas con acceso</span>
            <button type="button" className="admin-analysts__refresh" onClick={loadUsers} disabled={loading}>
              <RefreshCw size={16} />
              Recargar
            </button>
          </div>
        </div>

        <div className="admin-analysts__search-card">
          <div className="admin-analysts__search-input-container">
            <Search size={18} className="admin-analysts__search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-analysts__search-input"
            />
          </div>
        </div>

        {error && <div className="analyst-access__alert analyst-access__alert--error">{error}</div>}
        {message && <div className="analyst-access__alert analyst-access__alert--success">{message}</div>}

        <div className="analyst-access__card">
          <div className="analyst-access__card-header">
            <div>
              <h2>Usuarios</h2>
              <span className="analyst-access__subtitle">Activa el acceso de Analista según lo necesites</span>
            </div>
            <div className="analyst-access__legend">
              <span className="analyst-access__chip analyst-access__chip--admin">ADMIN</span>
              <span className="analyst-access__chip analyst-access__chip--analyst">ANALISTA</span>
            </div>
          </div>

          {loading ? (
            <div className="analyst-access__loading">Cargando usuarios...</div>
          ) : (
            <div className="analyst-access__table" role="table" aria-label="Usuarios y permisos">
              <div className="analyst-access__row analyst-access__row--head" role="row">
                <span>Usuario</span>
                <span>Email</span>
                <span>Roles</span>
                <span className="analyst-access__align-center">Vista Analista</span>
              </div>
              {visibleUsers.length === 0 ? (
                 <div className="analyst-access__loading">No se encontraron usuarios.</div>
              ) : (
                visibleUsers.map((u) => {
                  const isAnalyst = u.is_analyst || u.roles?.includes('ANALISTA');
                  const isAdminUser = u.is_admin || u.roles?.includes('ADMIN') || u.is_staff;
                  return (
                    <div key={u.id} className="analyst-access__row" role="row">
                      <span>{getDisplayName(u)}</span>
                      <span className="analyst-access__muted">{u.email}</span>
                      <span className="analyst-access__tags">
                        {isAdminUser && <span className="analyst-access__chip analyst-access__chip--admin">ADMIN</span>}
                        {isAnalyst && (
                          <span className="analyst-access__chip analyst-access__chip--analyst">ANALISTA</span>
                        )}
                        {!isAdminUser && !isAnalyst && (
                          <span className="analyst-access__chip analyst-access__chip--user">USUARIO</span>
                        )}
                      </span>
                      <span className="analyst-access__align-center">
                        <button
                          type="button"
                          className={`analyst-access__toggle ${isAnalyst ? 'analyst-access__toggle--on' : ''}`}
                          onClick={() => toggleAnalyst(u.id, !isAnalyst)}
                          disabled={saving}
                        >
                          {isAnalyst ? <UserMinus size={16} /> : <UserPlus size={16} />}
                          {isAnalyst ? 'Revocar' : 'Otorgar'}
                        </button>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminAnalystAccess;
