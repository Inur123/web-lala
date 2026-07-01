import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-gray-200 bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus:outline-none focus:!border-[#1a4d2e] focus:!ring-1 focus:!ring-[#1a4d2e] focus-visible:outline-none focus-visible:!border-[#1a4d2e] focus-visible:!ring-1 focus-visible:!ring-[#1a4d2e] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  )
}

export { Input }
