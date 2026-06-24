"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResourceMutation } from "@/hooks/use-resource";
import { apiError } from "@/lib/api";
import { AssetSelect } from "@/components/shared/asset-select";
import type { AssetRef } from "@/lib/types";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "textarea" | "select" | "asset";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  default?: string | number;
  colSpan?: 1 | 2;
}

export interface TransformExtras {
  assets: Record<string, AssetRef | null>;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  resource,
  fields,
  submitLabel = "Create",
  transform,
  successMessage,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  resource: string;
  fields: FieldDef[];
  submitLabel?: string;
  transform?: (values: Record<string, any>, extras: TransformExtras) => Record<string, any>;
  successMessage?: string;
}) {
  const { create } = useResourceMutation(resource);
  const [assetSel, setAssetSel] = React.useState<Record<string, AssetRef | null>>({});

  const initial = React.useMemo(() => {
    const obj: Record<string, any> = {};
    fields.forEach((f) => {
      obj[f.name] = f.default ?? (f.type === "select" ? f.options?.[0]?.value ?? "" : "");
    });
    return obj;
  }, [fields]);

  const [values, setValues] = React.useState<Record<string, any>>(initial);

  React.useEffect(() => {
    if (open) {
      setValues(initial);
      setAssetSel({});
    }
  }, [open, initial]);

  const set = (name: string, value: any) =>
    setValues((v) => ({ ...v, [name]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !String(values[f.name] ?? "").trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    const payload = transform ? transform(values, { assets: assetSel }) : values;
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "" || payload[k] === undefined) delete payload[k];
    });

    try {
      await create.mutateAsync(payload);
      toast.success(successMessage ?? `${title} successful`);
      onOpenChange(false);
    } catch (err) {
      toast.error("Action failed", { description: apiError(err) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 overflow-y-auto scrollbar-thin px-0.5 pb-1 max-h-[58vh]">
          {fields.map((f) => (
            <div
              key={f.name}
              className={
                f.colSpan === 2 || f.type === "textarea" || f.type === "asset"
                  ? "col-span-2 space-y-1.5"
                  : "col-span-2 space-y-1.5 sm:col-span-1"
              }
            >
              <Label htmlFor={f.name}>
                {f.label}
                {f.required && <span className="ml-0.5 text-destructive">*</span>}
              </Label>
              {f.type === "asset" ? (
                <AssetSelect
                  value={values[f.name]}
                  onChange={(asset) => {
                    set(f.name, asset?._id ?? "");
                    setAssetSel((s) => ({ ...s, [f.name]: asset }));
                  }}
                  placeholder={f.placeholder}
                />
              ) : f.type === "select" ? (
                <Select value={values[f.name]} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger id={f.name} className="h-10">
                    <SelectValue placeholder={f.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === "textarea" ? (
                <textarea
                  id={f.name}
                  value={values[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-soft placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              ) : (
                <Input
                  id={f.name}
                  type={f.type ?? "text"}
                  value={values[f.name]}
                  onChange={(e) =>
                    set(f.name, f.type === "number" ? e.target.valueAsNumber || 0 : e.target.value)
                  }
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
          </div>

          <DialogFooter className="border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={create.isPending}>
              {create.isPending && <Loader2 className="size-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
