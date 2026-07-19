"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FlashcardDeckProps {
  title: string;
  cards: { front: string; back: string }[];
}

export function FlashcardDeck({ title, cards: initialCards }: FlashcardDeckProps) {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  const card = cards[currentIndex];

  const goTo = useCallback(
    (index: number, dir: number) => {
      setFlipped(false);
      setDirection(dir);
      // Small delay so flip reset is visible before card changes
      setTimeout(() => setCurrentIndex(index), 80);
    },
    []
  );

  const prev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1, -1);
  };

  const next = () => {
    if (currentIndex < cards.length - 1) goTo(currentIndex + 1, 1);
  };

  const shuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
    setMasteredCount(0);
  };

  const reset = () => {
    setCards(initialCards);
    setCurrentIndex(0);
    setFlipped(false);
    setMasteredCount(0);
  };

  const markMastered = () => {
    setMasteredCount((c) => c + 1);
    next();
  };

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="rounded-xl border bg-card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={shuffle}
            title="Shuffle cards"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={reset}
            title="Reset deck"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted mb-5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Card */}
      <div className="flex justify-center mb-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div
              className="relative cursor-pointer select-none"
              style={{ perspective: "1000px" }}
              onClick={() => setFlipped(!flipped)}
            >
              <motion.div
                className="relative w-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Front */}
                <div
                  className={cn(
                    "rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
                    "p-6 sm:p-8 min-h-[200px] flex flex-col items-center justify-center text-center",
                    "backface-hidden"
                  )}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/50 mb-3">
                    Question
                  </span>
                  <p className="text-base sm:text-lg font-medium leading-relaxed">
                    {card.front}
                  </p>
                  <span className="text-[11px] text-muted-foreground mt-4">
                    Tap to reveal answer
                  </span>
                </div>

                {/* Back */}
                <div
                  className={cn(
                    "rounded-xl border-2 border-brand/20 bg-gradient-to-br from-brand/5 to-brand/10",
                    "p-6 sm:p-8 min-h-[200px] flex flex-col items-center justify-center text-center",
                    "absolute inset-0"
                  )}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand/50 mb-3">
                    Answer
                  </span>
                  <p className="text-base sm:text-lg font-medium leading-relaxed">
                    {card.back}
                  </p>
                  <span className="text-[11px] text-muted-foreground mt-4">
                    Tap to see question
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={prev}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        <span className="text-sm text-muted-foreground font-medium tabular-nums">
          {currentIndex + 1} / {cards.length}
          {masteredCount > 0 && (
            <span className="text-brand ml-2">
              ({masteredCount} mastered)
            </span>
          )}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={next}
          disabled={currentIndex === cards.length - 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
