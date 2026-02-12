import { ArrowRight, Shield, Users, Heart, Clock, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vantedge Health - Returning Humanity to Healthcare',
  description: 'AI-driven healthcare platform solving the Small Practice Squeeze. Empowering small practices with Clinical-First AI, Closed-Loop Care, and RADICAL Transparency.',
};

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-deep-slate via-deep-slate to-deep-slate/90 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Returning Humanity to Healthcare
              </h1>
              <p className="text-xl text-soft-sage mb-8 leading-relaxed">
                Vantedge Health uses Agentic AI to solve the Small Practice Squeeze—so doctors can focus on patients, not paperwork.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-healing-teal hover:bg-healing-teal/90 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg"
                >
                  Schedule a Demo
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg border border-white/20"
                >
                  Learn Our Story
                </Link>
              </div>
            </div>

            {/* Right Column - Logo/Visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Hexagon with pulse icon */}
                <div className="w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Hexagon outline */}
                    <polygon
                      points="100,10 170,50 170,130 100,170 30,130 30,50"
                      fill="none"
                      stroke="#1ABC9C"
                      strokeWidth="3"
                      className="opacity-50"
                    />
                    {/* Connection nodes */}
                    <circle cx="30" cy="70" r="6" fill="#1ABC9C" />
                    <circle cx="30" cy="110" r="6" fill="#1ABC9C" />
                    <circle cx="170" cy="70" r="6" fill="#1ABC9C" />
                    <circle cx="170" cy="110" r="6" fill="#1ABC9C" />
                    <circle cx="180" cy="90" r="6" fill="#1ABC9C" />
                    {/* Connection lines */}
                    <line x1="30" y1="70" x2="80" y2="70" stroke="#1ABC9C" strokeWidth="2" />
                    <line x1="30" y1="110" x2="80" y2="110" stroke="#1ABC9C" strokeWidth="2" />
                    <line x1="120" y1="70" x2="170" y2="70" stroke="#1ABC9C" strokeWidth="2" />
                    <line x1="120" y1="110" x2="170" y2="110" stroke="#1ABC9C" strokeWidth="2" />
                    <line x1="170" y1="90" x2="180" y2="90" stroke="#1ABC9C" strokeWidth="2" />
                    {/* Pulse/heartbeat line */}
                    <path
                      d="M 60,90 L 80,90 L 90,60 L 100,120 L 110,70 L 120,90 L 140,90"
                      fill="none"
                      stroke="#1ABC9C"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-6">
            Our Mission: Empowering Small Practices, Reclaiming Physician Time
          </h2>
          <p className="text-xl text-soft-sage max-w-4xl mx-auto leading-relaxed">
            Independent clinics are trapped between rising administrative costs and physician burnout. 
            We exist to return the humanity to healthcare by using Agentic AI to handle the logistics.
          </p>
        </div>
      </section>

      {/* Key Pillars */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-4">
              The 3 Pillars of Vantedge Health
            </h2>
            <p className="text-xl text-soft-sage">
              Our foundation for transforming healthcare delivery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-healing-teal">
              <div className="bg-healing-teal/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-healing-teal" />
              </div>
              <h3 className="text-2xl font-bold text-deep-slate mb-4">
                Clinical-First AI
              </h3>
              <p className="text-soft-sage leading-relaxed">
                We don't replace doctors—we protect their time. Our AI handles scheduling, insurance verification, 
                and referral logistics. Physicians handle medicine.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-healing-teal">
              <div className="bg-healing-teal/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-healing-teal" />
              </div>
              <h3 className="text-2xl font-bold text-deep-slate mb-4">
                Closed-Loop Care
              </h3>
              <p className="text-soft-sage leading-relaxed">
                No patient should ever fall through the cracks of a referral. Our system tracks every handoff, 
                confirms every appointment, and alerts providers when follow-up is needed.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-healing-teal">
              <div className="bg-healing-teal/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-healing-teal" />
              </div>
              <h3 className="text-2xl font-bold text-deep-slate mb-4">
                RADICAL Transparency
              </h3>
              <p className="text-soft-sage leading-relaxed">
                Ethics-led AI that is HIPAA-native and provider-approved. Every decision is explainable. 
                Every data point is protected. Every algorithm is auditable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-gradient-to-br from-deep-slate to-deep-slate/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              The 2026 Edge: Next Evolution of the Medical Office
            </h2>
            <p className="text-xl text-soft-sage">
              This isn't a scheduling app with a chatbot. This is intelligent healthcare.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="bg-healing-teal w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Role-Based Triage</h3>
              <p className="text-soft-sage">
                AI routes patients to the right provider based on clinical need, insurance coverage, 
                and availability—in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="bg-healing-teal w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Logistics</h3>
              <p className="text-soft-sage">
                Traffic-aware appointment reminders that tell patients when to leave based on real-time conditions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="bg-healing-teal w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Predictive Capacity Planning</h3>
              <p className="text-soft-sage">
                AI forecasts no-shows and optimizes schedules to maximize provider utilization without overbooking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="bg-healing-teal w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ambient Documentation</h3>
              <p className="text-soft-sage">
                AI-powered note-taking that captures patient encounters without disrupting the conversation.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="bg-healing-teal w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Patient Communication</h3>
              <p className="text-soft-sage">
                Automated follow-ups, appointment reminders, and care coordination that feels personal.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="bg-healing-teal w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Financial Management</h3>
              <p className="text-soft-sage">
                Streamlined billing, insurance verification, and revenue cycle management powered by AI.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 bg-healing-teal hover:bg-healing-teal/90 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg"
            >
              Explore All Features
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-healing-teal mb-2">87%</div>
              <div className="text-soft-sage">Reduction in Administrative Time</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-healing-teal mb-2">3.2hrs</div>
              <div className="text-soft-sage">Average Time Saved Per Day</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-healing-teal mb-2">94%</div>
              <div className="text-soft-sage">Provider Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-healing-teal mb-2">$127K</div>
              <div className="text-soft-sage">Average Annual Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-deep-slate text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Reclaim Your 9:00 PM
          </h2>
          <p className="text-xl text-soft-sage mb-8 leading-relaxed">
            If you're a clinic owner tired of administrative burden stealing time from patient care, 
            we'd love to talk. Join the Vantedge network and rediscover why you became a doctor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-healing-teal hover:bg-healing-teal/90 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg"
            >
              Schedule a Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/practices"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg border border-white/20"
            >
              For Practices
            </Link>
          </div>
          <p className="text-soft-sage text-sm mt-6">
            No sales pitch. Just a conversation about better care.
          </p>
        </div>
      </section>
    </div>
  );
}
