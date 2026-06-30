"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className={cn(
                  "fixed left-1/2 top-1/2 z-[96] flex w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-eoc-border bg-eoc-surface shadow-2xl",
                  width,
                )}
              >
                <div className="flex items-start justify-between gap-4 border-b border-eoc-border p-5">
                  <div>
                    <Dialog.Title className="text-base font-semibold text-eoc-fg">{title}</Dialog.Title>
                    {description && <p className="mt-1 text-xs text-eoc-muted">{description}</p>}
                  </div>
                  <Dialog.Close className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-eoc-muted transition-colors hover:bg-white/5 hover:text-eoc-fg">
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

const fieldBase =
  "h-10 w-full rounded-xl border border-eoc-border bg-white/[0.03] px-3 text-sm text-eoc-fg outline-none transition-colors placeholder:text-eoc-muted focus:border-eoc-accent/60 focus:ring-2 focus:ring-eoc-accent/20";

export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className="text-xs font-medium text-eoc-fg2">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-eoc-muted">{hint}</span>}
    </label>
  );
}

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldBase, className)} {...props} />,
);
TextInput.displayName = "TextInput";

export const SelectInput = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(fieldBase, "appearance-none bg-eoc-surface", className)} {...props}>
      {children}
    </select>
  ),
);
SelectInput.displayName = "SelectInput";
