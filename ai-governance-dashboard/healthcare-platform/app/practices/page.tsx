import { ArrowRight, CheckCircle, Clock, DollarSign, Users, TrendingUp, Shield, Heart } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Practices - Vantedge Health',
  description: 'Discover how Vantedge Health helps independent practices reduce administrative burden, increase revenue, and reclaim physician time.',
};

export default function PracticesPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-slate to-deep-slate/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Built for Independent Practices
            </h1>
            <p className="text-xl text-soft-sage mb-8 leading-relaxed">
              We understand the Small Practice Squeeze. Rising costs, shrinking reimbursements, and endless administrative tasks. 
              Vantedge Health is designed specifically to help independent clinics thrive.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-healing-teal hover:bg-healing-teal/90 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg"
            >
              Schedule Your Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-6 text-center">
              The Small Practice Squeeze
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-error">
              <p className="text-lg text-deep-slate mb-4">
                You didn't go to medical school to spend your evenings on paperwork. Yet here you are:
              </p>
              <ul className="space-y-3 text-deep-slate">
                <li className="flex items-start gap-3">
                  <span className="text-error font-bold mt-1">→</span>
                  <span>Working until 9 PM to finish charts while your family waits</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-error font-bold mt-1">→</span>
                  <span>Watching staff drown in phone calls, insurance verifications, and referral coordination</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-error font-bold mt-1">→</span>
                  <span>Losing patients to larger health systems with better technology</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-error font-bold mt-1">→</span>
                  <span>Feeling like you're running a business instead of practicing medicine</span>
                </li>
              </ul>
              <p className="text-lg text-deep-slate mt-6 font-medium">
                This isn't sustainable. And it's not why you became a doctor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-4">
              How Vantedge Health Helps
            </h2>
            <p className="text-xl text-soft-sage max-w-3xl mx-auto">
              We handle the logistics so you can focus on what matters: patient care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-healing-teal">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-healing-teal/10 p-3 rounded-lg flex-shrink-0">
                  <Clock className="w-6 h-6 text-healing-teal" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-deep-slate mb-2">
                    Reclaim 3+ Hours Per Day
                  </h3>
                  <p className="text-soft-sage">
                    Our AI handles appointment scheduling, insurance verification, referral coordination, 
                    and documentation—automatically. No more working until 9 PM.
                  </p>
                </div>
              </div>
              <div className="bg-healing-teal/5 rounded-lg p-4 mt-4">
                <p className="text-sm text-deep-slate font-medium">
                  Average time saved: <span className="text-healing-teal">3.2 hours per physician per day</span>
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-healing-teal">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-healing-teal/10 p-3 rounded-lg flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-healing-teal" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-deep-slate mb-2">
                    Increase Revenue by 18-25%
                  </h3>
                  <p className="text-soft-sage">
                    Optimize scheduling, reduce no-shows, improve billing accuracy, and see more patients 
                    without working longer hours.
                  </p>
                </div>
              </div>
              <div className="bg-healing-teal/5 rounded-lg p-4 mt-4">
                <p className="text-sm text-deep-slate font-medium">
                  Average annual savings: <span className="text-healing-teal">$127,000 per provider</span>
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-healing-teal">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-healing-teal/10 p-3 rounded-lg flex-shrink-0">
                  <Users className="w-6 h-6 text-healing-teal" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-deep-slate mb-2">
                    Improve Patient Satisfaction
                  </h3>
                  <p className="text-soft-sage">
                    Closed-loop care means no patient falls through the cracks. Automated follow-ups, 
                    appointment reminders, and seamless referrals create a better experience.
                  </p>
                </div>
              </div>
              <div className="bg-healing-teal/5 rounded-lg p-4 mt-4">
                <p className="text-sm text-deep-slate font-medium">
                  Patient satisfaction increase: <span className="text-healing-teal">+23% average</span>
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-healing-teal">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-healing-teal/10 p-3 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-healing-teal" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-deep-slate mb-2">
                    Reduce Staff Burnout
                  </h3>
                  <p className="text-soft-sage">
                    Your team spends less time on phone calls and paperwork, more time on meaningful 
                    patient interactions. Happier staff means better retention.
                  </p>
                </div>
              </div>
              <div className="bg-healing-teal/5 rounded-lg p-4 mt-4">
                <p className="text-sm text-deep-slate font-medium">
                  Staff satisfaction increase: <span className="text-healing-teal">+31% average</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features for Practices */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-4">
              Everything Your Practice Needs
            </h2>
            <p className="text-xl text-soft-sage">
              Comprehensive AI-powered tools designed for independent practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Intelligent Scheduling', desc: 'AI-optimized appointment booking with predictive no-show prevention' },
              { title: 'Automated Insurance Verification', desc: 'Real-time eligibility checks and pre-authorization management' },
              { title: 'Referral Coordination', desc: 'Closed-loop tracking ensures no patient falls through the cracks' },
              { title: 'Ambient Documentation', desc: 'AI-powered note-taking that captures encounters naturally' },
              { title: 'Patient Communication', desc: 'Automated reminders, follow-ups, and care coordination' },
              { title: 'Revenue Cycle Management', desc: 'Streamlined billing and claims processing with AI accuracy' },
              { title: 'Analytics Dashboard', desc: 'Real-time insights into practice performance and opportunities' },
              { title: 'HIPAA-Compliant Security', desc: 'Enterprise-grade security with full audit trails' },
              { title: 'EHR Integration', desc: 'Seamless integration with your existing systems' },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-healing-teal flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-deep-slate mb-2">{feature.title}</h3>
                    <p className="text-sm text-soft-sage">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-4">
              Simple Implementation, Immediate Results
            </h2>
            <p className="text-xl text-soft-sage">
              We handle the heavy lifting. You focus on patients.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Discovery Call', desc: 'We learn about your practice, challenges, and goals' },
              { step: '2', title: 'Custom Setup', desc: 'We configure Vantedge to match your workflows' },
              { step: '3', title: 'Team Training', desc: 'Comprehensive onboarding for your entire staff' },
              { step: '4', title: 'Go Live', desc: 'Launch with dedicated support and ongoing optimization' },
            ].map((phase) => (
              <div key={phase.step} className="text-center">
                <div className="bg-healing-teal text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {phase.step}
                </div>
                <h3 className="text-xl font-bold text-deep-slate mb-2">{phase.title}</h3>
                <p className="text-soft-sage">{phase.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-deep-slate font-medium mb-4">
              Average implementation time: <span className="text-healing-teal">2-3 weeks</span>
            </p>
            <p className="text-soft-sage">
              Most practices see measurable results within the first month
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-gradient-to-br from-deep-slate to-deep-slate/90 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="text-6xl text-healing-teal mb-4">"</div>
            <p className="text-2xl mb-6 leading-relaxed">
              Vantedge gave me my evenings back. I'm seeing the same number of patients but leaving at 5 PM instead of 9 PM. 
              My staff is happier, my patients are happier, and I'm actually enjoying medicine again.
            </p>
            <div className="border-t border-white/20 pt-6 mt-6">
              <p className="font-bold text-xl">Dr. Sarah Martinez</p>
              <p className="text-soft-sage">Family Medicine, Chicago, IL</p>
              <p className="text-sm text-soft-sage mt-2">3-physician independent practice</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-healing-teal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Reclaim Your Time?
          </h2>
          <p className="text-xl mb-8 leading-relaxed opacity-90">
            Join the growing network of independent practices using Vantedge Health to thrive in 2026 and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-healing-teal hover:bg-gray-100 px-8 py-4 rounded-lg font-medium transition-colors text-lg"
            >
              Schedule a Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg border border-white/20"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-75">
            No long-term contracts • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>
    </div>
  );
}
