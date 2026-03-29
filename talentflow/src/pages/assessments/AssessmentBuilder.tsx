import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAssessment } from "@/hooks/useAssessment";
import { Button, Input, Card } from "@/components/ui/Elements";
import { ArrowLeft, Plus, Trash2, Save, Eye } from "lucide-react";
import { AssessmentRunner } from "./AssessmentRunner";
import type { Assessment } from "@/mocks/db";

const QUESTION_TYPES = [
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "numeric", label: "Numeric" },
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multi Choice" },
  { value: "file", label: "File Upload" },
];

export default function AssessmentBuilder() {
  const { jobId } = useParams<{ jobId: string }>();
  const { query, saveMutation } = useAssessment(jobId!);
  
  const [assessment, setAssessment] = useState<Assessment>({
    jobId: jobId!,
    sections: [],
  });

  // Sync with fetched data
  useEffect(() => {
    if (query.data && query.data.sections) {
      setAssessment(query.data);
    }
  }, [query.data]);

  const addSection = () => {
    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, { title: "New Section", questions: [] }]
    }));
  };

  const updateSectionTitle = (sIdx: number, title: string) => {
    const newSections = [...assessment.sections];
    newSections[sIdx].title = title;
    setAssessment({ ...assessment, sections: newSections });
  };

  const deleteSection = (sIdx: number) => {
    const newSections = [...assessment.sections];
    newSections.splice(sIdx, 1);
    setAssessment({ ...assessment, sections: newSections });
  };

  const addQuestion = (sIdx: number) => {
    const newSections = [...assessment.sections];
    newSections[sIdx].questions.push({
      type: "short-text",
      question: "New Question",
      options: ["Option 1", "Option 2"],
    });
    setAssessment({ ...assessment, sections: newSections });
  };

  const updateQuestion = (sIdx: number, qIdx: number, field: string, value: any) => {
    const newSections = [...assessment.sections];
    newSections[sIdx].questions[qIdx] = {
      ...newSections[sIdx].questions[qIdx],
      [field]: value,
    };
    setAssessment({ ...assessment, sections: newSections });
  };

  const deleteQuestion = (sIdx: number, qIdx: number) => {
    const newSections = [...assessment.sections];
    newSections[sIdx].questions.splice(qIdx, 1);
    setAssessment({ ...assessment, sections: newSections });
  };

  const handleSave = () => {
    saveMutation.mutate(assessment);
  };

  if (query.isLoading) return <div className="p-8">Loading builder...</div>;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/jobs" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
            <p className="text-sm text-gray-500">Design the screening process for this job.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Assessment"}
        </Button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* EDITOR PANE */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {assessment.sections.map((section, sIdx) => (
            <Card key={sIdx} className="p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <Input 
                  value={section.title} 
                  onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                  className="font-bold text-lg border-transparent hover:border-gray-300 focus:border-blue-500"
                />
                <Button variant="ghost" size="sm" onClick={() => deleteSection(sIdx)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 pl-4 border-l border-gray-100">
                {section.questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-gray-50 p-3 rounded-lg space-y-3">
                    <div className="flex gap-2">
                      <Input 
                        value={q.question} 
                        onChange={(e) => updateQuestion(sIdx, qIdx, "question", e.target.value)}
                        placeholder="Question text"
                        className="flex-1"
                      />
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(sIdx, qIdx, "type", e.target.value)}
                        className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <Button variant="ghost" size="sm" onClick={() => deleteQuestion(sIdx, qIdx)}>
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>

                    {(q.type === "single-choice" || q.type === "multi-choice") && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Options (comma separated)</label>
                        <Input 
                          value={q.options?.join(", ")} 
                          onChange={(e) => updateQuestion(sIdx, qIdx, "options", e.target.value.split(",").map(s => s.trim()))}
                          placeholder="Option 1, Option 2..."
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                <Button variant="outline" size="sm" onClick={() => addQuestion(sIdx)} className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </div>
            </Card>
          ))}

          <Button onClick={addSection} className="w-full py-8 border-2 border-dashed border-gray-300 bg-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-400">
            <Plus className="w-6 h-6 mr-2" /> Add Section
          </Button>
        </div>

        {/* PREVIEW PANE */}
        <div className="w-[400px] bg-gray-100 rounded-xl p-4 overflow-y-auto hidden lg:block border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <Eye className="w-4 h-4" /> <span className="text-sm font-medium">Live Preview</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-[500px]">
            <AssessmentRunner assessment={assessment} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}
