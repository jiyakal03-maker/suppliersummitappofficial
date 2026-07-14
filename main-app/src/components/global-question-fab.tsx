"use client";
import { usePathname } from "next/navigation";
import { QuestionFab } from "./question-fab";

/** Routes with no event content to ask a question about — pre-login and the
 * one-time post-login welcome reveal. */
const HIDDEN_ON = ["/login", "/welcome"];

export function GlobalQuestionFab() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <QuestionFab onSubmit={(q) => console.log("[stub] question submitted:", q)} />
  );
}