"use client";
import { QuestionFab } from "./question-fab";

export function GlobalQuestionFab() {
  return (
    <QuestionFab onSubmit={(q) => console.log("[stub] question submitted:", q)} />
  );
}