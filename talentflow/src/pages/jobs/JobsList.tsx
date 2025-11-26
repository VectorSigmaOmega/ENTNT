import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, GripVertical } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { Button, Input, Badge, Card } from "@/components/ui/Elements";
import { JobForm } from "./JobForm";
import type { Job } from "@/mocks/db";

// --- SORTABLE ROW COMPONENT ---
function SortableJobRow({ job, onEdit }: { job: Job; onEdit: (job: Job) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-lg mb-2 shadow-sm hover:border-blue-300 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{job.title}</h3>
          <Badge variant={job.status === "active" ? "success" : "secondary"}>
            {job.status}
          </Badge>
        </div>
        <div className="text-sm text-gray-500 mt-1 flex gap-2">
          <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-600">
            /{job.slug}
          </span>
          {job.tags.map((tag) => (
            <span key={tag} className="text-xs text-gray-500">#{tag}</span>
          ))}
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={() => onEdit(job)}>
        Edit
      </Button>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function JobsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { query, createMutation, updateMutation, reorderMutation } = useJobs({
    page,
    pageSize: 10,
    search,
    status: statusFilter,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && query.data) {
      const oldIndex = query.data.data.findIndex((item) => item.id === active.id);
      const newIndex = query.data.data.findIndex((item) => item.id === over?.id);
      
      const fromOrder = query.data.data[oldIndex].order;
      const toOrder = query.data.data[newIndex].order;

      // Trigger optimistic mutation
      reorderMutation.mutate({
        id: active.id as string,
        fromOrder,
        toOrder,
      });
    }
  };

  const handleFormSubmit = (data: any) => {
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, ...data }, {
        onSuccess: () => { setIsModalOpen(false); setEditingJob(null); }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { setIsModalOpen(false); }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Jobs Board</h1>
          <p className="text-gray-500">Manage open positions and pipeline.</p>
        </div>
        <Button onClick={() => { setEditingJob(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Job
        </Button>
      </div>

      {/* FILTERS */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search jobs..."
            className="pl-9"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setPage(1); setSearch(e.target.value); }}
          />
        </div>
        <select
          className="h-10 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={statusFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => { setPage(1); setStatusFilter(e.target.value); }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </Card>

      {/* JOB LIST */}
      {query.isLoading ? (
        <div className="text-center py-10">Loading jobs...</div>
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={query.data?.data.map(j => j.id) || []} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {query.data?.data.map((job) => (
                <SortableJobRow 
                  key={job.id} 
                  job={job} 
                  onEdit={(j) => { setEditingJob(j); setIsModalOpen(true); }} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* PAGINATION */}
      <div className="flex items-center justify-between pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {page} of {Math.ceil((query.data?.total || 0) / 10)}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => p + 1)}
          disabled={!query.data || page * 10 >= query.data.total}
        >
          Next
        </Button>
      </div>

      {/* CREATE/EDIT MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">
              {editingJob ? "Edit Job" : "Create New Job"}
            </h2>
            <JobForm 
              initialData={editingJob || undefined} 
              onSubmit={handleFormSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}