import { useParams, Link } from "react-router-dom";
import { useCandidateDetails } from "@/hooks/useCandidateDetails";
import { Button, Card, Badge, Input } from "@/components/ui/Elements";
import { ArrowLeft, User, Mail, Clock, Send } from "lucide-react";
import { useState } from "react";

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const { candidateQuery, timelineQuery, notesQuery, addNoteMutation } = useCandidateDetails(id!);
  const [noteContent, setNoteContent] = useState("");

  if (candidateQuery.isLoading) return <div className="p-8">Loading profile...</div>;
  if (candidateQuery.error || !candidateQuery.data) return <div className="p-8">Candidate not found</div>;

  const candidate = candidateQuery.data;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addNoteMutation.mutate(noteContent, {
      onSuccess: () => setNoteContent(""),
    });
  };

  // Helper to render mentions
  const renderNoteContent = (content: string) => {
    return content.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith("@")) {
        return <span key={i} className="text-blue-600 font-medium">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/candidates" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Candidates
      </Link>

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
            <div className="flex items-center gap-3 text-gray-500 mt-1">
              <span className="flex items-center gap-1 text-sm">
                <Mail className="w-4 h-4" /> {candidate.email}
              </span>
              <Badge variant="secondary">{candidate.stage}</Badge>
            </div>
          </div>
        </div>
        {/* Placeholder for actions */}
        <div className="flex gap-2">
          <Button variant="outline">Reject</Button>
          <Button>Move to Next Stage</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TIMELINE */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Timeline
            </h2>
            <div className="space-y-6 relative border-l-2 border-gray-100 ml-3 pl-6">
              {timelineQuery.data?.timeline.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 border-2 border-white ring-1 ring-gray-100" />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">Moved to {event.stage}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {timelineQuery.data?.timeline.length === 0 && (
                <p className="text-gray-500 text-sm">No history yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* NOTES */}
        <div className="space-y-6">
          <Card className="p-6 flex flex-col h-full max-h-[600px]">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {notesQuery.data?.map((note) => (
                <div key={note.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="mb-1 text-gray-800 break-words">
                    {renderNoteContent(note.content)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(note.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
              {notesQuery.data?.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No notes added.</p>
              )}
            </div>

            <form onSubmit={handleAddNote} className="relative">
              <Input
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note (@mention)..."
                className="pr-10"
              />
              <button 
                type="submit" 
                disabled={!noteContent.trim() || addNoteMutation.isPending}
                className="absolute right-2 top-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
