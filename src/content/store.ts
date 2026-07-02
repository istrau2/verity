import type { SentenceMatch } from "../shared/types";

/**
 * Shared in-memory state for the content script. Both the light-DOM highlighter
 * (index.tsx) and the shadow-DOM React overlay run in the same content-script
 * context, so a module singleton is the simplest bridge between them.
 */

/** A sentence occurrence located in the page, plus its resolved claim state. */
export interface SentenceRecord extends SentenceMatch {
  /** Paragraph element the sentence lives in. */
  el: HTMLElement;
  /** Char offsets within `el.textContent`. */
  start: number;
  end: number;
}

export const records = new Map<string, SentenceRecord>();

export const page = { url: location.href, title: document.title };

/** Simple typed event bus over DOM CustomEvents (namespaced verity:*). */
export type Bus = {
  hover: { sentenceId: string };
  hoverEnd: {};
  open: { sentenceId: string };
  create: { sentenceId: string; text: string };
};

export function emit<K extends keyof Bus>(type: K, detail: Bus[K]) {
  document.dispatchEvent(new CustomEvent(`verity:${type}`, { detail }));
}

export function on<K extends keyof Bus>(type: K, cb: (d: Bus[K]) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  document.addEventListener(`verity:${type}`, handler);
  return () => document.removeEventListener(`verity:${type}`, handler);
}
