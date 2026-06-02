"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "right" | "left";
  }
>(({ className, children, side = "right", ...props }, ref) => (
  <SheetPortal>
    <DialogPrimitive.Overlay className="w3-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 z-50 flex h-full w-[88%] max-w-sm flex-col gap-6 border-border bg-bg p-6",
        side === "right"
          ? "right-0 border-l data-[state=open]:animate-[sheet-in-right_0.3s_ease-out] data-[state=closed]:animate-[sheet-out-right_0.25s_ease-in]"
          : "left-0 border-r data-[state=open]:animate-[sheet-in-left_0.3s_ease-out] data-[state=closed]:animate-[sheet-out-left_0.25s_ease-in]",
        className,
      )}
      {...props}
    >
      <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
      <DialogPrimitive.Close className="absolute right-5 top-5 rounded-lg p-1 text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <X className="size-6" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetClose, SheetContent };
