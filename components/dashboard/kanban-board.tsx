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
import { STATUS_COLUMNS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants/pipeline"
import { Client } from "@/types/database"
import Link from "next/link"
import { toast } from "sonner"
import { Building2, GripVertical } from "lucide-react"

type ClientCard = Pick<Client, "id" | "company_name" | "contact_name" | "sector" | "status" | "created_at">

interface KanbanBoardProps {
  clients: ClientCard[]
  locale: string
}

const COLUMN_COLORS: Record<string, { dot: string; header: string }> = {
  onboarding: { dot: "bg-blue-500", header: "border-blue-200" },
  mvp_generated: { dot: "bg-violet-500", header: "border-violet-200" },
  demo_scheduled: { dot: "bg-amber-500", header: "border-amber-200" },
  demo_done: { dot: "bg-emerald-500", header: "border-emerald-200" },
  handoff_sent: { dot: "bg-cyan-500", header: "border-cyan-200" },
  in_production: { dot: "bg-orange-500", header: "border-orange-200" },
  closed: { dot: "bg-slate-400", header: "border-slate-200" },
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function DroppableColumn({
  status,
  count,
  children,
}: {
  status: Client["status"]
  count: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const colors = COLUMN_COLORS[status] || COLUMN_COLORS.onboarding

  return (
    <div ref={setNodeRef} className="w-72 flex-shrink-0">
      <div className={`flex items-center gap-2.5 mb-3 pb-2 border-b-2 ${colors.header}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
        <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium ml-auto">
          {count}
        </span>
      </div>
      <div
        className={`space-y-2 min-h-28 rounded-xl p-2 transition-all duration-200 ${
          isOver ? "bg-primary/5 ring-2 ring-primary/20 scale-[1.01]" : "bg-transparent"
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
      className={`transition-all duration-200 ${isDragging ? "opacity-30 scale-95" : ""}`}
    >
      <Link href={`/${locale}/dashboard/projects/${client.id}`}>
        <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-grab active:cursor-grabbing">
          <CardContent className="p-3">
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5">
                {getInitials(client.company_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{client.company_name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{client.sector}</p>
              </div>
              <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
            </div>
            {client.contact_name && (
              <p className="text-xs text-muted-foreground mt-2 pl-10 truncate">
                {client.contact_name}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

function CardOverlay({ client }: { client: ClientCard }) {
  return (
    <Card className="shadow-2xl w-72 rotate-2 border-primary/30">
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {getInitials(client.company_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{client.company_name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{client.sector}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function KanbanBoard({ clients: initialClients, locale }: KanbanBoardProps) {
  const [clients, setClients] = useState(initialClients)
  const [activeClient, setActiveClient] = useState<ClientCard | null>(null)
  const supabase = createClient()

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

    const previousClients = [...clients]
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
    )

    const { error } = await supabase
      .from("clients")
      .update({ status: newStatus })
      .eq("id", clientId)

    if (error) {
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
        <div className="flex gap-5 min-w-max">
          {STATUS_COLUMNS.map((status) => (
            <DroppableColumn key={status} status={status} count={clientsByStatus[status].length}>
              {clientsByStatus[status].map((client) => (
                <DraggableCard key={client.id} client={client} locale={locale} />
              ))}

              {clientsByStatus[status].length === 0 && (
                <div className="border border-dashed border-muted-foreground/20 rounded-xl p-6 text-center">
                  <Building2 className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/50">Aucun client</p>
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
