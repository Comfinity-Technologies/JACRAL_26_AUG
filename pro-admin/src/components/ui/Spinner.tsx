interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({
  size = 'md',
}: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  }

  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-forest)]`}
      aria-label="Loading"
    />
  )
}