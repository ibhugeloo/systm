"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_COLUMNS, STATUS_LABELS } from "@/lib/constants/pipeline"
import { Client } from "@/types/database"
import { toast } from "sonner"

interface ClientStatusSelectProps {
  clientId: string
  currentStatus: Client["status"]
}

export default function ClientStatusSelect({
  clientId,
  currentStatus,
}: ClientStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleStatusChange = async (newStatus: string) => {
    const typedStatus = newStatus as Client["status"]
    if (typedStatus === status) return

    setIsUpdating(true)
    const previousStatus = status
    setStatus(typedStatus)

    const { error } = await supabase
      .from("clients")
      .update({ status: typedStatus })
      .eq("id", clientId)

    if (error) {
      setStatus(previousStatus)
      toast.error("Échec de la mise à jour du statut")
      console.error("Status update error:", error)
    } else {
      toast.success(`Statut mis à jour : ${STATUS_LABELS[typedStatus]}`)
      router.refresh()
    }

    setIsUpdating(false)
  }

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_COLUMNS.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
