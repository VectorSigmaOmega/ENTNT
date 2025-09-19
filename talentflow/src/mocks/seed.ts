// src/mocks/seed.ts
import { faker } from "@faker-js/faker";
import { db } from "./db";
import type { Job, Candidate, Assessment } from "./db";

const JOBS_COUNT = 25;
const CANDIDATES_COUNT = 1000;
const ASSESSMENTS_COUNT = 3;

export async function seedDatabase() {
  const jobsCount = await db.jobs.count();
  if (jobsCount > 0) {
    return; // Already seeded
  }

  console.log("🌱 Seeding database...");

  const jobs: Job[] = Array.from({ length: JOBS_COUNT }).map((_, i) => ({
    id: faker.string.uuid(),
    title: faker.person.jobTitle(),
    slug: faker.helpers.slugify(faker.person.jobTitle()).toLowerCase(),
    status: faker.helpers.arrayElement(["active", "archived"]),
    tags: faker.helpers.arrayElements(
      ["frontend", "backend", "fullstack", "design", "devops"],
      { min: 1, max: 3 }
    ),
    order: i + 1,
  }));

  await db.jobs.bulkAdd(jobs);

  const candidateStages = [
    "applied",
    "screen",
    "tech",
    "offer",
    "hired",
    "rejected",
  ];

  const candidates: Candidate[] = Array.from({ length: CANDIDATES_COUNT }).map(
    () => {
      const stage = faker.helpers.arrayElement(candidateStages) as Candidate["stage"];
      return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        stage,
        jobId: faker.helpers.arrayElement(jobs).id,
      };
    }
  );

  await db.candidates.bulkAdd(candidates);

  const assessments: Assessment[] = Array.from({
    length: ASSESSMENTS_COUNT,
  }).map(() => ({
    jobId: faker.helpers.arrayElement(jobs).id,
    sections: [
      {
        title: faker.lorem.words(3),
        questions: Array.from({ length: 10 }).map(() => ({
          type: faker.helpers.arrayElement([
            "single-choice",
            "multi-choice",
            "short-text",
            "long-text",
          ]),
          question: faker.lorem.sentence(),
          options: ["Option A", "Option B", "Option C"],
        })),
      },
    ],
  }));

  await db.assessments.bulkAdd(assessments);

  // Add initial timeline entries for all candidates
const timelineEvents = candidates.map((c) => ({
  id: faker.string.uuid(),
  candidateId: c.id,
  stage: c.stage,
  date: new Date().toISOString(),
}));

await db.timelines.bulkAdd(timelineEvents);

// Seed notes for first 5 candidates
const notes = candidates.slice(0, 5).map((c) => ({
  id: faker.string.uuid(),
  candidateId: c.id,
  content: `Initial note for @${faker.person.firstName()}`,
  timestamp: new Date().toISOString(),
}));

await db.notes.bulkAdd(notes);



  console.log("✅ Database seeded successfully!");
}
