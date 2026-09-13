interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success'
}

export function Badge({
  children,
  variant = 'default',
}: BadgeProps) {
  const variants = {
    default:
      'bg-[var(--color-cream-dark)] text-[var(--color-forest)]',

    accent:
      'bg-[var(--color-accent)] text-white',

    success:
      'bg-[var(--color-forest-light)] text-white',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  )
}