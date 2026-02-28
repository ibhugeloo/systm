"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface HandoffPreviewProps {
  markdownContent: string
}

export default function HandoffPreview({
  markdownContent,
}: HandoffPreviewProps) {
  return (
    <div className="prose prose-invert max-w-none dark:prose-invert prose-p:text-sm prose-headings:text-base prose-a:text-blue-400 prose-code:text-purple-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdownContent}
      </ReactMarkdown>
    </div>
  )
}
