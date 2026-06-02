import React, { useState } from 'react';
import {
  Mail, Phone, MapPin, Send, Loader, Clock,
  MessageCircle, HelpCircle, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const faqs = [
  {
    q: 'How quickly can I get insured?',
    a: 'You can purchase a policy and get covered in as little as 5 minutes. Simply create an account, choose your plan, complete the payment, and your policy is instantly activated.'
  },
  {
    q: 'How do I file a claim?',
    a: 'Log in to your SmartSure dashboard, go to the Claims section, upload your supporting documents (medical bills, FIR copy, photos, etc.), and submit. Our team reviews most claims within 24–48 hours.'
  },
  {
    q: 'What documents do I need for a claim?',
    a: 'This depends on the type of claim. Generally you\'ll need proof of the incident (medical reports, police FIR, repair estimates) and your policy documents. Our claims team will guide you through the process.'
  },
  {
    q: 'Can I cancel my policy and get a refund?',
    a: 'Yes, you can cancel within the free-look period (usually 15–30 days) for a full refund. After that, cancellation terms vary by policy type. Check your policy details or contact our support team.'
  },
  {
    q: 'Is my personal data safe with SmartSure?',
    a: 'Absolutely. We use bank-grade encryption and follow strict data privacy protocols to ensure your personal and financial information is always protected.'
  }
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/send-notification', {
        email: 'singhhimani623@gmail.com',
        username: 'admin',
        subject: `[Contact Form] ${form.subject}`,
        message: `New message from the SmartSure Contact Form:\n\nName: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`
      });
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-slate-950)', color: 'white', minHeight: '100vh', paddingTop: '5rem' }}>
      <div className="container" style={{ padding: '4rem 1.5rem' }}>

        {/* ─── Page Header ─── */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
            We're Here to <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Help You</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-slate-400)', lineHeight: 1.7 }}>
            Whether you have a question about your policy, need help with a claim, or just want to learn more — our team is ready to assist you.
          </p>
        </div>

        {/* ─── Quick Contact Cards ─── */}
        <div className="grid-cols-4" style={{ marginBottom: '4rem' }}>
          {[
            { icon: Phone, title: 'Call Us', text: '+1 (555) 000-0000', sub: 'Mon–Sun, 24/7', color: '#22c55e' },
            { icon: Mail, title: 'Email Us', text: 'support@smartsure.com', sub: 'Reply within 24 hrs', color: '#6366f1' },
            { icon: MapPin, title: 'Head Office', text: '123 SmartSure Ave', sub: 'Tech City, IN 400001', color: '#f59e0b' },
            { icon: Clock, title: 'Working Hours', text: 'Always Available', sub: '24/7 Customer Support', color: '#06b6d4' }
          ].map((item, index) => (
            <div key={index} className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', textAlign: 'center', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-slate-800)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: `${item.color}15`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, margin: '0 auto 1rem' }}>
                <item.icon size={22} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{item.text}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', marginTop: '0.25rem' }}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* ─── Contact Form + Help Topics ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', marginBottom: '5rem' }}>
          {/* Left: Help Topics */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-slate-200)' }}>Popular Help Topics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: FileText, text: 'How to buy a new policy' },
                { icon: HelpCircle, text: 'Understanding your premium' },
                { icon: MessageCircle, text: 'Filing & tracking claims' },
                { icon: FileText, text: 'Policy renewal & cancellation' },
                { icon: HelpCircle, text: 'Updating personal details' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', backgroundColor: 'var(--color-slate-900)', borderRadius: '12px', border: '1px solid var(--color-slate-800)', cursor: 'pointer', transition: 'border-color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-500)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-slate-800)'}>
                  <div style={{ color: 'var(--color-primary-400)', flexShrink: 0 }}>
                    <item.icon size={18} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-slate-300)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="card" style={{ padding: '2.5rem', backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(circle at top right, rgba(99,102,241,0.04), transparent 50%)' }}></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>Send Us a Message</h3>
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.9rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>We typically respond within a few hours during business days.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-input"
                    placeholder="priya@example.com"
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Question about my health plan"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="form-input"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                {loading ? <Loader className="animate-spin" size={20} /> : <><Send size={16} /> <span>Send Message</span></>}
              </button>
            </form>
          </div>
        </div>

        {/* ─── FAQ Section ─── */}
        <div style={{ maxWidth: '800px', margin: '0 auto 3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>FAQ</p>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--color-slate-400)', fontSize: '1.05rem' }}>Quick answers to common questions about SmartSure.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{ backgroundColor: 'var(--color-slate-900)', borderRadius: '14px', border: `1px solid ${openFaq === i ? 'var(--color-primary-500)' : 'var(--color-slate-800)'}`, overflow: 'hidden', transition: 'border-color 0.3s ease' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', color: 'white', fontWeight: 600, fontSize: '1rem', textAlign: 'left', cursor: 'pointer', background: 'transparent', border: 'none' }}
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} color="var(--color-primary-400)" /> : <ChevronDown size={18} color="var(--color-slate-500)" />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.5rem 1.25rem', color: 'var(--color-slate-400)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
