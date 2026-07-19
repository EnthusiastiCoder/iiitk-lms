"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAchievement } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export function CreateAchievementDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [category, setCategory] = useState("learning");
  const [rarity, setRarity] = useState("common");
  const [xpReward, setXpReward] = useState("50");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      try {
        await createAchievement({
          title,
          description,
          icon: icon || "🏆",
          category,
          rarity,
          xp_reward: parseInt(xpReward, 10) || 50,
        });
        setOpen(false);
        setTitle("");
        setDescription("");
        setIcon("");
        setCategory("learning");
        setRarity("common");
        setXpReward("50");
        router.refresh();
      } catch (err: any) {
        alert(err.message ?? "Failed to create achievement");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button style={{ backgroundColor: "#FF4B4B", color: "white" }} />
        }
      >
        <Plus className="h-4 w-4 mr-1" />
        Create Achievement
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Achievement</DialogTitle>
            <DialogDescription>
              Add a new achievement badge for students to earn.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Title
              </label>
              <Input
                placeholder="e.g. First Steps"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Description
              </label>
              <Input
                placeholder="e.g. Complete your first lesson"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <div className="w-20">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Icon
                </label>
                <Input
                  placeholder="🏆"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="text-center text-lg"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  XP Reward
                </label>
                <Input
                  type="number"
                  placeholder="50"
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Category
                </label>
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="mastery">Mastery</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Rarity
                </label>
                <Select value={rarity} onValueChange={(v) => v && setRarity(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              style={{ backgroundColor: "#FF4B4B", color: "white" }}
            >
              {isPending ? "Creating..." : "Create Achievement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
