import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Store, Leaf, MessageSquare } from 'lucide-react';
import MarketMap from '../components/shared/MarketMap.jsx';
import { useToast } from '../components/shared/index.jsx';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast('Message sent! Our support team will get back to you shortly.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 600);
  };

  const hubLocations = [
    {
      name: 'MarketLink Central Farmers Hub',
      address: 'Old Exhibition Ground, M.A Jinnah Road',
      city: 'Karachi',
      lat: 24.8607,
      lng: 67.0011,
      marketDays: ['Friday', 'Saturday', 'Sunday'],
      openTime: '08:00 AM',
      closeTime: '02:00 PM',
    },
    {
      name: 'Clifton Organic Weekend Station',
      address: 'Block 4 Park Grounds, Clifton',
      city: 'Karachi',
      lat: 24.8258,
      lng: 67.0289,
      marketDays: ['Saturday', 'Sunday'],
      openTime: '09:00 AM',
      closeTime: '01:00 PM',
    },
  ];

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-hero page-hero-banner">
        <img src="/dan-meyers-IQVFVH0ajag-unsplash.jpg" alt="Contact Banner" className="page-hero-bg" />
        <div className="page-hero-overlay" />
        <div className="container contact-hero__content page-hero-content">
          <div className="contact-hero__badge">
            <MessageSquare size={14} /> Get in Touch
          </div>
          <h1 className="contact-hero__title">Contact MarketLink Team</h1>
          <p className="contact-hero__subtitle">
            Have questions about local market pickups, organic grower onboarding, or order reservations? We are here to support you!
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="contact-layout-grid">
          {/* Contact Info Column */}
          <div className="contact-info-col">
            <h2 className="contact-section-title">Support & Market Inquiries</h2>
            <p className="contact-section-lead">
              Reach out to our customer care and farmer community coordinators:
            </p>

            <div className="contact-cards-list">
              <div className="contact-info-card">
                <div className="info-icon-circle green">
                  <Mail size={20} />
                </div>
                <div>
                  <strong>Email Support:</strong>
                  <p>support@marketlink.com</p>
                  <small>Response within 24 hours</small>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="info-icon-circle blue">
                  <Phone size={20} />
                </div>
                <div>
                  <strong>Direct Helpline:</strong>
                  <p>+92 (300) 123-4567</p>
                  <small>Mon – Sun: 8:00 AM – 6:00 PM</small>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="info-icon-circle peach">
                  <MapPin size={20} />
                </div>
                <div>
                  <strong>Headquarters & Central Hub:</strong>
                  <p>Main Farmers Market Pavilion, Karachi, Pakistan</p>
                  <small>Community agricultural desk</small>
                </div>
              </div>
            </div>

            <div className="farmer-onboarding-callout">
              <Leaf size={24} className="text-emerald-600" />
              <div>
                <strong>Are you a local organic grower?</strong>
                <p>Register as a farmer to list your fresh harvests for weekend market pickups with zero upfront fees.</p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <h3 className="form-card-title">Send Us a Direct Message</h3>

              {submitted ? (
                <div className="message-sent-banner">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                  <h4>Message Delivered!</h4>
                  <p>Thank you for reaching out. We have received your inquiry and will respond to your email shortly.</p>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-name">Your Full Name *</label>
                    <input
                      type="text"
                      id="contact-name"
                      placeholder="e.g. Ayesha Khan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">Email Address *</label>
                    <input
                      type="email"
                      id="contact-email"
                      placeholder="e.g. ayesha@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-subject">Topic / Subject</label>
                    <input
                      type="text"
                      id="contact-subject"
                      placeholder="e.g. Question regarding pickup timeslot"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-message">Your Message *</label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      placeholder="How can we assist you?..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="form-textarea"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                    style={{ marginTop: '12px' }}
                  >
                    <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="contact-map-section mt-12">
          <h2 className="section-title mb-4 text-center">Visit Our Community Pickup Locations</h2>
          <MarketMap
            locations={hubLocations}
            height="420px"
            title="Local Pickup Hubs & Community Desks"
          />
        </div>
      </div>
    </div>
  );
}
