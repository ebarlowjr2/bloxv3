import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleProps {
  checked: boolean
  onChange: () => void
  className?: string
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, className }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onChange}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          checked ? "bg-emerald-500" : "bg-slate-300",
          className
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-4" : "translate-x-1"
          )}
        />
      </button>
    )
  }
)
Toggle.displayName = "Toggle"

export { Toggle }
