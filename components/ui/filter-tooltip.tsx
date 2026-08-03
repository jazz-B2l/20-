'use client'

import React, { useState, useRef } from 'react'

interface FilterTooltipProps {
  content: string
  subContent?: string | null
  category?: string
  value?: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function FilterTooltip({
  content,
  subContent,
  category,
  value,
  children,
  position = 'top',
  className = ''
}: FilterTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, 150)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  // Positioning CSS classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  // Arrow position classes
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-card border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-card border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-card border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-card border-y-transparent border-l-transparent'
  }

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none w-max max-w-xs ${positionClasses[position]} animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="bg-popover/95 backdrop-blur-md text-popover-foreground text-xs rounded-xl p-3 shadow-xl border border-border/80 space-y-1.5 transition-all">
            {/* Category tag if available */}
            {category && (
              <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1 text-[10px] text-muted-foreground font-mono">
                <span className="uppercase tracking-wider font-semibold text-primary">{category}</span>
                {value && <span className="bg-muted px-1.5 py-0.5 rounded text-[9px]">{value}</span>}
              </div>
            )}

            {/* Main French Content */}
            <div className="font-bold text-foreground text-xs leading-snug break-words">
              {content}
            </div>

            {/* Arabic / Secondary Content */}
            {subContent && (
              <div className="text-[11px] text-primary font-sans font-medium leading-tight text-right" dir="rtl">
                {subContent}
              </div>
            )}
          </div>

          {/* Tooltip Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  )
}
