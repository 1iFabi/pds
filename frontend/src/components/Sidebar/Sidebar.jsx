import React, { useMemo, useState } from 'react'
import { LogOut, Dna, Activity, Heart, Globe, Pill, TestTube, User, ChevronDown, ChevronUp, KeyRound, UserX, Bot, MessageCircle, Grid3x3 } from 'lucide-react'
import ChangePasswordModal from '../ChangePasswordModal/ChangePasswordModal.jsx'
import DeleteAccountModal from '../DeleteAccountModal/DeleteAccountModal.jsx'
import './Sidebar.css'

const defaultIcons = [Dna, Activity, Heart, Globe, Pill, TestTube]

const Sidebar = ({ items = [], onLogout, user }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isProfileExpanded, setIsProfileExpanded] = useState(false)
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false)
  const [isAIExpanded, setIsAIExpanded] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)

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

  return (
    <div 
      className={`sidebar ${isHovered ? 'sidebar--unfolded' : 'sidebar--folded'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <img src="/cSolido.png" alt="GenomIA Logo" className="sidebar__logo" />
          {isHovered && <span className="sidebar__brand-text">Genom<span className="sidebar__brand-highlight">IA</span>.</span>}
        </div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__profile-section">
          <button 
            type="button" 
            className="sidebar__nav-item sidebar__profile-toggle"
            onClick={toggleProfile}
            title={!isHovered ? 'Perfil' : undefined}
          >
            <User size={20} className="sidebar__nav-icon" />
            {isHovered && (
              <>
                <span className="sidebar__nav-label">Perfil</span>
                {isProfileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </>
            )}
          </button>

          {isProfileExpanded && isHovered && (
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

        {isHovered && <div className="sidebar__divider" />}

        <div className="sidebar__categories-section">
          <button 
            type="button" 
            className="sidebar__nav-item sidebar__categories-toggle"
            onClick={toggleCategories}
            title={!isHovered ? 'Categorías' : undefined}
          >
            <Grid3x3 size={20} className="sidebar__nav-icon" />
            {isHovered && (
              <>
                <span className="sidebar__nav-label">Categorías</span>
                {isCategoriesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </>
            )}
          </button>

          {isCategoriesExpanded && isHovered && (
            <div className="sidebar__categories-content">
              <ul className="sidebar__categories-menu">
                {navItems.map((nav) => (
                  <li key={nav.label}>
                    <a 
                      href={nav.href} 
                      className="sidebar__categories-item"
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

        {isHovered && <div className="sidebar__divider" />}

        <div className="sidebar__ai-section">
          <button 
            type="button" 
            className="sidebar__nav-item sidebar__ai-toggle"
            onClick={toggleAI}
            title={!isHovered ? 'Pregunta a la IA' : undefined}
          >
            <Bot size={20} className="sidebar__nav-icon" />
            {isHovered && (
              <>
                <span className="sidebar__nav-label">Pregunta a la IA</span>
                {isAIExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </>
            )}
          </button>

          {isAIExpanded && isHovered && (
            <div className="sidebar__ai-content">
              <ul className="sidebar__ai-menu">
                <li>
                  <a href="#chatear-ia" className="sidebar__ai-item">
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
            onClick={onLogout}
            title={!isHovered ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={20} />
            {isHovered && <span>Cerrar sesión</span>}
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
    </div>
  )
}

export default Sidebar
