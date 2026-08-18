/**
 * neoarc-agentic-ui / conversation / MessageContentRenderer
 *
 * Purpose: render a `ConversationMessage.content` block list (`TextBlock` /
 * `MarkdownBlock`) safely. `MarkdownBlock` uses a minimal, dependency-free
 * inline formatter (bold, italic, inline code, links) rather than pulling in
 * a full CommonMark dependency — see the doc comment on `MarkdownBlock` in
 * `neoarc-agentic-contracts/conversation.ts`. Products needing complete
 * Markdown fidelity (tables, lists, block quotes, ...) should substitute
 * their own renderer via composition; this component intentionally does not
 * grow into one.
 *
 * Input model: `blocks: MessageContentBlock[]`.
 *
 * Security: never uses `dangerouslySetInnerHTML`. Inline formatting is
 * parsed into a plain React node tree, so arbitrary HTML in supplied content
 * is rendered as literal text, not executed.
 */

import * as React from "react"
import type { MessageContentBlock } from "../../neoarc-agentic-contracts/conversation"
import { cn } from "../lib/cn"

const INLINE_PATTERN = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  INLINE_PATTERN.lastIndex = 0
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    const [, code, bold, italic, linkText, linkHref] = match
    if (code !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded-[var(--neoarc-radius-sm)] bg-[var(--neoarc-color-surface-muted)] px-1 py-0.5 font-mono text-[0.85em]"
        >
          {code}
        </code>,
      )
    } else if (bold !== undefined) {
      nodes.push(<strong key={key++} className="font-semibold">{bold}</strong>)
    } else if (italic !== undefined) {
      nodes.push(<em key={key++}>{italic}</em>)
    } else if (linkText !== undefined && linkHref !== undefined) {
      nodes.push(
        <a
          key={key++}
          href={linkHref}
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-2 text-[var(--neoarc-color-accent)] hover:text-[var(--neoarc-color-accent)]"
        >
          {linkText}
        </a>,
      )
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

export interface MessageContentRendererProps {
  readonly blocks: readonly MessageContentBlock[]
  readonly className?: string
}

export function MessageContentRenderer({ blocks, className }: MessageContentRendererProps) {
  return (
    <div className={cn("flex flex-col gap-2 text-sm leading-relaxed text-[var(--neoarc-color-foreground)]", className)}>
      {blocks.map((block, index) =>
        block.kind === "text" ? (
          <p key={index} className="whitespace-pre-wrap text-pretty">
            {block.text}
          </p>
        ) : (
          <p key={index} className="whitespace-pre-wrap text-pretty">
            {parseInline(block.markdown)}
          </p>
        ),
      )}
    </div>
  )
}
