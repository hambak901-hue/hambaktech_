/**
 * Authoritative Company Configuration & Contact Information
 * 
 * Single source of truth across all public pages, headers, footers, FAQs, and contact forms.
 * Architected to mirror the `CompanySetting` table schema in `prisma/schema.prisma`
 * so it can easily hydrate dynamically from database settings in future milestones.
 */

export interface CompanyConfig {
  legalName: string;
  brandName: string;
  slogan: string;
  domain: string;
  email: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsapp: string;
  address: string;
  lga: string;
  state: string;
  country: string;
  operatingHours: string;
  operatingHoursShort: string;
  sundayStatus: string;
  establishedYear: number;
}

export const companyConfig: CompanyConfig = {
  legalName: "Hambaktech & Services",
  brandName: "HambakTech",
  slogan: "Where Technology Meet Service",
  domain: "hambaktech.com.ng",
  email: "info@hambaktech.com.ng",
  phonePrimary: "08147837664",
  phoneSecondary: "09019120241",
  whatsapp: "09155104724",
  address: "Origanrigan cele Area, Ibeju-Lekki, Lagos State, Nigeria",
  lga: "Ibeju-Lekki",
  state: "Lagos State",
  country: "Nigeria",
  operatingHours: "Monday – Saturday: 8:00 AM – 6:00 PM",
  operatingHoursShort: "Mon – Sat: 8:00 AM – 6:00 PM",
  sundayStatus: "Sunday: Closed",
  establishedYear: 2020,
};

export default companyConfig;
