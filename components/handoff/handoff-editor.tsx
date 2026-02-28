"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Bold,
  Italic,
  Heading2,
  List,
  Link2,
  Code,
} from "lucide-react"
import HandoffPreview from "./handoff-preview"

interface HandoffEditorProps {
  handoffId: string
  initialContent: string
  clientId: string
}

export default function HandoffEditor({
  handoffId,
  initialContent,
  clientId,
}: HandoffEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const autoSave = useCallback(async (contentToSave: string) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("handoffs")
        .update({
          markdown_content: contentToSave,
        })
        .eq("id", handoffId)

      if (error) throw error

      setLastSaved(new Date().toISOString())
    } catch (error) {
      console.error("Failed to auto-save:", error)
    } finally {
      setIsSaving(false)
    }
  }, [handoffId, supabase])

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(content)
    }, 1000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [content, autoSave])

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const newContent =
      content.substring(0, start) +
      before +
      selected +
      after +
      content.substring(end)

    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length + selected.length
    }, 0)
  }

  const markdownTools = [
    {
      label: "Gras",
      icon: Bold,
      before: "**",
      after: "**",
    },
    {
      label: "Italique",
      icon: Italic,
      before: "_",
      after: "_",
    },
    {
      label: "Titre",
      icon: Heading2,
      before: "## ",
    },
    {
      label: "Liste",
      icon: List,
      before: "- ",
    },
    {
      label: "Lien",
      icon: Link2,
      before: "[texte](url)",
    },
    {
      label: "Code",
      icon: Code,
      before: "`",
      after: "`",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Editor */}
      <div className="flex flex-col space-y-2">
        <div className="flex gap-1 flex-wrap bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
          {markdownTools.map((tool) => (
            <Button
              key={tool.label}
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown(tool.before, tool.after)}
              title={tool.label}
              className="h-8 w-8 p-0"
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez votre handoff en Markdown..."
          className="flex-1 font-mono text-xs resize-none"
        />

        {lastSaved && (
          <div className="text-xs text-gray-500">
            Dernier enregistrement:{" "}
            {new Date(lastSaved).toLocaleTimeString("fr-FR")}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <HandoffPreview markdownContent={content} />
      </div>
    </div>
  )
}
