"use client";

import { Info, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeEditor } from "@/components/editor/CodeEditor";

export interface ContentSection {
  type: "text" | "code" | "callout";
  content?: string;
  code?: string;
  language?: string;
  variant?: string;
}

const calloutStyles: Record<
  string,
  { icon: typeof Info; bg: string; border: string; text: string }
> = {
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  tip: {
    icon: Lightbulb,
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-700 dark:text-green-400",
  },
};

export function SectionRenderer({ section }: { section: ContentSection }) {
  if (section.type === "text") {
    return (
      <div className="leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {section.content}
      </div>
    );
  }

  if (section.type === "code") {
    const codeValue = section.code ?? section.content ?? "";
    return (
      <div className="rounded-lg overflow-hidden ring-1 ring-foreground/10">
        {section.language && (
          <div className="bg-muted px-4 py-1.5 text-xs text-muted-foreground font-mono border-b">
            {section.language}
          </div>
        )}
        <CodeEditor
          value={codeValue}
          onChange={() => {}}
          language={section.language}
          readOnly={true}
          height="auto"
        />
      </div>
    );
  }

  if (section.type === "callout") {
    const style =
      calloutStyles[section.variant ?? "info"] ?? calloutStyles.info;
    const Icon = style.icon;

    return (
      <div
        className={cn(
          "rounded-lg border p-4 flex gap-3",
          style.bg,
          style.border
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", style.text)} />
        <p className={cn("text-sm leading-relaxed", style.text)}>
          {section.content}
        </p>
      </div>
    );
  }

  return null;
}
