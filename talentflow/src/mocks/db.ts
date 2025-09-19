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

export interface TimelineEvent {
  id: string;             // unique event id
  candidateId: string;
  stage: string;
  date: string;           // ISO timestamp
}

export interface Note {
  id: string;
  candidateId: string;
  content: string;   // may contain @mentions
  timestamp: string;
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  assessments!: Table<Assessment, string>;
  timelines!: Table<TimelineEvent, string>;
  notes!: Table<Note, string>;

  constructor() {
    super("TalentFlowDB");
    this.version(3).stores({
      jobs: "id, title, slug, status, order",
      candidates: "id, name, email, stage, jobId",
      assessments: "jobId",
      timelines: "id, candidateId",
      notes: "id, candidateId",   // NEW
    });
  }
}

export const db = new TalentFlowDB();
