import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, type JobFormData } from "@/lib/validations";
import { Button, Input } from "@/components/ui/Elements";
import type { Job } from "@/mocks/db";

interface JobFormProps {
  initialData?: Job;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function JobForm({ initialData, onSubmit, isLoading, onCancel }: JobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormData>({
    // zod schema uses a transform for `tags` (string -> string[]). The resolver
    // types don't line up perfectly for transformed output, so cast to `any`
    // to satisfy TypeScript while keeping runtime validation.
    resolver: zodResolver(jobSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      status: initialData?.status || "active",
      // Convert array to comma-separated string for input
      tags: (initialData?.tags || []).join(", ") as any,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Job Title</label>
        <Input {...register("title")} placeholder="e.g. Senior React Developer" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Slug</label>
        <Input {...register("slug")} placeholder="e.g. senior-react-dev" />
        {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <select
          {...register("status")}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tags (comma separated)</label>
        <Input {...register("tags")} placeholder="e.g. frontend, remote, typescript" />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Job" : "Create Job"}
        </Button>
      </div>
    </form>
  );
}