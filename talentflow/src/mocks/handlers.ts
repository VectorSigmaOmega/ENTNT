// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { db } from "./db";
import type { Job, Candidate } from "./db";

// Helper to simulate network latency + occasional errors
async function simulateNetwork(isWrite = false) {
  const latency = Math.floor(Math.random() * 1001) + 200; // 200–1200ms
  await new Promise((res) => setTimeout(res, latency));

  if (isWrite && Math.random() < 0.1) {
    return HttpResponse.json({ error: "Simulated server error" }, { status: 500 });
  }
}

// ---------------------- JOBS ----------------------
export const handlers = [
  // GET /jobs
  http.get("/jobs", async ({ request }) => {
    await simulateNetwork();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status");
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 10);

    let jobs = await db.jobs.toArray();
    if (search) jobs = jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()));
    if (status) jobs = jobs.filter((j) => j.status === status);

    const start = (page - 1) * pageSize;
    const paginated = jobs.slice(start, start + pageSize);

    return HttpResponse.json({ data: paginated, total: jobs.length });
  }),

  // POST /jobs
  http.post("/jobs", async ({ request }) => {
    const error = await simulateNetwork(true);
    if (error) return error;

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return HttpResponse.json({ error: "Invalid job data" }, { status: 400 });
    }
    await db.jobs.add(body as Job);
    return HttpResponse.json(body, { status: 201 });
  }),

  // PATCH /jobs/:id
  http.patch("/jobs/:id", async ({ params, request }) => {
    const error = await simulateNetwork(true);
    if (error) return error;

    const { id } = params;
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return HttpResponse.json({ error: "Invalid job update data" }, { status: 400 });
    }
    await db.jobs.update(id as string, body as Partial<Job>);
    return HttpResponse.json({ id, ...(body as object) });
  }),

  // PATCH /jobs/:id/reorder
  http.patch("/jobs/:id/reorder", async ({ request }) => {
    const error = await simulateNetwork(true);
    if (error) return error;

    const body = await request.json();
    if (!body || typeof body !== "object" || typeof body.fromOrder !== "number" || typeof body.toOrder !== "number") {
      return HttpResponse.json({ error: "Invalid reorder data" }, { status: 400 });
    }
    const { fromOrder, toOrder } = body as { fromOrder: number; toOrder: number };

    const jobs = await db.jobs.toArray();
    const movingJob = jobs.find((j) => j.order === fromOrder);
    if (movingJob) {
      movingJob.order = toOrder;
      await db.jobs.put(movingJob);
    }

    return HttpResponse.json({ success: true });
  }),

  // ---------------------- CANDIDATES ----------------------

  // GET /candidates
  http.get("/candidates", async ({ request }) => {
    await simulateNetwork();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const stage = url.searchParams.get("stage");
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 20);

    let candidates = await db.candidates.toArray();
    if (search) {
      candidates = candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (stage) candidates = candidates.filter((c) => c.stage === stage);

    const start = (page - 1) * pageSize;
    const paginated = candidates.slice(start, start + pageSize);

    return HttpResponse.json({ data: paginated, total: candidates.length });
  }),

  // POST /candidates
  http.post("/candidates", async ({ request }) => {
    const error = await simulateNetwork(true);
    if (error) return error;

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return HttpResponse.json({ error: "Invalid candidate data" }, { status: 400 });
    }
    await db.candidates.add(body as Candidate);
    return HttpResponse.json(body, { status: 201 });
  }),

  // PATCH /candidates/:id (stage transitions)
  http.patch("/candidates/:id", async ({ params, request }) => {
    const error = await simulateNetwork(true);
    if (error) return error;

    const { id } = params;
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return HttpResponse.json({ error: "Invalid candidate update data" }, { status: 400 });
    }
    await db.candidates.update(id as string, body as Partial<Candidate>);
    return HttpResponse.json({ id, ...(body as object) });
  }),

  // GET /candidates/:id/timeline
  http.get("/candidates/:id/timeline", async ({ params }) => {
    await simulateNetwork();
    // For demo: return a fake timeline
    return HttpResponse.json({
      candidateId: params.id,
      timeline: [
        { stage: "applied", date: "2023-01-01" },
        { stage: "screen", date: "2023-01-05" },
      ],
    });
  }),

  // ---------------------- ASSESSMENTS ----------------------

  // GET /assessments/:jobId
  http.get("/assessments/:jobId", async ({ params }) => {
    await simulateNetwork();
    const { jobId } = params;
    const assessment = await db.assessments.get(jobId as string);
    return HttpResponse.json(assessment || {});
  }),

  // PUT /assessments/:jobId
  http.put("/assessments/:jobId", async ({ params, request }) => {
    const error = await simulateNetwork(true);
    if (error) return error;

    const { jobId } = params;
    const body = await request.json();
    if (!body || typeof body !== "object" || !Array.isArray(body.sections)) {
      return HttpResponse.json({ error: "Invalid assessment data" }, { status: 400 });
    }
    const assessment = { jobId: jobId as string, sections: body.sections };
    await db.assessments.put(assessment);
    return HttpResponse.json(assessment);
  }),

  // POST /assessments/:jobId/submit
  http.post("/assessments/:jobId/submit", async ({ params, request }) => {
    const error = await simulateNetwork(true);
    if (error) return error;

    const { jobId } = params;
    const body = await request.json();
    // For simplicity: store response in localStorage
    const key = `assessment-${jobId}-responses`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(body);
    localStorage.setItem(key, JSON.stringify(existing));

    return HttpResponse.json({ success: true });
  }),
];
