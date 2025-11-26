import { useForm } from "react-hook-form";
import { Button, Input, Card } from "@/components/ui/Elements";
import type { Assessment } from "@/mocks/db";

interface AssessmentRunnerProps {
  assessment: Assessment;
  onSubmit?: (data: any) => void;
  readOnly?: boolean;
}

export function AssessmentRunner({ assessment, onSubmit, readOnly }: AssessmentRunnerProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (!assessment.sections || assessment.sections.length === 0) {
    return <div className="text-center text-gray-500 py-8">No questions in this assessment yet.</div>;
  }

  return (
    <form onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined} className="space-y-8">
      {assessment.sections.map((section, sIdx) => (
        <Card key={sIdx} className="p-6 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">{section.title}</h3>
          
          {section.questions.map((q, qIdx) => {
            const fieldName = `s${sIdx}_q${qIdx}`;
            
            return (
              <div key={qIdx} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {q.question} <span className="text-red-500">*</span>
                </label>
                
                {q.type === "short-text" && (
                  <Input 
                    {...register(fieldName, { required: true })} 
                    disabled={readOnly}
                    placeholder="Short answer text"
                  />
                )}

                {q.type === "long-text" && (
                  <textarea
                    {...register(fieldName, { required: true })}
                    disabled={readOnly}
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Long answer text"
                  />
                )}

                {q.type === "numeric" && (
                  <Input 
                    type="number"
                    {...register(fieldName, { required: true })} 
                    disabled={readOnly}
                    placeholder="0"
                  />
                )}

                {q.type === "single-choice" && (
                  <div className="space-y-2">
                    {q.options?.map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          value={opt}
                          {...register(fieldName, { required: true })}
                          disabled={readOnly}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "multi-choice" && (
                  <div className="space-y-2">
                    {q.options?.map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={opt}
                          {...register(fieldName)} // Multi-choice validation is trickier, skipping required for now
                          disabled={readOnly}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                 {q.type === "file" && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-500">File upload stub</p>
                  </div>
                )}
                
                {errors[fieldName] && <p className="text-sm text-red-500">This field is required</p>}
              </div>
            );
          })}
        </Card>
      ))}

      {!readOnly && (
        <div className="flex justify-end">
          <Button type="submit" size="lg">Submit Assessment</Button>
        </div>
      )}
    </form>
  );
}
