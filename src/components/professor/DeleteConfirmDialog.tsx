"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => Promise<any>;
  trigger?: React.ReactNode;
}

export function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  trigger,
}: DeleteConfirmDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
    }
  }

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      try {
        await onConfirm();
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete item"
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ? (
            <span />
          ) : (
            <Button variant="destructive" size="icon-xs" />
          )
        }
      >
        {trigger ?? <Trash2 className="h-3 w-3" />}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isPending} />}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
