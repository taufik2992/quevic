import { BarChart3, FileText, Sparkles, Users } from 'lucide-react'

const FEATURES = [
  {
    icon: FileText,
    title: 'Professional Templates',
    description: 'Beautiful and customizable templates',
    iconClassName: 'bg-primary-100 text-primary-600',
  },
  {
    icon: Sparkles,
    title: 'AI Assistance',
    description: 'Write, design, and personalize with AI',
    iconClassName: 'bg-purple/10 text-purple',
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'Keep all your clients organized',
    iconClassName: 'bg-success/10 text-success',
  },
  {
    icon: BarChart3,
    title: 'Track & Get Paid',
    description: 'Monitor invoices and payments easily',
    iconClassName: 'bg-warning/15 text-warning-foreground',
  },
] as const

const STATS = [
  { value: '10K+', label: 'Happy Users' },
  { value: '99%', label: 'Customer Satisfaction' },
  { value: '4.9/5', label: 'Average Rating' },
] as const

export function LoginHero() {
  return (
    <div
      aria-hidden={false}
      className="relative flex h-full min-h-140 flex-col justify-between overflow-hidden rounded-3xl bg-[url(/assets/bgloginlight.png)] bg-cover bg-center p-8 lg:rounded-none lg:p-10 dark:bg-[url(/assets/bglogindark.png)]"
    >
      <div className="relative flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <img
            src="/quevic-logo.png"
            alt="Quevic logo"
            className="size-11 object-contain"
          />
          <div className="flex flex-col">
            <p className="text-xl font-bold tracking-tight text-neutral-900">
              Quevic
            </p>
            <p className="text-xs text-neutral-700">
              Invoice &amp; Proposal with AI
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-600">
            <Sparkles className="size-3.5" />
            Smarter Business Operations
          </span>
          <h1 className="max-w-md text-4xl font-extrabold leading-[1.08] tracking-tight text-neutral-900">
            Create invoices and proposals faster with{' '}
            <span className="text-primary-500">the power of AI.</span>
          </h1>
          <p className="max-w-md text-sm leading-6 text-neutral-700">
            Manage clients, create professional invoices and proposals, and grow
            your business — all in one place.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="flex items-center gap-3">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${feature.iconClassName}`}
              >
                <feature.icon className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-bold text-neutral-900">
                  {feature.title}
                </span>
                <span className="text-xs text-neutral-700">
                  {feature.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="relative mt-10 flex items-stretch gap-6">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-1 ${index > 0 ? 'border-l border-neutral-200 pl-6' : ''}`}
          >
            <dt className="order-2 text-xs text-neutral-700">{stat.label}</dt>
            <dd className="order-1 text-xl font-extrabold text-neutral-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
