import * as React from "react"

/** 2×2 grid — reads clearly at toolbar size (matches common “table” control) */
export const TableIcon = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
    return (
      <svg
        width="24"
        height="24"
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect x="4" y="4" width="7" height="7" rx="1.25" />
        <rect x="13" y="4" width="7" height="7" rx="1.25" />
        <rect x="4" y="13" width="7" height="7" rx="1.25" />
        <rect x="13" y="13" width="7" height="7" rx="1.25" />
      </svg>
    )
  }
)

TableIcon.displayName = "TableIcon"
