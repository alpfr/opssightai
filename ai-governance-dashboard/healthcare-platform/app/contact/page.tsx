'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    practiceName: '',
    practiceSize: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          practiceName: '',
          practiceSize: '',
          message: '',
        });
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-slate to-deep-slate/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Let's Talk About Better Care
          </h1>
          <p className="text-xl text-soft-sage max-w-3xl mx-auto leading-relaxed">
            Schedule a demo, ask questions, or just have a conversation about how Vantedge Health can help your practice thrive.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-deep-slate mb-6">
                Schedule Your Demo
              </h2>
              <p className="text-soft-sage mb-8">
                Fill out the form below and we'll get back to you within 24 hours. No sales pitch—just a conversation about your practice.
              </p>

              {submitted ? (
                <div className="bg-success/10 border-2 border-success rounded-xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-deep-slate mb-2">
                    Thank You!
                  </h3>
                  <p className="text-soft-sage">
                    We've received your message and will be in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-error/10 border-2 border-error rounded-xl p-4 mb-6">
                      <p className="text-error text-center">{error}</p>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-deep-slate mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-healing-teal focus:ring-2 focus:ring-healing-teal/20 outline-none transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-deep-slate mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-healing-teal focus:ring-2 focus:ring-healing-teal/20 outline-none transition-colors"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-deep-slate mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-healing-teal focus:ring-2 focus:ring-healing-teal/20 outline-none transition-colors"
                      placeholder="john.smith@practice.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-deep-slate mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-healing-teal focus:ring-2 focus:ring-healing-teal/20 outline-none transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="practiceName" className="block text-sm font-medium text-deep-slate mb-2">
                      Practice Name *
                    </label>
                    <input
                      type="text"
                      id="practiceName"
                      name="practiceName"
                      required
                      value={formData.practiceName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-healing-teal focus:ring-2 focus:ring-healing-teal/20 outline-none transition-colors"
                      placeholder="Your Practice Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="practiceSize" className="block text-sm font-medium text-deep-slate mb-2">
                      Practice Size *
                    </label>
                    <select
                      id="practiceSize"
                      name="practiceSize"
                      required
                      value={formData.practiceSize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-healing-teal focus:ring-2 focus:ring-healing-teal/20 outline-none transition-colors"
                    >
                      <option value="">Select practice size</option>
                      <option value="1">Solo practitioner (1 provider)</option>
                      <option value="2-5">Small practice (2-5 providers)</option>
                      <option value="6-10">Medium practice (6-10 providers)</option>
                      <option value="11+">Large practice (11+ providers)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-deep-slate mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-healing-teal focus:ring-2 focus:ring-healing-teal/20 outline-none transition-colors resize-none"
                      placeholder="Tell us about your practice and what you're looking for..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-healing-teal hover:bg-healing-teal/90 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Schedule Demo
                      </>
                    )}
                  </button>

                  <p className="text-sm text-soft-sage text-center">
                    By submitting this form, you agree to our privacy policy. We'll never share your information.
                  </p>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-deep-slate mb-6">
                Get in Touch
              </h2>
              <p className="text-soft-sage mb-8">
                Prefer to reach out directly? We're here to help.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="bg-healing-teal/10 p-3 rounded-lg flex-shrink-0">
                    <Mail className="w-6 h-6 text-healing-teal" />
                  </div>
                  <div>
                    <h3 className="font-bold text-deep-slate mb-1">Email</h3>
                    <a href="mailto:hello@vantedgehealth.com" className="text-healing-teal hover:underline">
                      hello@vantedgehealth.com
                    </a>
                    <p className="text-sm text-soft-sage mt-1">
                      We respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-healing-teal/10 p-3 rounded-lg flex-shrink-0">
                    <Phone className="w-6 h-6 text-healing-teal" />
                  </div>
                  <div>
                    <h3 className="font-bold text-deep-slate mb-1">Phone</h3>
                    <a href="tel:+18885551234" className="text-healing-teal hover:underline">
                      (888) 555-1234
                    </a>
                    <p className="text-sm text-soft-sage mt-1">
                      Monday - Friday, 8 AM - 6 PM CT
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-healing-teal/10 p-3 rounded-lg flex-shrink-0">
                    <MapPin className="w-6 h-6 text-healing-teal" />
                  </div>
                  <div>
                    <h3 className="font-bold text-deep-slate mb-1">Office</h3>
                    <p className="text-soft-sage">
                      123 Healthcare Drive<br />
                      Chicago, IL 60601
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-healing-teal/10 p-3 rounded-lg flex-shrink-0">
                    <Clock className="w-6 h-6 text-healing-teal" />
                  </div>
                  <div>
                    <h3 className="font-bold text-deep-slate mb-1">Business Hours</h3>
                    <p className="text-soft-sage">
                      Monday - Friday: 8 AM - 6 PM CT<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-deep-slate to-deep-slate/90 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">What to Expect</h3>
                <ul className="space-y-3">
                  {[
                    'Response within 24 hours',
                    '30-minute personalized demo',
                    'No sales pressure or obligations',
                    'Custom pricing for your practice',
                    'Answers to all your questions',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-healing-teal flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-deep-slate mb-4">
              Have Questions?
            </h2>
            <p className="text-xl text-soft-sage">
              Check out our resources or reach out directly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <a
              href="/pricing"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="bg-healing-teal/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-healing-teal/20 transition-colors">
                <CheckCircle className="w-6 h-6 text-healing-teal" />
              </div>
              <h3 className="text-xl font-bold text-deep-slate mb-2">Pricing</h3>
              <p className="text-soft-sage">
                View our transparent pricing and calculate your ROI
              </p>
            </a>

            <a
              href="/features"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="bg-healing-teal/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-healing-teal/20 transition-colors">
                <CheckCircle className="w-6 h-6 text-healing-teal" />
              </div>
              <h3 className="text-xl font-bold text-deep-slate mb-2">Features</h3>
              <p className="text-soft-sage">
                Explore all the features that make Vantedge unique
              </p>
            </a>

            <a
              href="/about"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="bg-healing-teal/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-healing-teal/20 transition-colors">
                <CheckCircle className="w-6 h-6 text-healing-teal" />
              </div>
              <h3 className="text-xl font-bold text-deep-slate mb-2">About Us</h3>
              <p className="text-soft-sage">
                Learn about our mission and the story behind Vantedge
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
