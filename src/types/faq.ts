export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "services" | "account" | "location" | "academy";
}
