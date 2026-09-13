export type ServiceStatus = "available" | "request_only" | "coming_soon";

export type OnlineAvailability =
  | "Physical Walk-in & Online"
  | "Online Request"
  | "Physical Walk-in Only"
  | "Coming Soon";

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  status: ServiceStatus;
  onlineAvailability: OnlineAvailability;
  features: string[];
  deliverables: string[];
  requirements: string[];
  targetAudience: string;
  estimatedProcessingTime: string;
  startingPrice?: string;
  ctaText: string;
  ctaLink: string;
  featured: boolean;
}
