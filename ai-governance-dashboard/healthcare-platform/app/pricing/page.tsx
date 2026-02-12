import { Check, ArrowRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Vantedge Health',
  description: 'Transparent, affordable pricing for independent practices. No hidden fees, no long-term contracts.',
};

export default function PricingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-slate to-deep-slate/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-soft-sage max-w-3xl mx-auto leading-relaxed">
            No hidden fees. No long-term contracts. Just straightforward pricing that scales with your practice.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-healing-teal transition-colors">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-deep-slate mb-2">Starter</h3>
                <p className="text-soft-sage">Perfect for solo practitioners</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-deep-slate">$499</span>
                  <span className="text-soft-sage">/month</span>
                </div>
                <p className="text-sm text-soft-sage mt-2">per provider</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Up to 1 provider',
                  'Intelligent scheduling',
                  'Basic patient communication',
                  'Insurance verification',
                  'Standard analytics',
                  'Email support',
                  'EHR integration',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-healing-teal flex-shrink-0 mt-0.5" />
                    <span className="text-deep-slate">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="block w-full text-center bg-deep-slate hover:bg-deep-slate/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Professional Plan - Featured */}
            <div className="bg-gradient-to-br from-healing-teal to-healing-teal/90 rounded-2xl shadow-xl p-8 border-2 border-healing-teal relative transform lg:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-healing-teal px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <p className="text-white/80">For growing practices</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">$899</span>
                  <span className="text-white/80">/month</span>
                </div>
                <p className="text-sm text-white/80 mt-2">per provider</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Up to 5 providers',
                  'Everything in Starter, plus:',
                  'Ambient documentation',
                  'Closed-loop care coordination',
                  'Smart logistics & reminders',
                  'Advanced analytics',
                  'Revenue cycle management',
                  'Priority phone support',
                  'Dedicated account manager',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="block w-full text-center bg-white text-healing-teal hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-healing-teal transition-colors">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-deep-slate mb-2">Enterprise</h3>
                <p className="text-soft-sage">For large practices & groups</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-deep-slate">Custom</span>
                </div>
                <p className="text-sm text-soft-sage mt-2">tailored to your needs</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  '6+ providers',
                  'Everything in Professional, plus:',
                  'Custom AI training',
                  'Multi-location support',
                  'Advanced integrations',
                  'Custom reporting',
                  'White-label options',
                  '24/7 dedicated support',
                  'On-site training',
                  'SLA guarantees',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-healing-teal flex-shrink-0 mt-0.5" />
                    <span className="text-deep-slate">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="block w-full text-center bg-deep-slate hover:bg-deep-slate/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          {/* Pricing Notes */}
          <div className="mt-12 text-center">
            <p className="text-soft-sage mb-4">
              All plans include: HIPAA-compliant security • EHR integration • Regular updates • No setup fees
            </p>
            <p className="text-deep-slate font-medium">
              30-day money-back guarantee • Cancel anytime • No long-term contracts
            </p>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-4">
              Calculate Your ROI
            </h2>
            <p className="text-xl text-soft-sage">
              See how much time and money Vantedge Health can save your practice
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-deep-slate mb-4">Your Current Costs</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-soft-sage">Administrative staff time</span>
                    <span className="text-deep-slate font-medium">$4,200/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-soft-sage">Physician documentation time</span>
                    <span className="text-deep-slate font-medium">$3,800/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-soft-sage">No-show revenue loss</span>
                    <span className="text-deep-slate font-medium">$2,100/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-soft-sage">Billing inefficiencies</span>
                    <span className="text-deep-slate font-medium">$1,900/mo</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-deep-slate font-bold">Total Monthly Cost</span>
                    <span className="text-deep-slate font-bold text-xl">$12,000</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-deep-slate mb-4">With Vantedge Health</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-soft-sage">Administrative time saved (87%)</span>
                    <span className="text-success font-medium">+$3,654/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-soft-sage">Documentation time saved (45min/day)</span>
                    <span className="text-success font-medium">+$2,850/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-soft-sage">No-show reduction (35%)</span>
                    <span className="text-success font-medium">+$735/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-soft-sage">Billing optimization</span>
                    <span className="text-success font-medium">+$1,520/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-error">Vantedge Health cost</span>
                    <span className="text-error font-medium">-$899/mo</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-deep-slate font-bold">Net Monthly Savings</span>
                    <span className="text-success font-bold text-xl">+$7,860</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-healing-teal/10 rounded-xl p-6 text-center">
              <p className="text-2xl font-bold text-deep-slate mb-2">
                Annual ROI: <span className="text-healing-teal">$94,320</span>
              </p>
              <p className="text-soft-sage">
                Based on average 3-physician practice. Your results may vary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-slate mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Is there a setup fee?',
                a: 'No. We include onboarding, training, and EHR integration at no additional cost.',
              },
              {
                q: 'What if I need to cancel?',
                a: 'You can cancel anytime with 30 days notice. No penalties, no questions asked. We also offer a 30-day money-back guarantee.',
              },
              {
                q: 'How long does implementation take?',
                a: 'Most practices are fully operational within 2-3 weeks. We handle the technical setup while you focus on patients.',
              },
              {
                q: 'Do you integrate with my EHR?',
                a: 'Yes. We support 50+ EHR systems including Epic, Cerner, Athenahealth, and more. Custom integrations available for Enterprise plans.',
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We are HIPAA-compliant with enterprise-grade encryption, regular security audits, and full audit trails.',
              },
              {
                q: 'Can I add more providers later?',
                a: 'Yes. You can upgrade your plan anytime as your practice grows. Pricing scales smoothly with no surprises.',
              },
              {
                q: 'What kind of support do you offer?',
                a: 'All plans include email support. Professional plans get priority phone support and a dedicated account manager. Enterprise plans get 24/7 support.',
              },
              {
                q: 'Do you offer discounts for annual payment?',
                a: 'Yes. Pay annually and save 15% on any plan. Contact us for details.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-healing-teal flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-deep-slate mb-2">{faq.q}</h3>
                    <p className="text-soft-sage leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-deep-slate to-deep-slate/90 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-soft-sage mb-8 leading-relaxed">
            Schedule a demo to see Vantedge Health in action and get a personalized quote for your practice.
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
              Learn More
            </Link>
          </div>
          <p className="text-soft-sage text-sm mt-6">
            No credit card required • 30-day money-back guarantee
          </p>
        </div>
      </section>
    </div>
  );
}
