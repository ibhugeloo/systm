"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { STATUS_COLUMNS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants/pipeline"
import { Client } from "@/types/database"
import Link from "next/link"
import { toast } from "sonner"

type ClientCard = Pick<Client, "id" | "company_name" | "contact_name" | "sector" | "status" | "created_at">

interface KanbanBoardProps {
  clients: ClientCard[]
  locale: string
}

function DroppableColumn({
  status,
  children,
}: {
  status: Client["status"]
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div ref={setNodeRef} className="w-64 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
        <Badge variant="secondary" className="text-xs">
          {/* count is rendered by parent */}
        </Badge>
      </div>
      <div
        className={`space-y-2 min-h-24 rounded-lg p-1 transition-colors ${
          isOver ? "bg-primary/5 ring-2 ring-primary/20" : ""
        }`}
      >
        {children}
      </div>
    </div>
  )
}

function DraggableCard({
  client,
  locale,
}: {
  client: ClientCard
  locale: string
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: client.id,
    data: { client },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`${isDragging ? "opacity-30" : ""}`}
    >
      <Link href={`/${locale}/dashboard/clients/${client.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
          <CardContent className="p-3">
            <p className="font-medium text-sm truncate">{client.company_name}</p>
            <p className="text-xs text-muted-foreground truncate">{client.sector}</p>
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[client.status]}`}
              >
                {STATUS_LABELS[client.status]}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(client.created_at).toLocaleDateString(locale)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

function CardOverlay({ client }: { client: ClientCard }) {
  return (
    <Card className="shadow-xl w-64 rotate-2">
      <CardContent className="p-3">
        <p className="font-medium text-sm truncate">{client.company_name}</p>
        <p className="text-xs text-muted-foreground truncate">{client.sector}</p>
        <div className="flex items-center justify-between mt-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[client.status]}`}
          >
            {STATUS_LABELS[client.status]}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function KanbanBoard({ clients: initialClients, locale }: KanbanBoardProps) {
  const [clients, setClients] = useState(initialClients)
  const [activeClient, setActiveClient] = useState<ClientCard | null>(null)
  const supabase = createClient()

  // Require a small drag distance before starting to avoid interfering with clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const clientsByStatus = STATUS_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = clients.filter((c) => c.status === status)
      return acc
    },
    {} as Record<Client["status"], ClientCard[]>
  )

  const handleDragStart = (event: DragStartEvent) => {
    const client = event.active.data.current?.client as ClientCard
    if (client) setActiveClient(client)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveClient(null)
    const { active, over } = event

    if (!over) return

    const clientId = active.id as string
    const newStatus = over.id as Client["status"]
    const client = clients.find((c) => c.id === clientId)

    if (!client || client.status === newStatus) return

    // Optimistic update
    const previousClients = [...clients]
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
    )

    // Persist to database
    const { error } = await supabase
      .from("clients")
      .update({ status: newStatus })
      .eq("id", clientId)

    if (error) {
      // Rollback on error
      setClients(previousClients)
      toast.error("Échec de la mise à jour du statut")
      console.error("Status update error:", error)
    } else {
      toast.success(`${client.company_name} → ${STATUS_LABELS[newStatus]}`)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STATUS_COLUMNS.map((status) => (
            <DroppableColumn key={status} status={status}>
              {clientsByStatus[status].map((client) => (
                <DraggableCard key={client.id} client={client} locale={locale} />
              ))}

              {clientsByStatus[status].length === 0 && (
                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center text-xs text-muted-foreground">
                  Aucun client
                </div>
              )}
            </DroppableColumn>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeClient ? <CardOverlay client={activeClient} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
