import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Menu, Search, Bell, Moon, Sun, X, CheckCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    if (user?.username) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.username]);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await authService.getNotifications(user.username);
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await authService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.read).map(n => authService.markNotificationRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const toggleNotifPanel = () => {
    setShowNotifPanel(!showNotifPanel);
    if (!showNotifPanel && user?.username) {
      fetchNotifications();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <header className="dashboard-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onMenuClick}
          style={{ display: window.innerWidth <= 1024 ? 'block' : 'none', color: 'var(--text-secondary)' }}
        >
          <Menu size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="form-input" 
            style={{ paddingLeft: '2.5rem', width: window.innerWidth > 640 ? '300px' : '100%', border: 'none', backgroundColor: 'var(--bg-body)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-body)', transition: 'all 0.2s ease' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Bell */}
        <div ref={panelRef} style={{ position: 'relative' }}>
          <button 
            onClick={toggleNotifPanel}
            title="Notifications"
            style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', backgroundColor: showNotifPanel ? 'var(--color-primary-50)' : 'var(--bg-body)', position: 'relative', transition: 'all 0.2s ease' }}
          >
            <Bell size={20} style={{ color: showNotifPanel ? 'var(--color-primary-500)' : undefined }} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', top: '6px', right: '6px', 
                minWidth: '18px', height: '18px', 
                backgroundColor: 'var(--color-danger)', 
                borderRadius: '9999px', 
                color: 'white', 
                fontSize: '0.625rem', 
                fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid var(--bg-surface)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifPanel && (
            <div style={{
              position: 'absolute', top: '48px', right: 0,
              width: '380px', maxHeight: '440px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--border-radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 50,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              animation: 'modalEnter 0.2s ease-out'
            }}>
              {/* Header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Notifications</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-500)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotifPanel(false)} style={{ color: 'var(--text-secondary)' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                    <Bell size={36} style={{ color: 'var(--border-strong)', marginBottom: '0.75rem' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 15).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      style={{
                        padding: '0.875rem 1.25rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: notif.read ? 'transparent' : 'var(--color-primary-50)',
                        cursor: notif.read ? 'default' : 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: notif.read ? 500 : 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {notif.subject || 'Notification'}
                        </p>
                        {!notif.read && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-500)', flexShrink: 0, marginTop: '4px', marginLeft: '8px' }}></span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {notif.message || ''}
                      </p>
                      <p style={{ margin: '0.35rem 0 0', fontSize: '0.6875rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ height: '32px', width: '1px', backgroundColor: 'var(--border-subtle)', margin: '0 0.25rem' }}></div>

        {/* User Info */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => navigate('/profile')}
        >
          <div style={{ textAlign: 'right', display: window.innerWidth > 640 ? 'block' : 'none' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{user?.username}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{user?.role}</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;


