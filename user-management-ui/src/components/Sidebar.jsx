import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Shield, FileText, Users, BarChart3, User, LogOut, ChevronRight, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Shield, label: 'Policies', path: '/policies' },
    { icon: FileText, label: 'Claims', path: '/claims' },
    ...(isAdmin ? [
      { icon: Users, label: 'Users', path: '/users' },
      { icon: BarChart3, label: 'Reports', path: '/reports' },
    ] : []),
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <aside className="sidebar-container" style={{
      transform: window.innerWidth <= 1024 ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
    }}>
      {/* Logo Area */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))', borderRadius: '8px' }}>
          <Shield size={18} color="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>SmartSure</span>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Insurance Portal</span>
        </div>
        <button 
          style={{ display: window.innerWidth <= 1024 ? 'block' : 'none', marginLeft: 'auto', color: 'var(--text-secondary)' }} 
          onClick={onClose}
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            onClick={() => { if (window.innerWidth <= 1024) onClose(); }}
          >
            <item.icon size={20} />
            <span style={{ flex: 1 }}>{item.label}</span>
            <ChevronRight size={16} style={{ opacity: 0.5 }} />
          </NavLink>
        ))}
      </nav>

      {/* Footer Area / User Info */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.username || 'User'}</span>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: isAdmin ? 'var(--color-primary-500)' : 'var(--color-success)' }}>
              {user?.role || 'USER'}
            </span>
          </div>
        </div>
        <button 
          className="nav-item" 
          onClick={handleLogout} 
          style={{ width: '100%', color: 'var(--color-danger)', marginTop: '0.5rem' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


