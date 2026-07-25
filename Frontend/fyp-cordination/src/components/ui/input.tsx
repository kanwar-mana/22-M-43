import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: "sm" | "default" | "lg";
  icon?: React.ReactNode;
};

const inputSizeVariants: Record<NonNullable<InputProps["size"]>, string> = {
  sm: "h-8 px-2.5 text-sm",
  default: "h-10 px-3 py-1 text-base md:text-sm",
  lg: "h-12 px-6 text-sm",
};

const inputIconPaddingVariants: Record<
  NonNullable<InputProps["size"]>,
  string
> = {
  sm: "pl-8",
  default: "pl-9",
  lg: "pl-11",
};

function Input({
  className,
  icon,
  type,
  size = "default",
  ...props
}: InputProps) {
  return (
    <div className="relative w-full">
      {icon ? (
        <span className="text-muted-foreground pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-muted/50 dark:bg-input/30  w-full min-w-0 rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          inputSizeVariants[size],
          icon && inputIconPaddingVariants[size],
          "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[2px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
