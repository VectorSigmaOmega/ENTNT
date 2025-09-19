import Dexie from "dexie";
import type { Table } from "dexie";

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: "active" | "archived";
  tags: string[];
  order: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected";
  jobId: string;
}

export interface Assessment {
  jobId: string;
  sections: {
    title: string;
    questions: {
      type: string;
      question: string;
      options?: string[];
    }[];
  }[];
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  assessments!: Table<Assessment, string>;

  constructor() {
    super("TalentFlowDB");
    this.version(1).stores({
      jobs: "id, title, slug, status, order",
      candidates: "id, name, email, stage, jobId",
      assessments: "jobId",
    });
  }
}

export const db = new TalentFlowDB();
