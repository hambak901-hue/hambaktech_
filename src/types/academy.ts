export interface AcademyCourse {
  id: string;
  title: string;
  slug: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  mode: "In-Person (Ibeju-Lekki)" | "Hybrid" | "Self-Paced Online (Coming Soon)";
  description: string;
  modules: string[];
  prerequisites: string;
  targetAudience: string;
  status: "open" | "coming_soon";
  certification: string;
}
