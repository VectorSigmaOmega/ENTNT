import { useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Candidate } from "@/mocks/db";
import { Card, Badge } from "@/components/ui/Elements";
import { User } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

interface KanbanBoardProps {
  candidates: Candidate[];
  onStageChange: (id: string, newStage: string) => void;
}

export function KanbanBoard({ candidates, onStageChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = useMemo(() => {
    const cols: Record<string, Candidate[]> = {};
    STAGES.forEach((s) => (cols[s] = []));
    candidates.forEach((c) => {
      if (cols[c.stage]) cols[c.stage].push(c);
    });
    return cols;
  }, [candidates]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      // Find the candidate
      const candidate = candidates.find((c) => c.id === active.id);
      if (candidate && over.id !== candidate.stage) {
        // If dropped on a column (container id is the stage)
        if (STAGES.includes(over.id as string)) {
           onStageChange(active.id as string, over.id as string);
        }
      }
    }
  };

  const activeCandidate = activeId ? candidates.find((c) => c.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <Column key={stage} stage={stage} candidates={columns[stage]} />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeCandidate ? <CandidateCard candidate={activeCandidate} isOverlay /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

function Column({ stage, candidates }: { stage: string; candidates: Candidate[] }) {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-72 bg-gray-50 rounded-lg p-3 flex flex-col h-full">
      <h3 className="font-semibold text-gray-700 mb-3 uppercase text-xs tracking-wider flex justify-between">
        {stage} <Badge variant="secondary">{candidates.length}</Badge>
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
        {candidates.map((c) => (
          <DraggableCandidate key={c.id} candidate={c} />
        ))}
      </div>
    </div>
  );
}

function DraggableCandidate({ candidate }: { candidate: Candidate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <CandidateCard candidate={candidate} />
    </div>
  );
}

function CandidateCard({ candidate, isOverlay }: { candidate: Candidate; isOverlay?: boolean }) {
  return (
    <Card className={`p-3 cursor-grab hover:shadow-md transition-shadow ${isOverlay ? "shadow-xl rotate-2 cursor-grabbing" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">{candidate.name}</h4>
          <p className="text-xs text-gray-500 truncate">{candidate.email}</p>
        </div>
      </div>
    </Card>
  );
}
