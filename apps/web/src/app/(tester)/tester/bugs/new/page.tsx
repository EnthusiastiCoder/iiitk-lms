"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bug, Upload, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/motion/fade-in";
import { bugs as bugsApi, upload } from "@/lib/api";

const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical", color: "#EF4444" },
  { value: "high", label: "High", color: "#F97316" },
  { value: "medium", label: "Medium", color: "#EAB308" },
  { value: "low", label: "Low", color: "#22C55E" },
];

const MAX_SCREENSHOTS = 3;

export default function NewBugPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [screenshots, setScreenshots] = useState<
    { file: File; preview: string; url?: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_SCREENSHOTS - screenshots.length;
    const toAdd = files.slice(0, remaining);

    const newScreenshots = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setScreenshots((prev) => [...prev, ...newScreenshots]);
    e.target.value = "";
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // Upload screenshots first
      const screenshotUrls: string[] = [];
      if (screenshots.length > 0) {
        setUploading(true);
        for (const s of screenshots) {
          if (s.url) {
            screenshotUrls.push(s.url);
          } else {
            const result = await upload.file(s.file);
            screenshotUrls.push(result.url);
          }
        }
        setUploading(false);
      }

      await bugsApi.create({
        title: title.trim(),
        description: description.trim(),
        severity,
        screenshotUrls,
      });

      router.push("/tester/bugs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit bug.");
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <FadeIn>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Bug className="h-6 w-6" style={{ color: "#F59E0B" }} />
            Report a Bug
          </h1>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bug Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of the bug..."
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Steps to reproduce, expected behavior, actual behavior..."
                    rows={8}
                    required
                  />
                </div>

                {/* Severity */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Severity
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {SEVERITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSeverity(opt.value)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
                        style={{
                          borderColor:
                            severity === opt.value ? opt.color : "transparent",
                          backgroundColor:
                            severity === opt.value
                              ? `${opt.color}20`
                              : "rgba(128,128,128,0.1)",
                          color: severity === opt.value ? opt.color : undefined,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Screenshots */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Screenshots ({screenshots.length}/{MAX_SCREENSHOTS})
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {screenshots.map((s, i) => (
                      <div
                        key={i}
                        className="relative w-24 h-24 rounded-lg overflow-hidden border border-border"
                      >
                        <img
                          src={s.preview}
                          alt={`Screenshot ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(i)}
                          className="absolute top-1 right-1 p-0.5 rounded-full"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "#fff",
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {screenshots.length < MAX_SCREENSHOTS && (
                      <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors">
                        <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground">
                          Add image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="text-sm" style={{ color: "#EF4444" }}>
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    style={{ backgroundColor: "#F59E0B", color: "#000" }}
                    className="hover:opacity-90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        {uploading ? "Uploading..." : "Submitting..."}
                      </>
                    ) : (
                      "Submit Bug Report"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
