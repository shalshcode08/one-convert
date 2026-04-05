import * as SelectPrimitive from "@radix-ui/react-select";
import * as React from "react";

import { cn } from "../lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-pointer items-center rounded px-1 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide outline-none transition-colors",
      "hover:bg-[var(--color-border)] disabled:pointer-events-none disabled:opacity-40",
      className,
    )}
    style={{
      backgroundColor: "var(--color-muted)",
      color: "var(--color-muted-foreground)",
    }}
    {...props}
  >
    {children}
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[80px] overflow-hidden rounded-lg border py-1",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        position === "popper" && "data-[side=bottom]:translate-y-1",
        className,
      )}
      style={{
        backgroundColor: "var(--color-background)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "cursor-pointer select-none px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wide outline-none transition-colors",
      "focus:bg-[var(--color-muted)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[state=checked]:font-bold",
      className,
    )}
    style={{ color: "var(--color-foreground)" }}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
};
