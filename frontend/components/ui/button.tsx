import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow hover:bg-primary/90 dark:shadow-sm dark:hover:bg-primary/85",
        hero:
          "bg-primary text-white shadow-glow hover:bg-primary/90 dark:hover:bg-primary/85 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 dark:text-white dark:hover:bg-destructive/80",
        outline:
          "border border-primary/25 bg-background text-foreground shadow-sm hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-primary/35 dark:bg-transparent dark:text-white dark:hover:border-primary/50 dark:hover:bg-primary/10 dark:hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 dark:bg-secondary dark:text-white dark:hover:bg-secondary/70",
        ghost:
          "text-foreground hover:bg-primary/5 hover:text-primary dark:text-white dark:hover:bg-primary/10 dark:hover:text-white",
        link:
          "text-primary underline-offset-4 hover:text-primary/80 hover:underline dark:text-white dark:hover:text-white/90",
        success:
          "bg-success text-white shadow-sm hover:bg-success/90 dark:hover:bg-success/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
