"use client";

import { useState, useTransition } from "react";
import { profile } from "@/lib/api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Loader2 } from "lucide-react";

interface ProfileEditorProps {
  currentName: string;
  email: string;
}

export function ProfileEditor({ currentName, email }: ProfileEditorProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await profile.update(name);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update profile");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setName(currentName);
          setError(null);
        }
      }}
    >
      <DialogTrigger
        render={<Button variant="outline" size="sm" />}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit Profile
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your display name. Your email cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="full_name"
              className="text-sm font-medium leading-none"
            >
              Full Name
            </label>
            <Input
              id="full_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-muted-foreground">
              Email
            </label>
            <Input value={email} disabled className="opacity-60" />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
