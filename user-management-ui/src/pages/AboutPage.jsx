import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Target, Eye, Heart, Users, Award,
  Clock, CheckCircle, TrendingUp, ArrowRight, Sparkles
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div style={{ backgroundColor: 'var(--color-slate-950)', color: 'white', minHeight: '100vh', paddingTop: '5rem' }}>
      <div className="container" style={{ padding: '4rem 1.5rem' }}>

        {/* ─── Page Header ─── */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--color-primary-300)', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '1.5rem' }}>
            <Sparkles size={16} />
            <span>About SmartSure</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.15 }}>
            Insurance That Puts <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>People First</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-slate-400)', lineHeight: 1.7 }}>
            SmartSure was founded with a simple belief — insurance should be affordable, transparent, and effortless. We're on a mission to make protection accessible to every individual and every family.
          </p>
        </div>

        {/* ─── Our Values ─── */}
        <div className="grid-cols-3" style={{ marginBottom: '5rem' }}>
          {[
            { icon: Shield, title: 'Trust & Security', desc: 'Your personal and financial information is safeguarded with the highest standards of data privacy and encryption — because your trust is our foundation.', color: '#6366f1' },
            { icon: Target, title: 'Fast Claim Settlement', desc: 'We process claims within 24–48 hours. No red tape, no delays — just swift settlements when you need them most.', color: '#22c55e' },
            { icon: Eye, title: 'Complete Transparency', desc: 'No hidden clauses, no surprise charges, no fine print. Every policy is explained in plain language so you know exactly what you\'re getting.', color: '#f59e0b' }
          ].map((item, index) => (
            <div key={index} className="card" style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-slate-800)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: `${item.color}15`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, margin: '0 auto 1.5rem' }}>
                <item.icon size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--color-slate-400)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── Our Story ─── */}
        <div className="card" style={{ padding: '3.5rem', backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', position: 'relative', overflow: 'hidden', marginBottom: '5rem' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(circle at top right, rgba(99,102,241,0.06), transparent 60%)' }}></div>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '750px' }}>
            <p style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Our Story</p>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>Born From a Simple Idea — Insurance Should Be Easy</h2>
            <p style={{ color: 'var(--color-slate-400)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              SmartSure started when our founders experienced firsthand the frustrations of buying insurance — confusing terms, hidden exclusions, and claims that took months. They set out to build something better.
            </p>
            <p style={{ color: 'var(--color-slate-400)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Today, SmartSure serves over 50,000 policyholders across the country. From health and life insurance to vehicle and home coverage, we provide plans that are straightforward, fairly priced, and backed by industry-leading claim support.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
              {[
                { value: '50,000+', label: 'Policyholders' },
                { value: '₹200 Cr+', label: 'Claims Settled' },
                { value: '4.9★', label: 'Customer Rating' },
                { value: '15+', label: 'Insurance Plans' }
              ].map((stat, i) => (
                <div key={i}>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── What Makes Us Different ─── */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>What Makes Us Different</p>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>We're Not Just Another Insurance Company</h2>
            <p style={{ color: 'var(--color-slate-400)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Here's why thousands of customers choose SmartSure over traditional insurers.</p>
          </div>

          <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
            {[
              { icon: Clock, title: 'Claims in 48 Hours', desc: 'Most claims are reviewed and settled within 24–48 hours — not weeks or months like traditional insurance.' },
              { icon: Heart, title: '10,000+ Network Partners', desc: 'Cashless treatment at over 10,000 hospitals and service centers across the country.' },
              { icon: Users, title: 'Dedicated Support Team', desc: 'A real person picks up every time you call. Our support team is available 24/7 — no bots, no wait.' },
              { icon: CheckCircle, title: '100% Digital Process', desc: 'Buy policies, upload documents, file claims, and track status — all from your browser, zero paperwork.' },
              { icon: TrendingUp, title: 'No Price Surprises', desc: 'What you see is what you pay. Transparent premium calculation with no hidden fees or surcharges.' },
              { icon: Award, title: 'Award-Winning Service', desc: 'Rated #1 for customer satisfaction, recognized by leading industry bodies for innovation in insurance.' }
            ].map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.75rem', backgroundColor: 'var(--color-slate-900)', borderRadius: 'var(--border-radius-xl)', border: '1px solid var(--color-slate-800)', transition: 'border-color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-500)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-slate-800)'}>
                <div style={{ backgroundColor: 'rgba(99,102,241,0.1)', padding: '0.65rem', borderRadius: '12px', color: 'var(--color-primary-400)', flexShrink: 0 }}>
                  <item.icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--color-slate-400)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)', borderRadius: '24px', border: '1px solid rgba(99,102,241,0.2)' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>Join the SmartSure Family</h2>
          <p style={{ color: 'var(--color-slate-300)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Experience insurance the way it should be — simple, honest, and always there when you need it.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
              <span>Get Started Today</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/contact" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.05rem', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span>Contact Us</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
