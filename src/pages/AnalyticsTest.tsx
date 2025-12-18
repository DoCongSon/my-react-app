import { useState } from 'react'
import { logEvent } from '../utils/analytics'

type PlanId = 'starter' | 'growth' | 'scale'

const PLANS: Array<{
  id: PlanId
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
}> = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$0',
    description: 'Perfect for individuals testing the waters.',
    features: ['3 analytics experiments', 'Basic dashboards', 'Community support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$29',
    description: 'Ideal for teams shipping weekly releases.',
    features: ['Unlimited events', 'Journey builder', 'Priority email support'],
    popular: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '$79',
    description: 'Analytics for high-traffic products and squads.',
    features: ['Real-time insights', 'Custom dashboards', 'Dedicated success manager'],
  },
]

const AnalyticsTestPage = () => {
  const [lastEvent, setLastEvent] = useState<string | null>(null)

  const handleClick = (planId: PlanId) => {
    const plan = PLANS.find((item) => item.id === planId)
    if (!plan) return

    logEvent('Pricing CTA', 'Select Plan', plan.name)
    setLastEvent(`${plan.name} plan CTA clicked`)
  }

  return (
    <main className='analytics-container'>
      <section className='analytics-card modern-analytics-card'>
        <div className='analytics-header'>
          <p className='analytics-tag'>Experiment Lab</p>
          <h1>Test Google Analytics events across pricing CTAs</h1>
          <p>
            Trigger <code>logEvent</code> with realistic pricing cards. Ideal for verifying GA4 set-up before releasing
            to production.
          </p>
        </div>

        <div className='plans-grid'>
          {PLANS.map((plan) => (
            <article key={plan.id} className={`plan-card${plan.popular ? ' plan-card-popular' : ''}`}>
              {plan.popular ? <span className='plan-badge'>Most Popular</span> : null}
              <div className='plan-header'>
                <h2>{plan.name}</h2>
                <p className='plan-price'>{plan.price}</p>
                <p className='plan-description'>{plan.description}</p>
              </div>
              <ul className='plan-feature-list'>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button type='button' className='plan-cta' onClick={() => handleClick(plan.id)}>
                {plan.id === 'starter' ? 'Start for free' : 'Choose plan'}
              </button>
            </article>
          ))}
        </div>

        <p className='cta-hint'>Events only fire outside localhost with valid GA4 configuration.</p>
        {lastEvent ? <p className='cta-last-event'>{lastEvent}</p> : null}
      </section>
    </main>
  )
}

export default AnalyticsTestPage
