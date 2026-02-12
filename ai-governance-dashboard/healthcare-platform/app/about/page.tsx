import { Heart, Shield, Users, Clock, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Vantedge Health',
  description: 'Returning humanity to healthcare. Learn how Vantedge Health uses Agentic AI to solve the Small Practice Squeeze and help doctors focus on patients, not paperwork.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-deep-slate mb-4">
          Returning Humanity to Healthcare
        </h1>
        <p className="text-xl text-soft-sage">
          Vantedge Health uses Agentic AI to solve the Small Practice Squeeze—so doctors can focus on patients, not paperwork.
        </p>
      </div>

      {/* The Origin Story */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-deep-slate mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-healing-teal" />
          The Origin Story: Why We Exist
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-healing-teal">
          <p className="text-deep-slate mb-4">
            Meet Marcus. A simple knee injury from weekend basketball shouldn't take <span className="font-semibold">14 days and 20 phone calls</span> to resolve. Yet that's exactly what happened.
          </p>
          <p className="text-deep-slate mb-4">
            His primary care doctor referred him to orthopedics. The referral sat in a fax queue for three days. When the specialist's office finally called, Marcus was at work and missed it. They left no callback number. He called back—wrong department. Transferred twice. Left on hold. Started over.
          </p>
          <p className="text-deep-slate font-medium">
            This is the fragmented patient journey. And it's breaking both patients and providers.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="mb-12">
        <div className="bg-deep-slate/5 rounded-lg p-6">
          <h3 className="text-xl font-bold text-deep-slate mb-3">The Small Practice Squeeze</h3>
          <p className="text-deep-slate mb-4">
            Independent clinics are trapped between rising administrative costs and physician burnout. Doctors spend more time on logistics than medicine. Staff drown in phone calls, insurance verifications, and referral coordination.
          </p>
          <p className="text-deep-slate font-medium">
            The result? Providers working until 9:00 PM on charts. Patients falling through the cracks. Care that feels transactional, not human.
          </p>
        </div>
      </section>

      {/* Our Philosophy - The 3 Pillars */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-deep-slate mb-6">Our Philosophy: The 3 Pillars</h2>
        
        <div className="space-y-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="bg-healing-teal p-3 rounded-lg flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-deep-slate mb-2">Clinical-First AI</h3>
                <p className="text-deep-slate">
                  We don't replace doctors—we protect their time. Our AI handles scheduling, insurance verification, and referral logistics. Physicians handle medicine.
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="bg-healing-teal p-3 rounded-lg flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-deep-slate mb-2">Closed-Loop Care</h3>
                <p className="text-deep-slate">
                  No patient should ever fall through the cracks of a referral. Our system tracks every handoff, confirms every appointment, and alerts providers when follow-up is needed.
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="bg-healing-teal p-3 rounded-lg flex-shrink-0">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-deep-slate mb-2">RADICAL Transparency</h3>
                <p className="text-deep-slate">
                  Ethics-led AI that is HIPAA-native and provider-approved. Every decision is explainable. Every data point is protected. Every algorithm is auditable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 2026 Edge */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-deep-slate mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-healing-teal" />
          The 2026 Edge
        </h2>
        <div className="bg-gradient-to-r from-healing-teal/10 to-deep-slate/10 rounded-lg p-6">
          <p className="text-deep-slate mb-4">
            This isn't a scheduling app with a chatbot. This is the next evolution of the medical office.
          </p>
          <ul className="space-y-3 text-deep-slate">
            <li className="flex items-start gap-3">
              <span className="text-healing-teal font-bold">→</span>
              <span><span className="font-semibold">Role-Based Triage:</span> AI routes patients to the right provider based on clinical need, insurance coverage, and availability—in seconds.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-healing-teal font-bold">→</span>
              <span><span className="font-semibold">Smart Logistics:</span> Traffic-aware appointment reminders that tell patients when to leave based on real-time conditions.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-healing-teal font-bold">→</span>
              <span><span className="font-semibold">Predictive Capacity Planning:</span> AI forecasts no-shows and optimizes schedules to maximize provider utilization without overbooking.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-deep-slate text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Reclaim Your 9:00 PM</h2>
        <p className="text-soft-sage mb-6 max-w-2xl mx-auto">
          If you're a clinic owner tired of administrative burden stealing time from patient care, we'd love to talk. Join the Vantedge network and rediscover why you became a doctor.
        </p>
        <button className="inline-flex items-center gap-2 bg-healing-teal hover:bg-healing-teal/90 text-white px-8 py-3 rounded-lg font-medium transition-colors">
          Schedule a Demo
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-soft-sage text-sm mt-4">
          No sales pitch. Just a conversation about better care.
        </p>
      </section>

      {/* Footer Note */}
      <div className="mt-12 text-center">
        <p className="text-sm text-soft-sage">
          Vantedge Health • Founded 2026 • HIPAA Compliant • Provider-Approved
        </p>
      </div>
    </div>
  );
}
