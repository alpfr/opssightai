import { 
  Calendar, Clock, Shield, Users, Zap, FileText, 
  TrendingUp, Heart, CheckCircle, Phone, DollarSign, 
  Activity, Bell, Lock, BarChart
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features - Vantedge Health',
  description: 'Explore the comprehensive AI-powered features that make Vantedge Health the next evolution of the medical office.',
};

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-slate to-deep-slate/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            The 2026 Edge: Features That Transform Healthcare
          </h1>
          <p className="text-xl text-soft-sage max-w-3xl mx-auto leading-relaxed">
            This isn't a scheduling app with a chatbot. This is the next evolution of the medical office—
            intelligent, efficient, and built for the way healthcare should work.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-4">
              Core Features
            </h2>
            <p className="text-xl text-soft-sage">
              Everything your practice needs to thrive
            </p>
          </div>

          <div className="space-y-16">
            {/* Feature 1: Role-Based Triage */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-healing-teal/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-healing-teal" />
                </div>
                <h3 className="text-3xl font-bold text-deep-slate mb-4">
                  Role-Based Triage
                </h3>
                <p className="text-lg text-soft-sage mb-6 leading-relaxed">
                  AI routes patients to the right provider based on clinical need, insurance coverage, 
                  and availability—in seconds, not minutes.
                </p>
                <ul className="space-y-3">
                  {[
                    'Intelligent provider matching based on specialty and availability',
                    'Real-time insurance verification and coverage checks',
                    'Automatic escalation for urgent cases',
                    'Reduces wait times by 40% on average',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-healing-teal flex-shrink-0 mt-1" />
                      <span className="text-deep-slate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-healing-teal/20">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-healing-teal/10 p-2 rounded">
                      <Users className="w-5 h-5 text-healing-teal" />
                    </div>
                    <div>
                      <p className="font-bold text-deep-slate">Patient: Sarah Johnson</p>
                      <p className="text-sm text-soft-sage">Chief Complaint: Knee pain</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-soft-sage">Insurance:</span>
                      <span className="text-deep-slate font-medium">✓ Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soft-sage">Specialty Match:</span>
                      <span className="text-deep-slate font-medium">Orthopedics</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-soft-sage">Next Available:</span>
                      <span className="text-deep-slate font-medium">Today 2:30 PM</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-healing-teal text-white py-2 rounded-lg font-medium">
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>

            {/* Feature 2: Smart Logistics */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-gray-50 rounded-xl p-8 border-2 border-healing-teal/20">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-healing-teal" />
                    <p className="font-bold text-deep-slate">Appointment Reminder</p>
                  </div>
                  <p className="text-deep-slate mb-4">
                    Your appointment with Dr. Smith is tomorrow at 2:30 PM.
                  </p>
                  <div className="bg-healing-teal/10 rounded-lg p-4 mb-4">
                    <p className="text-sm text-deep-slate font-medium mb-2">
                      🚗 Leave by 2:05 PM
                    </p>
                    <p className="text-xs text-soft-sage">
                      Based on current traffic, you'll need 25 minutes to arrive on time.
                    </p>
                  </div>
                  <button className="w-full bg-healing-teal text-white py-2 rounded-lg font-medium text-sm">
                    Add to Calendar
                  </button>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="bg-healing-teal/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-healing-teal" />
                </div>
                <h3 className="text-3xl font-bold text-deep-slate mb-4">
                  Smart Logistics
                </h3>
                <p className="text-lg text-soft-sage mb-6 leading-relaxed">
                  Traffic-aware appointment reminders that tell patients when to leave based on real-time conditions. 
                  No more late arrivals or wasted appointment slots.
                </p>
                <ul className="space-y-3">
                  {[
                    'Real-time traffic monitoring and route optimization',
                    'Personalized departure time recommendations',
                    'Automatic rescheduling suggestions for delays',
                    'Reduces no-shows by 35% on average',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-healing-teal flex-shrink-0 mt-1" />
                      <span className="text-deep-slate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3: Ambient Documentation */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-healing-teal/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-healing-teal" />
                </div>
                <h3 className="text-3xl font-bold text-deep-slate mb-4">
                  Ambient Documentation
                </h3>
                <p className="text-lg text-soft-sage mb-6 leading-relaxed">
                  AI-powered note-taking that captures patient encounters without disrupting the conversation. 
                  Focus on your patient, not your keyboard.
                </p>
                <ul className="space-y-3">
                  {[
                    'Real-time transcription and clinical note generation',
                    'Automatic ICD-10 and CPT code suggestions',
                    'SOAP note formatting with key findings highlighted',
                    'Saves 45+ minutes per day on documentation',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-healing-teal flex-shrink-0 mt-1" />
                      <span className="text-deep-slate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-healing-teal/20">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-deep-slate">Clinical Note</p>
                    <span className="text-xs bg-healing-teal/10 text-healing-teal px-2 py-1 rounded">
                      AI Generated
                    </span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-deep-slate mb-1">Subjective:</p>
                      <p className="text-soft-sage">
                        Patient reports right knee pain for 2 weeks, worse with stairs...
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-deep-slate mb-1">Objective:</p>
                      <p className="text-soft-sage">
                        Mild swelling noted, ROM limited to 110°...
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-deep-slate mb-1">Assessment:</p>
                      <p className="text-soft-sage">
                        Likely meniscal tear, recommend MRI...
                      </p>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-deep-slate text-white py-2 rounded-lg font-medium text-sm">
                    Review & Sign
                  </button>
                </div>
              </div>
            </div>

            {/* Feature 4: Closed-Loop Care */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-gray-50 rounded-xl p-8 border-2 border-healing-teal/20">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-healing-teal" />
                    <p className="font-bold text-deep-slate">Referral Tracking</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { status: 'Completed', label: 'Referral sent to Dr. Lee', color: 'bg-success' },
                      { status: 'Completed', label: 'Patient appointment scheduled', color: 'bg-success' },
                      { status: 'Completed', label: 'Specialist visit completed', color: 'bg-success' },
                      { status: 'Pending', label: 'Awaiting specialist report', color: 'bg-warning' },
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${step.color}`} />
                        <div className="flex-1">
                          <p className="text-sm text-deep-slate">{step.label}</p>
                          <p className="text-xs text-soft-sage">{step.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="bg-healing-teal/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-healing-teal" />
                </div>
                <h3 className="text-3xl font-bold text-deep-slate mb-4">
                  Closed-Loop Care Coordination
                </h3>
                <p className="text-lg text-soft-sage mb-6 leading-relaxed">
                  No patient should ever fall through the cracks of a referral. Our system tracks every handoff, 
                  confirms every appointment, and alerts providers when follow-up is needed.
                </p>
                <ul className="space-y-3">
                  {[
                    'Automatic referral tracking and status updates',
                    'Bi-directional communication with specialists',
                    'Alerts for overdue follow-ups or missing reports',
                    'Complete audit trail for compliance',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-healing-teal flex-shrink-0 mt-1" />
                      <span className="text-deep-slate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-4">
              Additional Features
            </h2>
            <p className="text-xl text-soft-sage">
              Everything you need for a modern practice
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Predictive Scheduling',
                desc: 'AI forecasts no-shows and optimizes schedules to maximize utilization without overbooking',
              },
              {
                icon: Phone,
                title: 'Patient Communication',
                desc: 'Automated reminders, follow-ups, and care coordination that feels personal',
              },
              {
                icon: DollarSign,
                title: 'Revenue Cycle Management',
                desc: 'Streamlined billing, insurance verification, and claims processing',
              },
              {
                icon: BarChart,
                title: 'Analytics Dashboard',
                desc: 'Real-time insights into practice performance, trends, and opportunities',
              },
              {
                icon: Lock,
                title: 'HIPAA-Compliant Security',
                desc: 'Enterprise-grade security with encryption, audit trails, and access controls',
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                desc: 'Intelligent alerts for critical events, overdue tasks, and patient needs',
              },
              {
                icon: TrendingUp,
                title: 'Performance Optimization',
                desc: 'Continuous AI-driven recommendations to improve efficiency and outcomes',
              },
              {
                icon: Shield,
                title: 'Compliance Management',
                desc: 'Automated tracking and reporting for regulatory requirements',
              },
              {
                icon: Heart,
                title: 'Patient Portal',
                desc: 'Modern, mobile-friendly portal for appointments, records, and communication',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-healing-teal/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-healing-teal" />
                  </div>
                  <h3 className="text-xl font-bold text-deep-slate mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-soft-sage">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-deep-slate to-deep-slate/90 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Seamless EHR Integration
            </h2>
            <p className="text-xl text-soft-sage mb-8 max-w-3xl mx-auto">
              Vantedge Health integrates with your existing EHR system. No data migration, no workflow disruption.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              {['Epic', 'Cerner', 'Athenahealth', 'eClinicalWorks', 'NextGen', 'Allscripts'].map((ehr) => (
                <div key={ehr} className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
                  <span className="font-medium">{ehr}</span>
                </div>
              ))}
            </div>
            <p className="text-soft-sage">
              Don't see your EHR? We support 50+ systems and can build custom integrations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-healing-teal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            See Vantedge Health in Action
          </h2>
          <p className="text-xl mb-8 leading-relaxed opacity-90">
            Schedule a personalized demo to see how these features can transform your practice.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-healing-teal hover:bg-gray-100 px-8 py-4 rounded-lg font-medium transition-colors text-lg"
          >
            Schedule Your Demo
            <CheckCircle className="w-5 h-5" />
          </Link>
          <p className="text-sm mt-6 opacity-75">
            30-minute demo • No sales pressure • See real results
          </p>
        </div>
      </section>
    </div>
  );
}
