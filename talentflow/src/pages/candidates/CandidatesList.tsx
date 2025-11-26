import { useState, useMemo } from "react";
import { VirtualList } from "@/components/VirtualList";
import { useCandidates } from "@/hooks/useCandidates";
import { Input, Card, Badge } from "@/components/ui/Elements";
import { Search, User, Briefcase, LayoutList, Kanban } from "lucide-react";
import { Link } from "react-router-dom";
import { KanbanBoard } from "./KanbanBoard";

export default function CandidatesList() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [view, setView] = useState<"list" | "board">("list");
  
  // Fetch all candidates for the selected stage (or all if no stage)
  const { query, updateMutation } = useCandidates({
    page: 1,
    pageSize: 2000, 
    search: "", 
    stage: view === "board" ? "" : stageFilter, // Disable stage filter in board view (it shows all cols)
  });

  const candidates = query.data?.data || [];

  // Client-side search
  const filteredCandidates = useMemo(() => {
    if (!search) return candidates;
    const lowerSearch = search.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.email.toLowerCase().includes(lowerSearch)
    );
  }, [candidates, search]);

  const handleStageChange = (id: string, newStage: string) => {
    updateMutation.mutate({ id, stage: newStage } as any);
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const candidate = filteredCandidates[index];
    if (!candidate) return null;
    return (
      <div style={style} className="px-2 py-1">
        <Link 
          to={`/candidates/${candidate.id}`}
          className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors h-full"
        >
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{candidate.name}</h3>
              <Badge variant="secondary">{candidate.stage}</Badge>
            </div>
            <p className="text-sm text-gray-500 truncate">{candidate.email}</p>
          </div>

          <div className="text-gray-400">
            <Briefcase className="w-4 h-4" />
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Candidates</h1>
          <p className="text-gray-500">View and manage candidate pipeline.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-md text-sm font-medium transition-all ${view === "list" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("board")}
            className={`p-2 rounded-md text-sm font-medium transition-all ${view === "board" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
          >
            <Kanban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search candidates (client-side)..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {view === "list" && (
          <select
            className="h-10 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screen">Screen</option>
            <option value="tech">Tech</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </Card>

      {/* CONTENT */}
      <div className="flex-1 border rounded-md bg-gray-50 overflow-hidden relative">
        {query.isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading candidates...</div>
        ) : filteredCandidates.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">No candidates found.</div>
        ) : view === "list" ? (
          <VirtualList
            height={600} 
            itemCount={filteredCandidates.length}
            itemSize={80}
            width="100%"
          >
            {Row}
          </VirtualList>
        ) : (
          <div className="h-full p-4 overflow-x-auto">
            <KanbanBoard candidates={filteredCandidates} onStageChange={handleStageChange} />
          </div>
        )}
      </div>
    </div>
  );
}
