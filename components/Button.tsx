import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  as?: 'button' | 'a'
  href?: string
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  as: Tag = 'button',
  href,
  ...props
}: ButtonProps) => {
  const classes = clsx(
    'inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider',
    'relative overflow-hidden transition-all duration-200 touch-target',
    {
      primary:
        'border border-[#0d0d0d] text-[#0d0d0d] bg-transparent hover:bg-[#0d0d0d] hover:text-[#f5f5f5]',
      secondary:
        'border border-[#aaaaaa] text-[#555555] hover:border-[#0d0d0d] hover:text-[#0d0d0d]',
      ghost:
        'border-none text-[#555555] hover:text-[#0d0d0d] underline-offset-4 hover:underline',
      danger:
        'border border-red-500/60 text-red-600 hover:bg-red-600 hover:text-white',
    }[variant],
    {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    }[size],
    className
  )

  if (Tag === 'a') {
    return <a href={href} className={classes}>{children}</a>
  }

  return <button className={classes} {...props}>{children}</button>
}
