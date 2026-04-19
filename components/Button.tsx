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
    'btn',
    {
      primary:   'btn-primary',
      secondary: 'btn-secondary',
      ghost:     'btn-ghost',
      danger:    'btn-danger',
    }[variant],
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    className
  )

  if (Tag === 'a') {
    return <a href={href} className={classes}>{children}</a>
  }

  return <button className={classes} {...props}>{children}</button>
}
