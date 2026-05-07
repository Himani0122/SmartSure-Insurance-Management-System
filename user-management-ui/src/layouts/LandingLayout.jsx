import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

const LandingLayout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <div className="app-container" style={{ backgroundColor: 'var(--color-slate-950)' }}>
      <header className="public-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: scrolled ? 'rgba(2, 6, 23, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-slate-800)' : '1px solid transparent',
        transition: 'all var(--transition-normal)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.25rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: 'var(--color-primary-600)', borderRadius: '10px' }}>
              <Shield size={20} color="white" />
            </div>
            SmartSure
          </Link>

          <nav className="public-nav" style={{ display: window.innerWidth > 768 ? 'flex' : 'none' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{ color: location.pathname === link.path ? 'var(--color-primary-400)' : 'var(--color-slate-300)' }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div style={{ display: window.innerWidth > 768 ? 'flex' : 'none', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" style={{ color: 'var(--color-slate-300)', fontWeight: 600, fontSize: '0.875rem' }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>

          <button 
            style={{ display: window.innerWidth <= 768 ? 'block' : 'none', color: 'var(--color-slate-300)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--color-slate-950)', borderBottom: '1px solid var(--color-slate-800)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: location.pathname === link.path ? 'var(--color-primary-400)' : 'var(--color-slate-300)', fontWeight: 600, fontSize: '1.125rem' }}
              >
                {link.name}
              </Link>
            ))}
            <div style={{ height: '1px', backgroundColor: 'var(--color-slate-800)', margin: '0.5rem 0' }}></div>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'white', fontWeight: 600, textAlign: 'center', padding: '0.5rem' }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)} style={{ width: '100%' }}>Get Started</Link>
          </div>
        )}
      </header>

      <main style={{ flex: 1, paddingTop: '76px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default LandingLayout;
