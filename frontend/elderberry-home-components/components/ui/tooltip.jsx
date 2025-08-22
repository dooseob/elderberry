import * as React from "react"
import { cn } from "../../lib/utils"

const TooltipProvider = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

const Tooltip = ({ children, ...props }) => {
  const [isVisible, setIsVisible] = React.useState(false)
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TooltipTrigger) {
            return React.cloneElement(child, { isVisible })
          }
          if (child.type === TooltipContent) {
            return React.cloneElement(child, { isVisible })
          }
        }
        return child
      })}
    </div>
  )
}

const TooltipTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("cursor-pointer", className)}
    {...props}
  >
    {children}
  </div>
))
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(
  ({ className, sideOffset = 4, side = "top", isVisible, children, ...props }, ref) => (
    isVisible && (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          side === "top" && "bottom-full mb-2",
          side === "bottom" && "top-full mt-2",
          side === "left" && "right-full mr-2",
          side === "right" && "left-full ml-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  )
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }