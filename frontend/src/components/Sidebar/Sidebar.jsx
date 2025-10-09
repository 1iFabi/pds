import React, { useMemo, useState, useEffect } from 'react'
import { LogOut, Dna, Activity, Heart, Globe, Pill, TestTube, User, ChevronDown, ChevronUp, KeyRound, UserX, Bot, MessageCircle, Grid3x3, Menu, X } from 'lucide-react'
import ChangePasswordModal from '../ChangePasswordModal/ChangePasswordModal.jsx'
import DeleteAccountModal from '../DeleteAccountModal/DeleteAccountModal.jsx'
import './Sidebar.css'

const defaultIcons = [Dna, Activity, Heart, Globe, Pill, TestTube]

const Sidebar = ({ items = [], onLogout, user, isMobileMenuOpen = false, setIsMobileMenuOpen = () => {} }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isProfileExpanded, setIsProfileExpanded] = useState(false)
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false)
  const [isAIExpanded, setIsAIExpanded] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024)
      if (window.innerWidth > 1024 && setIsMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobileMenuOpen])

  // Bloquear scroll del body cuando el menú está abierto en móviles
  useEffect(() => {
    if (!isMobile) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = isMobileMenuOpen ? 'hidden' : prev || ''
    return () => {
      html.style.overflow = prev || ''
    }
  }, [isMobileMenuOpen, isMobile])

  const navItems = useMemo(() => {
    return items.map((it, idx) => {
      const Icon = defaultIcons[idx % defaultIcons.length]
      return {
        label: it.label ?? String(it),
        href: it.href ?? '#',
        Icon,
      }
    })
  }, [items])

  const displayName = useMemo(() => {
    return user?.first_name || user?.firstName || user?.name || 'Usuario'
  }, [user])

  const toggleProfile = (e) => {
    e.preventDefault()
    setIsProfileExpanded(!isProfileExpanded)
  }

  const toggleCategories = (e) => {
    e.preventDefault()
    setIsCategoriesExpanded(!isCategoriesExpanded)
  }

  const toggleAI = (e) => {
    e.preventDefault()
    setIsAIExpanded(!isAIExpanded)
  }

  const closeMenuAndNavigate = (href) => (e) => {
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  const isExpanded = isHovered;

  return (
    <>
      {/* Overlay para cerrar el menú en móviles */}
      <div 
        className={`sidebar__overlay ${isMobile && isMobileMenuOpen ? 'sidebar__overlay--open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      <aside 
        className={`sidebar ${
          isExpanded ? 'sidebar--unfolded' : 'sidebar--folded'
        } ${
          isMobile && isMobileMenuOpen ? 'sidebar--mobile-open' : ''
        }`}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <img src="/cSolido.png" alt="GenomIA Logo" className="sidebar__logo" />
          {isExpanded && !isMobile && <span className="sidebar__brand-text">Genom<span className="sidebar__brand-highlight">IA</span>.</span>}
        </div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__profile-section">
          <button 
            type="button" 
            className="sidebar__nav-item sidebar__profile-toggle"
            onClick={toggleProfile}
            title={!isExpanded && !isMobile ? 'Perfil' : undefined}
          >
            <User size={20} className="sidebar__nav-icon" />
            {(isExpanded || isMobile) && (
              <>
                <span className="sidebar__nav-label">Perfil</span>
                {isProfileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </>
            )}
          </button>

          {isProfileExpanded && (isExpanded || isMobile) && (
            <div className="sidebar__profile-content">
              <div className="sidebar__profile-greeting">
                Hola {displayName}
              </div>
              <ul className="sidebar__profile-menu">
                <li>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsChangePasswordModalOpen(true);
                    }}
                    className="sidebar__profile-item sidebar__profile-button"
                  >
                    <KeyRound size={18} className="sidebar__profile-icon" />
                    <span>Cambiar contraseña</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsDeleteAccountModalOpen(true)
                    }}
                    className="sidebar__profile-item sidebar__profile-item--danger sidebar__profile-button"
                  >
                    <UserX size={18} className="sidebar__profile-icon" />
                    <span>Eliminar cuenta</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {(isExpanded || isMobile) && <div className="sidebar__divider" />}

        <div className="sidebar__categories-section">
          <button 
            type="button" 
            className="sidebar__nav-item sidebar__categories-toggle"
            onClick={toggleCategories}
            title={!isExpanded && !isMobile ? 'Categorías' : undefined}
          >
            <Grid3x3 size={20} className="sidebar__nav-icon" />
            {(isExpanded || isMobile) && (
              <>
                <span className="sidebar__nav-label">Categorías</span>
                {isCategoriesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </>
            )}
          </button>

          {isCategoriesExpanded && (isExpanded || isMobile) && (
            <div className="sidebar__categories-content">
              <ul className="sidebar__categories-menu">
                {navItems.map((nav) => (
                  <li key={nav.label}>
                    <a 
                      href={nav.href} 
                      className="sidebar__categories-item"
                      onClick={closeMenuAndNavigate(nav.href)}
                    >
                      <nav.Icon size={18} className="sidebar__categories-icon" />
                      <span>{nav.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {(isExpanded || isMobile) && <div className="sidebar__divider" />}

        <div className="sidebar__ai-section">
          <button 
            type="button" 
            className="sidebar__nav-item sidebar__ai-toggle"
            onClick={toggleAI}
            title={!isExpanded && !isMobile ? 'Pregunta a la IA' : undefined}
          >
            <Bot size={20} className="sidebar__nav-icon" />
            {(isExpanded || isMobile) && (
              <>
                <span className="sidebar__nav-label">Pregunta a la IA</span>
                {isAIExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </>
            )}
          </button>

          {isAIExpanded && (isExpanded || isMobile) && (
            <div className="sidebar__ai-content">
              <ul className="sidebar__ai-menu">
                <li>
                  <a 
                    href="#chatear-ia" 
                    className="sidebar__ai-item"
                    onClick={closeMenuAndNavigate('#chatear-ia')}
                  >
                    <MessageCircle size={18} className="sidebar__ai-icon" />
                    <span>Chatea con la IA</span>
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar__footer">
        {onLogout && (
          <button 
            type="button" 
            className="sidebar__logout" 
            onClick={() => {
              if (isMobile) setIsMobileMenuOpen(false)
              onLogout()
            }}
            title={!isExpanded && !isMobile ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={20} />
            {(isExpanded || isMobile) && <span>Cerrar sesión</span>}
          </button>
        )}
      </div>

      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => {
          setIsDeleteAccountModalOpen(false)
          setIsProfileExpanded(false)
        }}
        userName={displayName}
      />
      </aside>
    </>
  )
}

export default Sidebar
