import * as React from "react"
import { cn } from "../../utils"

interface TooltipProviderProps {
  children: React.ReactNode;
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

interface TooltipProps {
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children, ...props }) => {
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
            return React.cloneElement(child, { isVisible } as any)
          }
          if (child.type === TooltipContent) {
            return React.cloneElement(child, { isVisible } as any)
          }
        }
        return child
      })}
    </div>
  )
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isVisible?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  )
)
TooltipTrigger.displayName = "TooltipTrigger"

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  side?: "top" | "bottom" | "left" | "right";
  isVisible?: boolean;
  children: React.ReactNode;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, side = "top", isVisible, children, ...props }, ref) => (
    isVisible ? (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 overflow-hidden rounded-md border bg-gray-800 px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95",
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
    ) : null
  )
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }