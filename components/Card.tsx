import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  title?: string
  description?: string
  measurement?: string
  interactive?: boolean
  className?: string
}

export const Card = ({
  children,
  title,
  description,
  measurement,
  interactive,
  className,
}: CardProps) => {
  return (
    <div
      className={clsx(
        'relative p-6 bg-white/60 backdrop-blur-sm',
        'border border-black/10 rounded-none',
        'transition-all duration-200 group',
        interactive && 'hover:border-black/40 hover:bg-white/80 cursor-pointer',
        className
      )}
      data-measurement={measurement}
    >
      {measurement && (
        <span className="absolute -left-7 top-0 text-[10px] font-mono text-black/25 whitespace-nowrap select-none">
          {measurement}
        </span>
      )}
      <div className="absolute left-0 top-4 bottom-4 w-px border-l border-dashed border-black/10 pointer-events-none" />
      {title && (
        <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#0d0d0d] mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs text-[#555] font-mono mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
