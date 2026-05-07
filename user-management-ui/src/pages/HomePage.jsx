import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ArrowRight, Heart, Car, Home as HomeIcon,
  Zap, Lock, Globe, CheckCircle, Clock, FileText,
  Users, Award, TrendingUp, Star, Phone, Umbrella
} from 'lucide-react';

const HomePage = () => {
  return (
    <div style={{ backgroundColor: 'var(--color-slate-950)', color: 'white' }}>

      {/* ─── Hero Section ─── */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', padding: '7rem 2rem 6rem' }}>
        <div style={{ position: 'absolute', top: '-10rem', right: '-10rem', width: '25rem', height: '25rem', backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: '50%', filter: 'blur(4rem)' }}></div>
        <div style={{ position: 'absolute', bottom: '-12rem', left: '-8rem', width: '20rem', height: '20rem', backgroundColor: 'rgba(168,85,247,0.06)', borderRadius: '50%', filter: 'blur(4rem)' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--color-primary-300)', fontSize: 'var(--font-size-sm)', fontWeight: 500, margin: '0 auto 2rem' }}>
            <Shield size={16} />
            <span>Trusted by 50,000+ Policyholders Nationwide</span>
          </div>

          <h1 className="hero-title">
            Insurance Made Simple, Coverage Made Strong
          </h1>

          <p className="hero-subtitle">
            Protect your family, your health, your home, and your future — all in one place. Get personalized coverage, instant quotes, and hassle-free claims with SmartSure.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              <span>Get Your Free Quote</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.125rem', backgroundColor: 'var(--color-slate-800)', color: 'white', border: '1px solid var(--color-slate-700)' }}>
              <span>Why SmartSure?</span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(99,102,241,0.15)' }}>
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '₹200Cr+', label: 'Claims Settled' },
              { value: '98.5%', label: 'Claim Approval Rate' },
              { value: '24/7', label: 'Customer Support' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)', marginTop: '0.25rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Coverage Options ─── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Our Plans</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Comprehensive Coverage for Every Need</h2>
            <p style={{ color: 'var(--color-slate-400)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>Choose from a wide range of insurance plans designed to keep you and your loved ones protected at every stage of life.</p>
          </div>

          <div className="grid-cols-3">
            {[
              { icon: Heart, title: 'Health Insurance', desc: 'Complete medical coverage including hospitalization, surgeries, prescription drugs, and preventive care for your entire family.', color: '#ef4444' },
              { icon: Car, title: 'Vehicle Insurance', desc: 'Bumper-to-bumper protection for your car or two-wheeler — covering accidents, theft, natural calamities, and third-party liability.', color: '#f59e0b' },
              { icon: HomeIcon, title: 'Home Insurance', desc: 'Safeguard your home and valuables against fire, floods, burglary, and structural damage with comprehensive property coverage.', color: '#22c55e' },
              { icon: Umbrella, title: 'Life Insurance', desc: 'Secure your family\u2019s financial future with flexible term plans, endowment policies, and guaranteed income benefits.', color: '#6366f1' },
              { icon: TrendingUp, title: 'Investment Plans', desc: 'Grow your wealth while staying protected with ULIPs, pension plans, and market-linked savings options.', color: '#06b6d4' },
              { icon: Shield, title: 'Travel Insurance', desc: 'Worry-free travel worldwide — covering trip cancellations, medical emergencies abroad, lost baggage, and flight delays.', color: '#a855f7' }
            ].map((item, index) => (
              <div key={index} className="card" style={{ padding: '2rem', backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-slate-800)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ width: '52px', height: '52px', backgroundColor: `${item.color}15`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: '1.5rem' }}>
                  <item.icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-slate-400)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-slate-900)', borderTop: '1px solid var(--color-slate-800)', borderBottom: '1px solid var(--color-slate-800)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How It Works</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Get Covered in 3 Easy Steps</h2>
            <p style={{ color: 'var(--color-slate-400)', fontSize: '1.125rem' }}>No paperwork, no lengthy processes — just simple, transparent insurance.</p>
          </div>

          <div className="grid-cols-3">
            {[
              { step: '01', icon: FileText, title: 'Choose Your Plan', desc: 'Browse our plans, compare benefits, and find the perfect coverage tailored to your needs and budget.' },
              { step: '02', icon: CheckCircle, title: 'Sign Up & Pay', desc: 'Create your account, fill in your details, and complete your purchase securely — all online in minutes.' },
              { step: '03', icon: Clock, title: 'You\'re Covered!', desc: 'Your policy is instantly activated. Track your coverage, download documents, and file claims anytime.' }
            ].map((item, index) => (
              <div key={index} style={{ textAlign: 'center', padding: '2.5rem 2rem', position: 'relative' }}>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: 'rgba(99,102,241,0.08)', position: 'absolute', top: '0.5rem', left: '50%', transform: 'translateX(-50%)' }}>{item.step}</div>
                <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(99,102,241,0.25)' }}>
                  <item.icon size={28} color="white" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-slate-400)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose SmartSure ─── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="grid-cols-2" style={{ alignItems: 'center', gap: '4rem' }}>
            <div>
              <p style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Why SmartSure</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>Protection You Can Trust, Service You Deserve</h2>
              <p style={{ color: 'var(--color-slate-400)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
                We believe insurance should be straightforward and stress-free. SmartSure combines transparent pricing, lightning-fast claims, and world-class customer support to give you peace of mind every single day.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { icon: Lock, text: 'Your data is protected with bank-grade security' },
                  { icon: Zap, text: 'Claims processed within 24–48 hours' },
                  { icon: Globe, text: 'Coverage accepted at 10,000+ hospitals & service centers' },
                  { icon: Phone, text: '24/7 dedicated customer support by real people' },
                  { icon: Award, text: 'Rated #1 for customer satisfaction 3 years running' }
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(99,102,241,0.1)', padding: '0.6rem', borderRadius: '10px', color: 'var(--color-primary-400)', flexShrink: 0 }}>
                      <item.icon size={18} />
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--color-slate-300)', fontSize: '1rem' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '2.5rem', backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { label: 'Claims Approval Rate', value: '98.5%', color: 'var(--color-primary-400)' },
                  { label: 'Average Claim Settlement', value: '< 48 hrs', color: 'var(--color-success)' },
                  { label: 'Customer Satisfaction', value: '4.9 / 5.0', color: '#f59e0b' },
                  { label: 'Network Hospitals', value: '10,000+', color: '#06b6d4' }
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', backgroundColor: 'var(--color-slate-950)', borderRadius: '14px', border: '1px solid var(--color-slate-800)' }}>
                    <span style={{ color: 'var(--color-slate-300)', fontWeight: 500 }}>{stat.label}</span>
                    <span style={{ color: stat.color, fontWeight: 700, fontSize: '1.2rem' }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-slate-900)', borderTop: '1px solid var(--color-slate-800)', borderBottom: '1px solid var(--color-slate-800)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Testimonials</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>What Our Customers Say</h2>
            <p style={{ color: 'var(--color-slate-400)', fontSize: '1.125rem' }}>Real stories from real policyholders who trust SmartSure.</p>
          </div>

          <div className="grid-cols-3">
            {[
              { name: 'Priya Sharma', role: 'Health Plan Holder', text: 'Filing a claim was incredibly smooth. I submitted my documents online and received my settlement within 36 hours. SmartSure truly delivers on its promise.', stars: 5 },
              { name: 'Rahul Mehta', role: 'Vehicle & Home Plan', text: 'I insured both my car and my apartment through SmartSure. The pricing was transparent with zero hidden charges. Best decision I\'ve made for my family\'s safety.', stars: 5 },
              { name: 'Anita Desai', role: 'Life Insurance Holder', text: 'Their customer support is outstanding. When I had questions about my term plan, the team walked me through every detail patiently. Highly recommend!', stars: 5 }
            ].map((t, i) => (
              <div key={i} className="card" style={{ padding: '2rem', backgroundColor: 'var(--color-slate-950)', borderColor: 'var(--color-slate-800)' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{ color: 'var(--color-slate-300)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ borderTop: '1px solid var(--color-slate-800)', paddingTop: '1rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</p>
                  <p style={{ color: 'var(--color-slate-500)', fontSize: '0.8rem' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%)', borderRadius: '24px', border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-5rem', right: '-5rem', width: '15rem', height: '15rem', background: 'rgba(99,102,241,0.08)', borderRadius: '50%', filter: 'blur(3rem)' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to Protect What Matters?</h2>
              <p style={{ color: 'var(--color-slate-300)', fontSize: '1.15rem', maxWidth: '550px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
                Join thousands of satisfied customers who trust SmartSure for their insurance needs. Get your personalized quote in under 2 minutes.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                  <span>Start Your Free Quote</span>
                  <ArrowRight size={20} />
                </Link>
                <Link to="/contact" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <Phone size={18} />
                  <span>Talk to an Advisor</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: '3rem 0', textAlign: 'center', borderTop: '1px solid var(--color-slate-800)', backgroundColor: 'var(--color-slate-950)' }}>
        <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem' }}>&copy; {new Date().getFullYear()} SmartSure Insurance Pvt. Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
