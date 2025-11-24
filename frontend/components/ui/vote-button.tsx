import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const voteButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        agree: [
          "bg-tech-green/10 text-tech-green border border-tech-green/20",
          "hover:bg-tech-green/20 hover:border-tech-green/40 hover:shadow-glow-green",
          "data-[active=true]:bg-tech-green data-[active=true]:text-background",
          "data-[active=true]:shadow-glow-green"
        ],
        disagree: [
          "bg-destructive/10 text-destructive border border-destructive/20", 
          "hover:bg-destructive/20 hover:border-destructive/40",
          "data-[active=true]:bg-destructive data-[active=true]:text-destructive-foreground"
        ]
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6"
      }
    },
    defaultVariants: {
      variant: "agree",
      size: "default"
    }
  }
)

export interface VoteButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof voteButtonVariants> {
  active?: boolean
  count?: number
}

const VoteButton = React.forwardRef<HTMLButtonElement, VoteButtonProps>(
  ({ className, variant, size, active = false, count, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-active={active}
        className={cn(voteButtonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {typeof count === "number" && (
          <span className="text-xs font-semibold">{count}</span>
        )}
      </button>
    )
  }
)

VoteButton.displayName = "VoteButton"

export { VoteButton, voteButtonVariants }
