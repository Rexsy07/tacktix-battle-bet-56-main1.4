
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-tacktix-blue text-white hover:bg-tacktix-blue-dark shadow-md hover:shadow-lg",
        destructive: "bg-tacktix-red text-white hover:bg-tacktix-red-dark shadow-md hover:shadow-lg",
        outline: "border border-tacktix-blue text-tacktix-blue hover:bg-tacktix-blue/10",
        secondary: "bg-tacktix-dark-light text-white hover:bg-tacktix-dark",
        ghost: "text-tacktix-blue hover:bg-tacktix-blue/10",
        link: "text-tacktix-blue underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-tacktix-blue to-tacktix-blue-dark text-white hover:shadow-lg shadow-md hover:shadow-tacktix-blue/20 border border-tacktix-blue/20",
        glow: "bg-tacktix-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] hover:bg-tacktix-blue-dark",
        badge: "bg-gradient-to-r from-tacktix-blue/10 to-tacktix-blue/20 text-tacktix-blue hover:from-tacktix-blue/20 hover:to-tacktix-blue/30 border border-tacktix-blue/20",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        badge: "h-6 px-2 text-xs",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        pulseglow: "animate-pulse-glow",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
      rounded: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, rounded, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, animation, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
