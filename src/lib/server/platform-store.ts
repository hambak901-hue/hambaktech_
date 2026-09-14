import {
  User,
  RoleSlug,
  Wallet,
  WalletLedgerEntry,
  Transaction,
  Order,
  OrderStatus,
  NINRequest,
  CACRequest,
  AcademyEnrollment,
  InstructorRecord,
  LessonRecord,
  CourseModuleRecord,
  CourseAssignmentRecord,
  AssignmentSubmissionRecord,
  CourseRecord,
  CertificateRecord,
  StudentIdCardRecord,
  CertificateVerificationResult,
  ProductCategoryRecord,
  ProductRecord,
  ProductInventoryLogRecord,
  DeliveryZoneRecord,
  SupportTicket,
  PriceRule,
  SystemProvider,
  CMSAnnouncement,
  AuditLogEntry,
  NotificationItem,
  BlogPost,
  CMSPage,
  ServiceCategoryRecord,
  CustomerTierSlug,
} from "@/types/platform";
import { ServiceCategory } from "@/types/service";
import { servicesData } from "@/data/servicesData";
import { companyConfig } from "@/data/companyConfig";
import { isDatabaseReachable, getPrisma } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/crypto";
import { sanitizeSensitiveRecord } from "@/lib/privacy";

// ============================================================================
// SERVER-SIDE IN-MEMORY REPOSITORY (Singleton across Next.js server invocations)
// ============================================================================

interface PlatformStoreState {
  users: User[];
  wallets: Record<string, Wallet>;
  ledgerEntries: WalletLedgerEntry[];
  transactions: Transaction[];
  orders: Order[];
  pricingRules: PriceRule[];
  systemProviders: SystemProvider[];
  announcements: CMSAnnouncement[];
  auditLogs: AuditLogEntry[];
  notifications: NotificationItem[];
  ninRequests: NINRequest[];
  cacRequests: CACRequest[];
  supportTickets: SupportTicket[];
  serviceCategories: ServiceCategoryRecord[];
  services: ServiceCategory[];
  // Academy
  instructors: InstructorRecord[];
  courses: CourseRecord[];
  enrollments: AcademyEnrollment[];
  assignments: CourseAssignmentRecord[];
  submissions: AssignmentSubmissionRecord[];
  certificates: CertificateRecord[];
  idCards: StudentIdCardRecord[];
  // Shop
  productCategories: ProductCategoryRecord[];
  products: ProductRecord[];
  inventoryLogs: ProductInventoryLogRecord[];
  deliveryZones: DeliveryZoneRecord[];
  // Settings
  systemSettings: {
    siteName: string;
    supportEmail: string;
    supportPhone: string;
    officeAddress: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    platformFeeRate: number;
    defaultCurrency: string;
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __hambakPlatformStore: PlatformStoreState | undefined;
}

function initializeDefaultStore(): PlatformStoreState {
  const defaultInstructors: InstructorRecord[] = [
    {
      id: "inst-1",
      name: "Engr. Hammed Bakare",
      title: "Lead Systems Architect & IT Director",
      bio: "10+ years engineering enterprise web portals, database architectures, and IT infrastructure. Certified instructor at HambakTech.",
      avatarUrl: "/images/blog/author-01.png",
      email: "director@hambaktech.com.ng",
      phone: "+234 810 000 0001",
      specialization: "Software Engineering & Computer Architecture",
      rating: 5.0,
      isActive: true,
    },
    {
      id: "inst-2",
      name: "Maryam Adekunle",
      title: "Lead Creative Designer & Brand Strategist",
      bio: "Expert in CorelDraw, Adobe Creative Cloud, and brand communication. Trained over 200 creative designers across Lagos.",
      avatarUrl: "/images/blog/author-02.png",
      email: "maryam@hambaktech.com.ng",
      phone: "+234 810 000 0002",
      specialization: "Graphics, UI/UX & Brand Identity",
      rating: 4.9,
      isActive: true,
    },
    {
      id: "inst-3",
      name: "Taiwo Babalola",
      title: "Senior Data Analyst & Business Intelligence Specialist",
      bio: "Specializes in Microsoft Excel modeling, Power Query automation, and financial record keeping for commercial enterprises.",
      avatarUrl: "/images/blog/author-03.png",
      email: "taiwo@hambaktech.com.ng",
      phone: "+234 810 000 0003",
      specialization: "Advanced Excel, Analytics & Reporting",
      rating: 4.9,
      isActive: true,
    },
    {
      id: "inst-4",
      name: "David Okoro",
      title: "Fullstack Web Developer & Dev Instructor",
      bio: "Front-end and full-stack web developer passionate about teaching JavaScript, Next.js, and modern CSS to young Africans.",
      avatarUrl: "/images/blog/author-01.png",
      email: "david@hambaktech.com.ng",
      phone: "+234 810 000 0004",
      specialization: "Web Technologies, HTML5, CSS3, JavaScript",
      rating: 4.8,
      isActive: true,
    },
  ];

  const defaultCourses: CourseRecord[] = [
    {
      id: "comp-literacy",
      categoryId: "cat-acad",
      categoryName: "Computer Training Academy",
      instructorId: "inst-1",
      instructorName: "Engr. Hammed Bakare",
      instructorTitle: "Lead Systems Architect & IT Director",
      code: "HT-CRS-LIT",
      title: "Executive Computer Literacy & Office Productivity",
      slug: "computer-literacy",
      shortDescription: "Practical foundational course on Windows OS, touch-typing, and Microsoft Office Suite (Word, Excel, PowerPoint).",
      fullDescription: "A comprehensive foundational course designed to give beginners and working professionals practical mastery of operating systems, touch-typing, internet research, and the complete Microsoft Office suite.",
      level: "BEGINNER",
      durationWeeks: 6,
      tuitionFee: 35000,
      isCertificateIncluded: true,
      isActive: true,
      modulesCount: 6,
      lessonsCount: 18,
      enrolledStudentsCount: 24,
      modules: [
        {
          id: "mod-lit-1",
          courseId: "comp-literacy",
          moduleOrder: 1,
          title: "Module 1: Computer Fundamentals, Windows OS & File Management",
          durationHours: 6,
          lessons: [
            { id: "les-lit-101", moduleId: "mod-lit-1", title: "Introduction to Hardware & Peripherals", slug: "hardware-peripherals", durationMinutes: 45, lessonOrder: 1, isFreePreview: true },
            { id: "les-lit-102", moduleId: "mod-lit-1", title: "Windows Navigation, Folders & File Systems", slug: "windows-navigation", durationMinutes: 50, lessonOrder: 2, isFreePreview: false },
            { id: "les-lit-103", moduleId: "mod-lit-1", title: "Keyboard Shortcuts & System Settings", slug: "shortcuts-settings", durationMinutes: 45, lessonOrder: 3, isFreePreview: false },
          ],
        },
        {
          id: "mod-lit-2",
          courseId: "comp-literacy",
          moduleOrder: 2,
          title: "Module 2: Keyboarding Skills & Typing Speed Development",
          durationHours: 6,
          lessons: [
            { id: "les-lit-201", moduleId: "mod-lit-2", title: "Touch-Typing Home Row Mastery", slug: "touch-typing-home-row", durationMinutes: 40, lessonOrder: 1, isFreePreview: false },
            { id: "les-lit-202", moduleId: "mod-lit-2", title: "Speed Drills & Accuracy Building", slug: "speed-drills", durationMinutes: 45, lessonOrder: 2, isFreePreview: false },
            { id: "les-lit-203", moduleId: "mod-lit-2", title: "Typing Test & Speed Benchmark", slug: "typing-benchmark", durationMinutes: 35, lessonOrder: 3, isFreePreview: false },
          ],
        },
        {
          id: "mod-lit-3",
          courseId: "comp-literacy",
          moduleOrder: 3,
          title: "Module 3: Microsoft Word Business Documents & Formatting",
          durationHours: 8,
          lessons: [
            { id: "les-lit-301", moduleId: "mod-lit-3", title: "Document Layout, Margins & Typography", slug: "document-layout", durationMinutes: 50, lessonOrder: 1, isFreePreview: false },
            { id: "les-lit-302", moduleId: "mod-lit-3", title: "Tables, Headers, Footers & Page Numbering", slug: "tables-headers", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
            { id: "les-lit-303", moduleId: "mod-lit-3", title: "Mail Merge & Official Letterhead Creation", slug: "mail-merge", durationMinutes: 60, lessonOrder: 3, isFreePreview: false },
          ],
        },
        {
          id: "mod-lit-4",
          courseId: "comp-literacy",
          moduleOrder: 4,
          title: "Module 4: Microsoft Excel Data Entry & Basic Formulas",
          durationHours: 8,
          lessons: [
            { id: "les-lit-401", moduleId: "mod-lit-4", title: "Workbook Structure, Cells & Ranges", slug: "workbook-cells", durationMinutes: 50, lessonOrder: 1, isFreePreview: false },
            { id: "les-lit-402", moduleId: "mod-lit-4", title: "Essential Formulas: SUM, AVERAGE, COUNT, IF", slug: "essential-formulas", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
            { id: "les-lit-403", moduleId: "mod-lit-4", title: "Data Formatting, Borders & Basic Charts", slug: "formatting-charts", durationMinutes: 55, lessonOrder: 3, isFreePreview: false },
          ],
        },
        {
          id: "mod-lit-5",
          courseId: "comp-literacy",
          moduleOrder: 5,
          title: "Module 5: Microsoft PowerPoint & Pitch Decks",
          durationHours: 6,
          lessons: [
            { id: "les-lit-501", moduleId: "mod-lit-5", title: "Slide Layouts, Themes & Design Rules", slug: "slide-layouts", durationMinutes: 45, lessonOrder: 1, isFreePreview: false },
            { id: "les-lit-502", moduleId: "mod-lit-5", title: "Animations, Transitions & Visual Assets", slug: "animations-transitions", durationMinutes: 50, lessonOrder: 2, isFreePreview: false },
            { id: "les-lit-503", moduleId: "mod-lit-5", title: "Delivering Confident Presentations", slug: "presentation-delivery", durationMinutes: 45, lessonOrder: 3, isFreePreview: false },
          ],
        },
        {
          id: "mod-lit-6",
          courseId: "comp-literacy",
          moduleOrder: 6,
          title: "Module 6: Cloud Storage, Email & Cyber Hygiene",
          durationHours: 6,
          lessons: [
            { id: "les-lit-601", moduleId: "mod-lit-6", title: "Google Drive, OneDrive & Cloud Sync", slug: "cloud-sync", durationMinutes: 45, lessonOrder: 1, isFreePreview: false },
            { id: "les-lit-602", moduleId: "mod-lit-6", title: "Professional Email Etiquette & Attachments", slug: "email-etiquette", durationMinutes: 40, lessonOrder: 2, isFreePreview: false },
            { id: "les-lit-603", moduleId: "mod-lit-6", title: "Capstone Assessment & Final Submission", slug: "capstone-assessment", durationMinutes: 60, lessonOrder: 3, isFreePreview: false },
          ],
        },
      ],
      assignments: [
        {
          id: "asg-lit-1",
          courseId: "comp-literacy",
          title: "Official Corporate Letter & Table Formatting",
          description: "Draft an official 2-page business proposal using Microsoft Word featuring custom letterhead, styled typography, tab stops, and a bordered quotation table.",
          maxScore: 100,
          dueDate: "2026-10-15T23:59:59Z",
          isActive: true,
        },
        {
          id: "asg-lit-2",
          courseId: "comp-literacy",
          title: "Automated Monthly Sales Spreadsheet",
          description: "Build an Excel workbook with at least 20 sales rows calculating subtotal, 7.5% VAT, discounts using IF statements, and a monthly summary bar chart.",
          maxScore: 100,
          dueDate: "2026-10-30T23:59:59Z",
          isActive: true,
        },
      ],
    },
    {
      id: "graphic-design",
      categoryId: "cat-acad",
      categoryName: "Computer Training Academy",
      instructorId: "inst-2",
      instructorName: "Maryam Adekunle",
      instructorTitle: "Lead Creative Designer & Brand Strategist",
      code: "HT-CRS-GRD",
      title: "Graphic Design & Visual Brand Communication",
      slug: "graphic-design",
      shortDescription: "Visual design principles, CorelDraw vector mastery, and Adobe Photoshop commercial editing.",
      fullDescription: "Learn the core principles of visual design, color theory, and typography. Gain hands-on competency in Adobe Photoshop, CorelDraw, and Canva to design commercial logos, flyers, banners, and social media collaterals.",
      level: "INTERMEDIATE",
      durationWeeks: 8,
      tuitionFee: 45000,
      isCertificateIncluded: true,
      isActive: true,
      modulesCount: 6,
      lessonsCount: 20,
      enrolledStudentsCount: 18,
      modules: [
        {
          id: "mod-grd-1",
          courseId: "graphic-design",
          moduleOrder: 1,
          title: "Module 1: Design Theory, Visual Hierarchy & Color Wheels",
          durationHours: 6,
          lessons: [
            { id: "les-grd-101", moduleId: "mod-grd-1", title: "Principles of Graphic Design & Balance", slug: "principles-of-design", durationMinutes: 50, lessonOrder: 1, isFreePreview: true },
            { id: "les-grd-102", moduleId: "mod-grd-1", title: "Color Psychology & Contrast in Print vs Screen", slug: "color-psychology", durationMinutes: 50, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-grd-2",
          courseId: "graphic-design",
          moduleOrder: 2,
          title: "Module 2: CorelDraw Vector Mastery",
          durationHours: 10,
          lessons: [
            { id: "les-grd-201", moduleId: "mod-grd-2", title: "Pen Tool, Bezier Curves & Node Editing", slug: "coreldraw-pen-tool", durationMinutes: 60, lessonOrder: 1, isFreePreview: false },
            { id: "les-grd-202", moduleId: "mod-grd-2", title: "Vector Tracing & Silhouette Creation", slug: "vector-tracing", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
            { id: "les-grd-203", moduleId: "mod-grd-2", title: "Commercial Logo Design from Scratch", slug: "logo-design", durationMinutes: 70, lessonOrder: 3, isFreePreview: false },
          ],
        },
        {
          id: "mod-grd-3",
          courseId: "graphic-design",
          moduleOrder: 3,
          title: "Module 3: Adobe Photoshop Image Retouching & Masking",
          durationHours: 10,
          lessons: [
            { id: "les-grd-301", moduleId: "mod-grd-3", title: "Selection Tools, Layer Masks & Clipping", slug: "photoshop-layers-masks", durationMinutes: 60, lessonOrder: 1, isFreePreview: false },
            { id: "les-grd-302", moduleId: "mod-grd-3", title: "Portrait Retouching & Frequency Separation", slug: "portrait-retouching", durationMinutes: 65, lessonOrder: 2, isFreePreview: false },
            { id: "les-grd-303", moduleId: "mod-grd-3", title: "Color Grading & Photo Manipulation", slug: "photo-manipulation", durationMinutes: 60, lessonOrder: 3, isFreePreview: false },
          ],
        },
        {
          id: "mod-grd-4",
          courseId: "graphic-design",
          moduleOrder: 4,
          title: "Module 4: Marketing Collaterals & Flyer Design",
          durationHours: 8,
          lessons: [
            { id: "les-grd-401", moduleId: "mod-grd-4", title: "Event Flyer Layout & Composition", slug: "flyer-composition", durationMinutes: 60, lessonOrder: 1, isFreePreview: false },
            { id: "les-grd-402", moduleId: "mod-grd-4", title: "Social Media Carousel Packs", slug: "social-media-carousels", durationMinutes: 50, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-grd-5",
          courseId: "graphic-design",
          moduleOrder: 5,
          title: "Module 5: Print Production, Bleed, CMYK & Plates",
          durationHours: 6,
          lessons: [
            { id: "les-grd-501", moduleId: "mod-grd-5", title: "CMYK vs RGB & Resolution Standards (300 DPI)", slug: "cmyk-resolution", durationMinutes: 45, lessonOrder: 1, isFreePreview: false },
            { id: "les-grd-502", moduleId: "mod-grd-5", title: "Preparing Files for Digital Press & Large Format", slug: "print-preparation", durationMinutes: 55, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-grd-6",
          courseId: "graphic-design",
          moduleOrder: 6,
          title: "Module 6: Capstone Brand Identity Portfolio",
          durationHours: 8,
          lessons: [
            { id: "les-grd-601", moduleId: "mod-grd-6", title: "Creating a Brand Style Guide Document", slug: "brand-style-guide", durationMinutes: 60, lessonOrder: 1, isFreePreview: false },
            { id: "les-grd-602", moduleId: "mod-grd-6", title: "Portfolio Presentation & Client Pitch", slug: "portfolio-pitch", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
          ],
        },
      ],
      assignments: [
        {
          id: "asg-grd-1",
          courseId: "graphic-design",
          title: "Full Corporate Identity System",
          description: "Design a complete brand identity for a local Nigerian startup, including primary vector logo, secondary mark, color palette, business card, and official letterhead.",
          maxScore: 100,
          dueDate: "2026-10-20T23:59:59Z",
          isActive: true,
        },
      ],
    },
    {
      id: "web-development",
      categoryId: "cat-acad",
      categoryName: "Computer Training Academy",
      instructorId: "inst-4",
      instructorName: "David Okoro",
      instructorTitle: "Fullstack Web Developer & Dev Instructor",
      code: "HT-CRS-DEV",
      title: "Web Development Foundations (Frontend & Design)",
      slug: "web-development",
      shortDescription: "Modern web foundations: Semantic HTML5, responsive CSS/Tailwind, JavaScript fundamentals, and Git.",
      fullDescription: "An immersive introduction to modern web technologies. Build responsive, mobile-first websites using semantic HTML5, modern CSS3/Tailwind, JavaScript fundamentals, and contemporary deployment workflows.",
      level: "INTERMEDIATE",
      durationWeeks: 10,
      tuitionFee: 60000,
      isCertificateIncluded: true,
      isActive: true,
      modulesCount: 7,
      lessonsCount: 24,
      enrolledStudentsCount: 32,
      modules: [
        {
          id: "mod-dev-1",
          courseId: "web-development",
          moduleOrder: 1,
          title: "Module 1: Web Architecture & Developer Tooling",
          durationHours: 6,
          lessons: [
            { id: "les-dev-101", moduleId: "mod-dev-1", title: "How the Internet Works: HTTP, DNS, Servers", slug: "how-internet-works", durationMinutes: 45, lessonOrder: 1, isFreePreview: true },
            { id: "les-dev-102", moduleId: "mod-dev-1", title: "VS Code Setup, Extensions & Terminal Basics", slug: "vscode-terminal", durationMinutes: 45, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-dev-2",
          courseId: "web-development",
          moduleOrder: 2,
          title: "Module 2: Semantic HTML5 & Modern Structure",
          durationHours: 8,
          lessons: [
            { id: "les-dev-201", moduleId: "mod-dev-2", title: "Tags, Semantic Elements & Document Structure", slug: "semantic-elements", durationMinutes: 50, lessonOrder: 1, isFreePreview: false },
            { id: "les-dev-202", moduleId: "mod-dev-2", title: "Accessible Forms, Validations & Inputs", slug: "html-forms", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-dev-3",
          courseId: "web-development",
          moduleOrder: 3,
          title: "Module 3: CSS3, Flexbox & CSS Grid Mastery",
          durationHours: 10,
          lessons: [
            { id: "les-dev-301", moduleId: "mod-dev-3", title: "The Box Model, Spacing & Specificity", slug: "box-model", durationMinutes: 50, lessonOrder: 1, isFreePreview: false },
            { id: "les-dev-302", moduleId: "mod-dev-3", title: "Flexbox: Alignments, Directions & Dynamic Rows", slug: "flexbox-mastery", durationMinutes: 65, lessonOrder: 2, isFreePreview: false },
            { id: "les-dev-303", moduleId: "mod-dev-3", title: "CSS Grid: Bento Grids & Multi-Column Layouts", slug: "css-grid", durationMinutes: 60, lessonOrder: 3, isFreePreview: false },
          ],
        },
        {
          id: "mod-dev-4",
          courseId: "web-development",
          moduleOrder: 4,
          title: "Module 4: Responsive Design with Tailwind CSS",
          durationHours: 8,
          lessons: [
            { id: "les-dev-401", moduleId: "mod-dev-4", title: "Tailwind Utility Classes & Configuration", slug: "tailwind-utilities", durationMinutes: 55, lessonOrder: 1, isFreePreview: false },
            { id: "les-dev-402", moduleId: "mod-dev-4", title: "Mobile-First Breakpoints & Dark Mode", slug: "responsive-dark-mode", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-dev-5",
          courseId: "web-development",
          moduleOrder: 5,
          title: "Module 5: JavaScript Fundamentals & DOM Manipulation",
          durationHours: 12,
          lessons: [
            { id: "les-dev-501", moduleId: "mod-dev-5", title: "Variables, Data Types, Arrays & Objects", slug: "js-data-types", durationMinutes: 60, lessonOrder: 1, isFreePreview: false },
            { id: "les-dev-502", moduleId: "mod-dev-5", title: "Functions, Arrow Syntax & Scope", slug: "js-functions", durationMinutes: 55, lessonOrder: 2, isFreePreview: false },
            { id: "les-dev-503", moduleId: "mod-dev-5", title: "DOM Selectors, Event Listeners & Dynamic UI", slug: "dom-events", durationMinutes: 70, lessonOrder: 3, isFreePreview: false },
          ],
        },
        {
          id: "mod-dev-6",
          courseId: "web-development",
          moduleOrder: 6,
          title: "Module 6: Git, GitHub & Collaborative Workflow",
          durationHours: 6,
          lessons: [
            { id: "les-dev-601", moduleId: "mod-dev-6", title: "Git Init, Commits, Branches & Merges", slug: "git-basics", durationMinutes: 50, lessonOrder: 1, isFreePreview: false },
            { id: "les-dev-602", moduleId: "mod-dev-6", title: "Pushing to GitHub & Netlify/Vercel Deployment", slug: "github-deployment", durationMinutes: 55, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-dev-7",
          courseId: "web-development",
          moduleOrder: 7,
          title: "Module 7: Capstone Project Deployment",
          durationHours: 8,
          lessons: [
            { id: "les-dev-701", moduleId: "mod-dev-7", title: "Planning & Scaffolding the Capstone Website", slug: "capstone-planning", durationMinutes: 60, lessonOrder: 1, isFreePreview: false },
            { id: "les-dev-702", moduleId: "mod-dev-7", title: "Code Review, Lighthouse Optimization & Launch", slug: "capstone-launch", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
          ],
        },
      ],
      assignments: [
        {
          id: "asg-dev-1",
          courseId: "web-development",
          title: "Responsive Multi-Page Commercial Website",
          description: "Build and deploy a responsive 3-page website (Home, About, Contact) using HTML5, modern Tailwind CSS, an interactive mobile navigation drawer, and an active contact form.",
          maxScore: 100,
          dueDate: "2026-11-05T23:59:59Z",
          isActive: true,
        },
      ],
    },
    {
      id: "data-analysis",
      categoryId: "cat-acad",
      categoryName: "Computer Training Academy",
      instructorId: "inst-3",
      instructorName: "Taiwo Babalola",
      instructorTitle: "Senior Data Analyst & Business Intelligence Specialist",
      code: "HT-CRS-DAT",
      title: "Data Analysis with Advanced Microsoft Excel",
      slug: "data-analysis",
      shortDescription: "Transform raw data into business intelligence: XLOOKUP, Pivot Tables, interactive dashboards, and Power Query.",
      fullDescription: "Transform raw operational data into actionable business insights. Master advanced Excel formulas (XLOOKUP, INDEX/MATCH), Pivot Tables, interactive dashboards, data cleaning, and automated reporting.",
      level: "INTERMEDIATE",
      durationWeeks: 6,
      tuitionFee: 50000,
      isCertificateIncluded: true,
      isActive: true,
      modulesCount: 6,
      lessonsCount: 18,
      enrolledStudentsCount: 16,
      modules: [
        {
          id: "mod-dat-1",
          courseId: "data-analysis",
          moduleOrder: 1,
          title: "Module 1: Advanced Formula Logic & Lookup Functions",
          durationHours: 6,
          lessons: [
            { id: "les-dat-101", moduleId: "mod-dat-1", title: "XLOOKUP vs VLOOKUP & Dynamic Arrays", slug: "xlookup-dynamic-arrays", durationMinutes: 55, lessonOrder: 1, isFreePreview: true },
            { id: "les-dat-102", moduleId: "mod-dat-1", title: "INDEX/MATCH & Multi-Criteria Lookups", slug: "index-match", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-dat-2",
          courseId: "data-analysis",
          moduleOrder: 2,
          title: "Module 2: Data Cleaning & Text Manipulation",
          durationHours: 6,
          lessons: [
            { id: "les-dat-201", moduleId: "mod-dat-2", title: "Text Functions: TRIM, CLEAN, TEXTSPLIT, CONCAT", slug: "text-cleaning", durationMinutes: 50, lessonOrder: 1, isFreePreview: false },
            { id: "les-dat-202", moduleId: "mod-dat-2", title: "Flash Fill, Duplicate Removal & Data Validation", slug: "data-validation", durationMinutes: 50, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-dat-3",
          courseId: "data-analysis",
          moduleOrder: 3,
          title: "Module 3: Pivot Tables & Multi-Dimensional Slicers",
          durationHours: 8,
          lessons: [
            { id: "les-dat-301", moduleId: "mod-dat-3", title: "Creating Pivot Tables & Summarizing Metrics", slug: "pivot-tables-intro", durationMinutes: 55, lessonOrder: 1, isFreePreview: false },
            { id: "les-dat-302", moduleId: "mod-dat-3", title: "Calculated Fields, Slicers & Timeline Filtering", slug: "calculated-fields-slicers", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-dat-4",
          courseId: "data-analysis",
          moduleOrder: 4,
          title: "Module 4: Dynamic Interactive Dashboards",
          durationHours: 8,
          lessons: [
            { id: "les-dat-401", moduleId: "mod-dat-4", title: "Designing Professional Executive KPI Cards", slug: "kpi-cards", durationMinutes: 50, lessonOrder: 1, isFreePreview: false },
            { id: "les-dat-402", moduleId: "mod-dat-4", title: "Connecting Dynamic Charts & Slicers", slug: "dynamic-charts", durationMinutes: 65, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-dat-5",
          courseId: "data-analysis",
          moduleOrder: 5,
          title: "Module 5: Introduction to Power Query ETL",
          durationHours: 6,
          lessons: [
            { id: "les-dat-501", moduleId: "mod-dat-5", title: "Connecting CSV, Excel & Web Sources in Power Query", slug: "power-query-connect", durationMinutes: 55, lessonOrder: 1, isFreePreview: false },
            { id: "les-dat-502", moduleId: "mod-dat-5", title: "Transforming, Merging & Appending Tables", slug: "transform-merge", durationMinutes: 60, lessonOrder: 2, isFreePreview: false },
          ],
        },
        {
          id: "mod-dat-6",
          courseId: "data-analysis",
          moduleOrder: 6,
          title: "Module 6: Capstone Business Analysis Report",
          durationHours: 6,
          lessons: [
            { id: "les-dat-601", moduleId: "mod-dat-6", title: "Real-World Nigerian Retail Case Study", slug: "retail-case-study", durationMinutes: 60, lessonOrder: 1, isFreePreview: false },
            { id: "les-dat-602", moduleId: "mod-dat-6", title: "Final Project Presentation & Review", slug: "final-presentation", durationMinutes: 50, lessonOrder: 2, isFreePreview: false },
          ],
        },
      ],
      assignments: [
        {
          id: "asg-dat-1",
          courseId: "data-analysis",
          title: "Commercial Retail Store Sales & Inventory Dashboard",
          description: "Analyze a raw dataset of 2,500 sales transactions. Cleanse dirty customer entries, build dynamic Pivot tables, and assemble a 1-page executive dashboard with interactive slicers.",
          maxScore: 100,
          dueDate: "2026-10-25T23:59:59Z",
          isActive: true,
        },
      ],
    },
  ];

  const defaultEnrollments: AcademyEnrollment[] = [
    {
      id: "enr-001",
      enrollmentNumber: "HT-STU-2026-0001",
      userId: "usr-student-1",
      courseId: "web-development",
      courseTitle: "Web Development Foundations (Frontend & Design)",
      courseCode: "HT-CRS-DEV",
      studentName: "Oluwaseun Adeyemi",
      studentEmail: "customer@hambaktech.com.ng",
      studentPhone: "+234 812 345 6789",
      cohort: "Batch Q3 2026",
      progressPercent: 70,
      status: "IN_PROGRESS",
      completedModules: [1, 2, 3, 4],
      completedLessons: ["les-dev-101", "les-dev-102", "les-dev-201", "les-dev-202", "les-dev-301", "les-dev-302", "les-dev-303", "les-dev-401", "les-dev-402"],
      certificateIssued: false,
      hasIdCard: true,
      idCardNumber: "HT-ID-2026-0001",
      enrolledAt: "2026-08-01T10:00:00Z",
    },
    {
      id: "enr-002",
      enrollmentNumber: "HT-STU-2026-0002",
      userId: "usr-student-2",
      courseId: "comp-literacy",
      courseTitle: "Executive Computer Literacy & Office Productivity",
      courseCode: "HT-CRS-LIT",
      studentName: "Blessing Eze",
      studentEmail: "blessing.eze@example.com",
      studentPhone: "+234 803 111 2233",
      cohort: "Batch Q2 2026",
      progressPercent: 100,
      status: "COMPLETED",
      completedModules: [1, 2, 3, 4, 5, 6],
      completedLessons: ["les-lit-101", "les-lit-102", "les-lit-103", "les-lit-201", "les-lit-202", "les-lit-203", "les-lit-301", "les-lit-302", "les-lit-303", "les-lit-401", "les-lit-402", "les-lit-403", "les-lit-501", "les-lit-502", "les-lit-503", "les-lit-601", "les-lit-602", "les-lit-603"],
      certificateIssued: true,
      certificateNumber: "HT-CERT-2026-0001",
      certificateHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      certificateDate: "2026-07-20T14:30:00Z",
      hasIdCard: true,
      idCardNumber: "HT-ID-2026-0002",
      enrolledAt: "2026-06-01T09:00:00Z",
      completedAt: "2026-07-20T14:30:00Z",
    },
  ];

  const defaultSubmissions: AssignmentSubmissionRecord[] = [
    {
      id: "sub-001",
      assignmentId: "asg-dev-1",
      assignmentTitle: "Responsive Multi-Page Commercial Website",
      enrollmentId: "enr-001",
      studentId: "usr-student-1",
      studentName: "Oluwaseun Adeyemi",
      content: "Completed live deployment on Vercel: https://adeyemi-agro.vercel.app. GitHub repo: https://github.com/adeyemi/agro-portal. Features HTML5 semantic layout and mobile navigation.",
      fileUrl: "https://adeyemi-agro.vercel.app",
      score: 92,
      grade: "Distinction",
      feedback: "Excellent layout execution and clean semantic markup. The mobile navigation responsive transition works very smoothly.",
      status: "GRADED",
      submittedAt: "2026-09-08T15:20:00Z",
      gradedAt: "2026-09-09T10:00:00Z",
    },
  ];

  const defaultCertificates: CertificateRecord[] = [
    {
      id: "cert-001",
      certificateNumber: "HT-CERT-2026-0001",
      verificationHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      enrollmentId: "enr-002",
      studentName: "Blessing Eze",
      courseTitle: "Executive Computer Literacy & Office Productivity",
      courseCode: "HT-CRS-LIT",
      grade: "Distinction",
      issuedAt: "2026-07-20T14:30:00Z",
      issuedByName: "Engr. Hammed Bakare",
      isRevoked: false,
      verificationUrl: "https://hambaktech.com.ng/verify/certificate/HT-CERT-2026-0001",
    },
  ];

  const defaultIdCards: StudentIdCardRecord[] = [
    {
      id: "id-001",
      cardNumber: "HT-ID-2026-0001",
      enrollmentId: "enr-001",
      studentId: "usr-student-1",
      studentName: "Oluwaseun Adeyemi",
      studentEmail: "customer@hambaktech.com.ng",
      courseTitle: "Web Development Foundations (Frontend & Design)",
      courseCode: "HT-CRS-DEV",
      cohort: "Batch Q3 2026",
      issueDate: "2026-08-01T10:00:00Z",
      expiryDate: "2027-08-01T10:00:00Z",
      qrCodeData: "https://hambaktech.com.ng/verify/certificate/HT-CERT-2026-0001",
      status: "ACTIVE",
      bloodGroup: "O+",
      emergencyContact: "+234 812 345 6789",
    },
    {
      id: "id-002",
      cardNumber: "HT-ID-2026-0002",
      enrollmentId: "enr-002",
      studentId: "usr-student-2",
      studentName: "Blessing Eze",
      studentEmail: "blessing.eze@example.com",
      courseTitle: "Executive Computer Literacy & Office Productivity",
      courseCode: "HT-CRS-LIT",
      cohort: "Batch Q2 2026",
      issueDate: "2026-06-01T09:00:00Z",
      expiryDate: "2027-06-01T09:00:00Z",
      qrCodeData: "https://hambaktech.com.ng/verify/certificate/HT-CERT-2026-0001",
      status: "ACTIVE",
      bloodGroup: "A+",
      emergencyContact: "+234 803 111 2233",
    },
  ];

  // Default Shop Categories & Products
  const defaultProductCategories: ProductCategoryRecord[] = [
    {
      id: "cat-stationery",
      name: "Office Stationery & Paper",
      slug: "stationery-paper",
      code: "STAT_PAPER",
      description: "A4 bond papers, photo papers, thermal receipt rolls, and file folders.",
      icon: "Files",
      displayOrder: 1,
      isActive: true,
      productsCount: 4,
    },
    {
      id: "cat-pvc",
      name: "PVC Cards & Identification Supplies",
      slug: "pvc-cards-supplies",
      code: "PVC_SUPPLIES",
      description: "Blank CR80 PVC cards, card lanyards, clear card holders, and badge clips.",
      icon: "CreditCard",
      displayOrder: 2,
      isActive: true,
      productsCount: 3,
    },
    {
      id: "cat-binding",
      name: "Lamination & Binding Materials",
      slug: "lamination-binding",
      code: "BIND_LAMINATE",
      description: "Thermal laminating films, plastic comb spirals, wire-o rings, and report binding covers.",
      icon: "Layers",
      displayOrder: 3,
      isActive: true,
      productsCount: 3,
    },
    {
      id: "cat-accessories",
      name: "Computer & Office Accessories",
      slug: "computer-accessories",
      code: "COMP_ACCESSORIES",
      description: "Flash drives, USB cables, OTG adapters, laptop chargers, and wireless mouse units.",
      icon: "HardDrive",
      displayOrder: 4,
      isActive: true,
      productsCount: 4,
    },
  ];

  const defaultProducts: ProductRecord[] = [
    {
      id: "prod-paper-a4",
      categoryId: "cat-stationery",
      categoryName: "Office Stationery & Paper",
      name: "Double A Premium A4 Copy Paper (Ream - 500 Sheets, 80GSM)",
      slug: "double-a-paper-a4",
      sku: "HT-SKU-PPR-01",
      shortDescription: "Ultra-white, jam-free 80GSM copy paper suitable for high-speed laser and inkjet printing.",
      fullDescription: "Premium quality Double A A4 copy paper (80 GSM). Delivers razor-sharp text and vibrant colors with zero bleed-through. Ideal for official business letters, corporate proposals, and high-volume photocopying.",
      costPrice: 4200,
      sellingPrice: 5500,
      stockQuantity: 85,
      minStockThreshold: 15,
      isDigital: false,
      requiresDelivery: true,
      status: "ACTIVE",
      imageUrl: "/images/blog/blog-01.jpg",
      weightKg: 2.5,
    },
    {
      id: "prod-thermal-rolls",
      categoryId: "cat-stationery",
      categoryName: "Office Stationery & Paper",
      name: "POS & Receipt Thermal Paper Rolls (58mm x 40mm - Pack of 10)",
      slug: "pos-thermal-rolls-58mm",
      sku: "HT-SKU-PPR-02",
      shortDescription: "BPA-free thermal paper rolls for POS terminals, cash registers, and mini receipt printers.",
      fullDescription: "High-grade heat-sensitive thermal paper rolls (58mm width). Clear contrast printing with long image retention. Standard fit for all Android & Linux POS terminals used across Nigeria.",
      costPrice: 2800,
      sellingPrice: 3800,
      stockQuantity: 42,
      minStockThreshold: 10,
      isDigital: false,
      requiresDelivery: true,
      status: "ACTIVE",
      imageUrl: "/images/blog/blog-02.jpg",
      weightKg: 0.8,
    },
    {
      id: "prod-pvc-blanks",
      categoryId: "cat-pvc",
      categoryName: "PVC Cards & Identification Supplies",
      name: "CR80 Premium White PVC Card Blanks (Pack of 100)",
      slug: "cr80-white-pvc-cards-pack-100",
      sku: "HT-SKU-PVC-01",
      shortDescription: "High-gloss, graphic quality PVC cards for Fargo, Zebra, Evolis, and standard plastic card printers.",
      fullDescription: "Standard CR80 30-mil blank plastic cards. Smooth, dust-free surface engineered for direct-to-card and retransfer dye-sublimation printers. Used for staff ID badges, membership cards, and student passes.",
      costPrice: 8500,
      sellingPrice: 12500,
      stockQuantity: 28,
      minStockThreshold: 5,
      isDigital: false,
      requiresDelivery: true,
      status: "ACTIVE",
      imageUrl: "/images/blog/blog-03.jpg",
      weightKg: 0.6,
    },
    {
      id: "prod-lanyards",
      categoryId: "cat-pvc",
      categoryName: "PVC Cards & Identification Supplies",
      name: "Branded Lanyards with Metal Swivel Clip (Pack of 25)",
      slug: "lanyards-metal-clip-pack-25",
      sku: "HT-SKU-PVC-02",
      shortDescription: "Durable woven polyester neck lanyards with lobster claw clip for ID badges and access passes.",
      fullDescription: "Standard 15mm soft polyester neck straps with sturdy metal swivel hooks. Comfortable for all-day wear at offices, schools, and corporate events. Available in Royal Blue and Black.",
      costPrice: 3500,
      sellingPrice: 5200,
      stockQuantity: 34,
      minStockThreshold: 10,
      isDigital: false,
      requiresDelivery: true,
      status: "ACTIVE",
      imageUrl: "/images/blog/blog-01.jpg",
      weightKg: 0.4,
    },
    {
      id: "prod-lam-pouch-a4",
      categoryId: "cat-binding",
      categoryName: "Lamination & Binding Materials",
      name: "Thermal Laminating Pouches A4 (100 Microns - Pack of 100)",
      slug: "thermal-laminating-pouches-a4",
      sku: "HT-SKU-LAM-01",
      shortDescription: "Crystal-clear gloss laminating sheets to preserve certificates, price tags, and documents.",
      fullDescription: "Heavy-duty 100-micron laminating pouches providing waterproof, tear-proof protection. Compatible with all thermal hot laminator machines.",
      costPrice: 5000,
      sellingPrice: 7200,
      stockQuantity: 22,
      minStockThreshold: 8,
      isDigital: false,
      requiresDelivery: true,
      status: "ACTIVE",
      imageUrl: "/images/blog/blog-02.jpg",
      weightKg: 1.2,
    },
    {
      id: "prod-flash-64gb",
      categoryId: "cat-accessories",
      categoryName: "Computer & Office Accessories",
      name: "SanDisk Cruzer Blade 64GB USB 2.0 Flash Drive",
      slug: "sandisk-cruzer-64gb-usb",
      sku: "HT-SKU-ACC-01",
      shortDescription: "Compact, ultra-portable USB storage for documents, photos, software setups, and media.",
      fullDescription: "Original SanDisk 64GB USB drive with durable metal-accented plastic casing. Plug-and-play compatibility across Windows, Mac, and Linux.",
      costPrice: 4800,
      sellingPrice: 6500,
      stockQuantity: 19,
      minStockThreshold: 5,
      isDigital: false,
      requiresDelivery: true,
      status: "ACTIVE",
      imageUrl: "/images/blog/blog-03.jpg",
      weightKg: 0.1,
    },
  ];

  const defaultInventoryLogs: ProductInventoryLogRecord[] = [
    {
      id: "inv-log-1",
      productId: "prod-paper-a4",
      productName: "Double A Premium A4 Copy Paper",
      changeType: "RESTOCK",
      quantity: 100,
      balanceBefore: 0,
      balanceAfter: 100,
      notes: "Initial inventory restock from wholesale supplier Lagos Island",
      actorId: "adm-001",
      actorName: "Super Admin",
      createdAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "inv-log-2",
      productId: "prod-paper-a4",
      productName: "Double A Premium A4 Copy Paper",
      changeType: "SALE",
      quantity: -15,
      balanceBefore: 100,
      balanceAfter: 85,
      notes: "Walk-in business centre purchase for commercial printing",
      actorId: "staff-001",
      actorName: "Front Desk Officer",
      createdAt: "2026-09-10T14:30:00Z",
    },
  ];

  const defaultDeliveryZones: DeliveryZoneRecord[] = [
    {
      id: "zone-pickup",
      name: "Physical Office Pickup (Ibeju-Lekki Hub)",
      code: "ZONE_PICKUP",
      state: "Lagos",
      fee: 0,
      estimatedDays: "Same-Day Collection (8:00 AM - 6:00 PM)",
      isActive: true,
    },
    {
      id: "zone-ibeju",
      name: "Ibeju-Lekki / Eleko / Bogije Local Courier",
      code: "ZONE_IBEJU",
      state: "Lagos",
      fee: 1500,
      estimatedDays: "Same Day - 24 Hours",
      isActive: true,
    },
    {
      id: "zone-island",
      name: "Lagos Island / Lekki Phase 1 / Victoria Island / Ikoyi",
      code: "ZONE_ISLAND",
      state: "Lagos",
      fee: 2500,
      estimatedDays: "1-2 Business Days",
      isActive: true,
    },
    {
      id: "zone-mainland",
      name: "Lagos Mainland (Ikeja, Yaba, Surulere, Maryland)",
      code: "ZONE_MAINLAND",
      state: "Lagos",
      fee: 3000,
      estimatedDays: "1-2 Business Days",
      isActive: true,
    },
    {
      id: "zone-interstate",
      name: "Nationwide Interstate Courier (GIG Logistics / Speedaf)",
      code: "ZONE_INTERSTATE",
      state: "Nigeria",
      fee: 5500,
      estimatedDays: "3-5 Business Days",
      isActive: true,
    },
  ];

  const defaultUsers: User[] = [
    {
      id: "adm-001",
      email: "admin@hambaktech.com.ng",
      fullName: "Super Admin",
      name: "Super Admin",
      role: "super_admin",
      status: "ACTIVE",
      phone: "+234 810 000 0000",
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "usr-student-1",
      email: "customer@hambaktech.com.ng",
      fullName: "Oluwaseun Adeyemi",
      name: "Oluwaseun Adeyemi",
      role: "customer",
      status: "ACTIVE",
      phone: "+234 812 345 6789",
      state: "Lagos",
      lga: "Ibeju-Lekki",
      address: "Origanrigan cele Area, Ibeju-Lekki, Lagos",
      createdAt: "2026-06-01T10:00:00Z",
    },
    {
      id: "usr-student-2",
      email: "blessing.eze@example.com",
      fullName: "Blessing Eze",
      name: "Blessing Eze",
      role: "student",
      status: "ACTIVE",
      phone: "+234 803 111 2233",
      state: "Lagos",
      lga: "Epe",
      createdAt: "2026-06-01T09:00:00Z",
    },
    {
      id: "usr-customer-01",
      email: "customer@hambaktech.com.ng",
      fullName: "Abubakar Ibrahim",
      name: "Abubakar Ibrahim",
      role: "customer",
      status: "ACTIVE",
      phone: "+2348147837664",
      state: "Lagos",
      lga: "Ibeju-Lekki",
      address: "Origanrigan cele Area, Ibeju-Lekki, Lagos",
      createdAt: "2026-06-01T10:00:00Z",
    },
    {
      id: "usr-student-01",
      email: "student@hambaktech.com.ng",
      fullName: "Maryam Bello",
      name: "Maryam Bello",
      role: "student",
      status: "ACTIVE",
      phone: "+2349019120241",
      state: "Lagos",
      lga: "Epe",
      createdAt: "2026-06-01T09:00:00Z",
    },
    {
      id: "usr-admin-01",
      email: "admin@hambaktech.com.ng",
      fullName: "Operations Admin",
      name: "Operations Admin",
      role: "admin",
      status: "ACTIVE",
      phone: "+2348000000002",
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "usr-super-admin-01",
      email: "superadmin@hambaktech.com.ng",
      fullName: "System Owner",
      name: "System Owner",
      role: "super_admin",
      status: "ACTIVE",
      phone: "+2348000000001",
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "staff-001",
      email: "staff@hambaktech.com.ng",
      fullName: "Front Desk Officer",
      name: "Front Desk Officer",
      role: "staff",
      status: "ACTIVE",
      phone: "+234 814 555 6677",
      createdAt: "2026-02-15T08:00:00Z",
    },
  ];

  const defaultWallets: Record<string, Wallet> = {
    "adm-001": {
      id: "w-adm-001",
      userId: "adm-001",
      currency: "NGN",
      currentBalance: 500000,
      ledgerBalance: 500000,
      lockedBalance: 0,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    "usr-customer-01": {
      id: "w-usr-customer-01",
      userId: "usr-customer-01",
      currency: "NGN",
      currentBalance: 15500,
      ledgerBalance: 15500,
      lockedBalance: 0,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    "usr-student-01": {
      id: "w-usr-student-01",
      userId: "usr-student-01",
      currency: "NGN",
      currentBalance: 3000,
      ledgerBalance: 3000,
      lockedBalance: 0,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    "usr-admin-01": {
      id: "w-usr-admin-01",
      userId: "usr-admin-01",
      currency: "NGN",
      currentBalance: 250000,
      ledgerBalance: 250000,
      lockedBalance: 0,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    "usr-super-admin-01": {
      id: "w-usr-super-admin-01",
      userId: "usr-super-admin-01",
      currency: "NGN",
      currentBalance: 500000,
      ledgerBalance: 500000,
      lockedBalance: 0,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    "usr-student-1": {
      id: "w-student-1",
      userId: "usr-student-1",
      currency: "NGN",
      currentBalance: 85000,
      ledgerBalance: 85000,
      lockedBalance: 0,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
    "usr-student-2": {
      id: "w-student-2",
      userId: "usr-student-2",
      currency: "NGN",
      currentBalance: 12000,
      ledgerBalance: 12000,
      lockedBalance: 0,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    },
  };

  const defaultPricingRules: PriceRule[] = [
    {
      id: "pr-1",
      serviceName: "MTN SME Data 1GB",
      serviceCategory: "VTU_BILLS",
      provider: "VTU Kingpin API",
      providerCost: 260,
      sellingPrice: 320,
      markupPercent: 23,
      serviceFee: 0,
      customerTier: "STANDARD",
      isActive: true,
      effectiveDate: "2026-09-01",
    },
    {
      id: "pr-2",
      serviceName: "Airtel SME Data 1GB",
      serviceCategory: "VTU_BILLS",
      provider: "VTU Kingpin API",
      providerCost: 275,
      sellingPrice: 340,
      markupPercent: 23.6,
      serviceFee: 0,
      customerTier: "STANDARD",
      isActive: true,
      effectiveDate: "2026-09-01",
    },
    {
      id: "pr-3",
      serviceName: "Electricity DISCO Token Convenience Fee",
      serviceCategory: "VTU_BILLS",
      provider: "Baxi / Remita Switch",
      providerCost: 50,
      sellingPrice: 100,
      markupPercent: 100,
      serviceFee: 100,
      customerTier: "STANDARD",
      isActive: true,
      effectiveDate: "2026-09-01",
    },
    {
      id: "pr-4",
      serviceName: "CAC Business Name Registration",
      serviceCategory: "DIGITAL_PORTALS",
      provider: "CAC Official Desk",
      providerCost: 10000,
      sellingPrice: 22000,
      markupPercent: 120,
      serviceFee: 500,
      customerTier: "STANDARD",
      isActive: true,
      effectiveDate: "2026-09-01",
    },
    {
      id: "pr-5",
      serviceName: "NIN Plastic ID Card Print & Verification",
      serviceCategory: "IDENTITY_NIN",
      provider: "NIMC Official Partner",
      providerCost: 1000,
      sellingPrice: 2500,
      markupPercent: 150,
      serviceFee: 0,
      customerTier: "STANDARD",
      isActive: true,
      effectiveDate: "2026-09-01",
    },
    {
      id: "pr-6",
      serviceName: "Monochrome Photocopying (Per Page)",
      serviceCategory: "BUSINESS_CENTRE",
      provider: "In-House Digital Press",
      providerCost: 15,
      sellingPrice: 30,
      markupPercent: 100,
      serviceFee: 0,
      customerTier: "STANDARD",
      isActive: true,
      effectiveDate: "2026-09-01",
    },
  ];

  const defaultCategories: ServiceCategoryRecord[] = [
    {
      id: "cat-vtu",
      name: "Telecom VTU & Utility Payments",
      code: "VTU",
      description: "Airtime top-up, data bundles, electricity disco tokens, and cable TV subscriptions.",
      activeOfferings: 18,
      status: "ACTIVE",
      sortOrder: 1,
    },
    {
      id: "cat-biz",
      name: "Business Centre & Secretarial",
      code: "BUSINESS_CENTRE",
      description: "Photocopying, typesetting, high-res scanning, lamination, and spiral binding in Ibeju-Lekki.",
      activeOfferings: 8,
      status: "ACTIVE",
      sortOrder: 2,
    },
    {
      id: "cat-print",
      name: "Printing & PVC Card Production",
      code: "PRINTING",
      description: "Plastic NIN card prints, official staff ID cards, promotional flyers, banners, and brochures.",
      activeOfferings: 12,
      status: "ACTIVE",
      sortOrder: 3,
    },
    {
      id: "cat-graph",
      name: "Graphics & Visual Design",
      code: "GRAPHICS",
      description: "Brand identity, logos, event flyers, corporate profiles, and digital advertising collateral.",
      activeOfferings: 6,
      status: "ACTIVE",
      sortOrder: 4,
    },
    {
      id: "cat-web",
      name: "Web & Software Engineering",
      code: "SOFTWARE",
      description: "Responsive websites, custom portal development, database systems, and office IT automation.",
      activeOfferings: 5,
      status: "ACTIVE",
      sortOrder: 5,
    },
    {
      id: "cat-nin",
      name: "NIN Identity Operations",
      code: "NIN_ID",
      description: "NIN verification, premium slip reprints, data modification assistance, and PVC issuance.",
      activeOfferings: 4,
      status: "ACTIVE",
      sortOrder: 6,
    },
    {
      id: "cat-cac",
      name: "CAC Corporate Liaison",
      code: "CAC_REG",
      description: "Business name reservations, corporate registration, annual returns, and post-incorporation filing.",
      activeOfferings: 4,
      status: "ACTIVE",
      sortOrder: 7,
    },
    {
      id: "cat-acad",
      name: "Computer Training Academy",
      code: "ACADEMY",
      description: "Vocational computer literacy, desktop publishing, graphics, web design, and digital literacy.",
      activeOfferings: 7,
      status: "ACTIVE",
      sortOrder: 8,
    },
  ];

  const defaultProviders: SystemProvider[] = [
    {
      id: "prov-1",
      name: "Paystack Nigeria",
      code: "PAYSTACK",
      type: "PAYMENT_GATEWAY",
      environment: "PRODUCTION",
      isActive: true,
      successRate: 99.8,
    },
    {
      id: "prov-2",
      name: "Moniepoint Switch",
      code: "MONIEPOINT",
      type: "PAYMENT_GATEWAY",
      environment: "PRODUCTION",
      isActive: true,
      successRate: 99.4,
    },
    {
      id: "prov-3",
      name: "Telecom VTU Bridge",
      code: "VTU_GATEWAY",
      type: "TELECOM_VTU",
      environment: "PRODUCTION",
      isActive: true,
      successRate: 98.6,
      balance: 420800,
    },
    {
      id: "prov-4",
      name: "DISCO Power Gateway",
      code: "DISCO_API",
      type: "UTILITY_DISCO",
      environment: "PRODUCTION",
      isActive: true,
      successRate: 99.4,
    },
  ];

  const defaultAnnouncements: CMSAnnouncement[] = [
    {
      id: "ann-1",
      title: "Academy Q4 Cohort Registration is Now Open",
      message: "Early bird enrollment is ongoing for Web Development, Graphic Design, and Advanced Excel courses with verified certification.",
      category: "GENERAL",
      isActive: true,
      createdAt: "2026-09-10T08:00:00Z",
    },
    {
      id: "ann-2",
      title: "Official HambakTech Stationery & PVC Store Launched",
      message: "Purchase premium A4 copy papers, POS thermal rolls, blank CR80 PVC cards, and branded lanyards directly online.",
      category: "PROMOTION",
      isActive: true,
      createdAt: "2026-09-12T09:00:00Z",
    },
  ];

  const defaultOrders: Order[] = [
    {
      id: "ord-001",
      orderNumber: "HT-ORD-2026-1001",
      userId: "usr-student-1",
      userName: "Oluwaseun Adeyemi",
      userEmail: "customer@hambaktech.com.ng",
      userPhone: "+234 812 345 6789",
      serviceCategorySlug: "shop",
      serviceCategoryName: "Shop & Office Stationery",
      serviceTitle: "Office Stationery Restock & Blank PVC Cards",
      status: "PROCESSING",
      paymentStatus: "PAID",
      paymentMethod: "WALLET",
      totalAmount: 18000,
      feeAmount: 0,
      currency: "NGN",
      items: [
        {
          title: "Double A Premium A4 Copy Paper (Ream - 500 Sheets)",
          quantity: 1,
          unitPrice: 5500,
        },
        {
          title: "CR80 Premium White PVC Card Blanks (Pack of 100)",
          quantity: 1,
          unitPrice: 12500,
        },
      ],
      statusTimeline: [
        { status: "PENDING", timestamp: "2026-09-14T08:00:00Z", note: "Order placed and paid via Wallet" },
        { status: "PROCESSING", timestamp: "2026-09-14T08:30:00Z", note: "Inventory allocated; preparing package" },
      ],
      deliveryType: "PHYSICAL_PICKUP",
      createdAt: "2026-09-14T08:00:00Z",
      updatedAt: "2026-09-14T08:30:00Z",
    },
  ];

  const defaultAuditLogs: AuditLogEntry[] = [
    {
      id: "audit-001",
      timestamp: "2026-09-14T05:00:00Z",
      actorName: "Super Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "super_admin",
      action: "INIT_M8_M9_M10",
      entity: "SYSTEM_CORE",
      entityId: "SYS-INIT",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { milestone: "M8, M9, M10 Complete Implementation" },
    },
  ];

  const defaultTransactions: Transaction[] = [
    {
      id: "tx-init-01",
      reference: "HT-TX-20260901-001",
      userId: "usr-customer-01",
      userName: "Abubakar Ibrahim",
      userEmail: "customer@hambaktech.com.ng",
      walletId: "w-usr-customer-01",
      type: "WALLET_TOPUP",
      amount: 20000,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: "PAYSTACK",
      description: "Wallet Funding via Paystack Card",
      createdAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "tx-init-02",
      reference: "HT-TX-20260905-002",
      userId: "usr-customer-01",
      userName: "Abubakar Ibrahim",
      userEmail: "customer@hambaktech.com.ng",
      walletId: "w-usr-customer-01",
      type: "VTU_AIRTIME",
      amount: 4500,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: "WALLET",
      description: "MTN VTU Airtime top-up 08147837664",
      createdAt: "2026-09-05T14:30:00Z",
    },
    {
      id: "tx-init-03",
      reference: "HT-TX-20260910-003",
      userId: "usr-student-01",
      userName: "Maryam Bello",
      userEmail: "student@hambaktech.com.ng",
      walletId: "w-usr-student-01",
      type: "WALLET_TOPUP",
      amount: 10000,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: "FLUTTERWAVE",
      description: "Wallet Funding via Bank Transfer",
      createdAt: "2026-09-10T08:15:00Z",
    },
  ];

  const defaultLedgerEntries: WalletLedgerEntry[] = [
    {
      id: "led-init-01",
      walletId: "w-usr-customer-01",
      entryType: "CREDIT",
      amount: 20000,
      balanceAfter: 20000,
      referenceType: "WALLET_FUNDING",
      referenceId: "tx-init-01",
      description: "Wallet Funding via Paystack Card",
      createdAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "led-init-02",
      walletId: "w-usr-customer-01",
      entryType: "DEBIT",
      amount: 4500,
      balanceAfter: 15500,
      referenceType: "SERVICE_PURCHASE",
      referenceId: "tx-init-02",
      description: "MTN VTU Airtime purchase",
      createdAt: "2026-09-05T14:30:00Z",
    },
    {
      id: "led-init-03",
      walletId: "w-usr-student-01",
      entryType: "CREDIT",
      amount: 10000,
      balanceAfter: 10000,
      referenceType: "WALLET_FUNDING",
      referenceId: "tx-init-03",
      description: "Wallet Funding via Flutterwave",
      createdAt: "2026-09-10T08:15:00Z",
    },
    {
      id: "led-init-04",
      walletId: "w-usr-student-01",
      entryType: "DEBIT",
      amount: 7000,
      balanceAfter: 3000,
      referenceType: "SERVICE_PURCHASE",
      referenceId: "ord-acad-001",
      description: "Course enrollment deposit",
      createdAt: "2026-09-10T08:20:00Z",
    },
  ];

  const defaultNotifications: NotificationItem[] = [
    {
      id: "notif-01",
      userId: "usr-customer-01",
      title: "Welcome to HambakTech Mobile",
      message: "Your smart digital account is active. Manage your wallet, order services, and enroll in training anytime.",
      type: "SYSTEM",
      read: false,
      createdAt: "2026-09-14T06:00:00Z",
    },
    {
      id: "notif-02",
      userId: "usr-customer-01",
      title: "Wallet Top-up Confirmed",
      message: "Your wallet was credited with ₦20,000.00 via Paystack.",
      type: "TRANSACTION",
      read: true,
      createdAt: "2026-09-01T10:00:00Z",
    },
    {
      id: "notif-03",
      userId: "usr-student-01",
      title: "Academy Portal Access Ready",
      message: "Your Computer Training Academy student credentials and digital ID card are ready for download.",
      type: "ORDER",
      read: false,
      createdAt: "2026-09-10T08:30:00Z",
    },
    {
      id: "notif-04",
      title: "New Stationery & PVC Products In Stock",
      message: "Check the shop for fresh stock of A4 reams, thermal paper, and CR80 blank PVC cards.",
      type: "ANNOUNCEMENT",
      read: false,
      createdAt: "2026-09-13T09:00:00Z",
    },
  ];

  return {
    users: defaultUsers,
    wallets: defaultWallets,
    ledgerEntries: defaultLedgerEntries,
    transactions: defaultTransactions,
    orders: defaultOrders,
    pricingRules: defaultPricingRules,
    systemProviders: defaultProviders,
    announcements: defaultAnnouncements,
    auditLogs: defaultAuditLogs,
    notifications: defaultNotifications,
    ninRequests: [],
    cacRequests: [],
    supportTickets: [],
    serviceCategories: defaultCategories,
    services: [...servicesData],
    // Academy
    instructors: defaultInstructors,
    courses: defaultCourses,
    enrollments: defaultEnrollments,
    assignments: [],
    submissions: defaultSubmissions,
    certificates: defaultCertificates,
    idCards: defaultIdCards,
    // Shop
    productCategories: defaultProductCategories,
    products: defaultProducts,
    inventoryLogs: defaultInventoryLogs,
    deliveryZones: defaultDeliveryZones,
    // Settings
    systemSettings: {
      siteName: "HambakTech Smart Digital & ICT Platform",
      supportEmail: "support@hambaktech.com.ng",
      supportPhone: "+234 810 000 0000",
      officeAddress: "Origanrigan cele Area, Ibeju-Lekki, Lagos State, Nigeria",
      maintenanceMode: false,
      allowRegistration: true,
      platformFeeRate: 1.5,
      defaultCurrency: "NGN",
    },
  };
}

function getStore(): PlatformStoreState {
  if (!globalThis.__hambakPlatformStore) {
    globalThis.__hambakPlatformStore = initializeDefaultStore();
  }
  return globalThis.__hambakPlatformStore;
}

// ============================================================================
// ACADEMY SERVICE LAYER
// ============================================================================

export const AcademyService = {
  async getCourses(): Promise<CourseRecord[]> {
    const store = getStore();
    return store.courses;
  },

  async getCourseById(idOrSlug: string): Promise<CourseRecord | null> {
    const store = getStore();
    return (
      store.courses.find((c) => c.id === idOrSlug || c.slug === idOrSlug) ||
      null
    );
  },

  async createCourse(
    data: Omit<CourseRecord, "id">,
    actorId?: string
  ): Promise<CourseRecord> {
    const store = getStore();
    const id = `crs-${Date.now()}`;
    const newCourse: CourseRecord = {
      ...data,
      id,
      modulesCount: data.modules?.length || 0,
      lessonsCount:
        data.modules?.reduce(
          (acc, m) => acc + (m.lessons ? m.lessons.length : 0),
          0
        ) || 0,
      enrolledStudentsCount: 0,
    };
    store.courses.unshift(newCourse);

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "COURSE_CREATED",
      entity: "ACADEMY_COURSE",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { title: newCourse.title, tuitionFee: newCourse.tuitionFee },
    });

    return newCourse;
  },

  async updateCourse(
    id: string,
    updates: Partial<CourseRecord>,
    actorId?: string
  ): Promise<CourseRecord | null> {
    const store = getStore();
    const index = store.courses.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const existing = store.courses[index];
    const updated: CourseRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      modulesCount: updates.modules
        ? updates.modules.length
        : existing.modulesCount,
      lessonsCount: updates.modules
        ? updates.modules.reduce(
            (acc, m) => acc + (m.lessons ? m.lessons.length : 0),
            0
          )
        : existing.lessonsCount,
    };
    store.courses[index] = updated;

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "COURSE_UPDATED",
      entity: "ACADEMY_COURSE",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { updates },
    });

    return updated;
  },

  async deleteCourse(id: string, actorId?: string): Promise<boolean> {
    const store = getStore();
    const index = store.courses.findIndex((c) => c.id === id);
    if (index === -1) return false;

    store.courses.splice(index, 1);

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "COURSE_DELETED",
      entity: "ACADEMY_COURSE",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return true;
  },

  async getInstructors(): Promise<InstructorRecord[]> {
    const store = getStore();
    return store.instructors;
  },

  async createInstructor(
    data: Omit<InstructorRecord, "id">,
    actorId?: string
  ): Promise<InstructorRecord> {
    const store = getStore();
    const id = `inst-${Date.now()}`;
    const instructor: InstructorRecord = { ...data, id };
    store.instructors.push(instructor);

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "INSTRUCTOR_CREATED",
      entity: "INSTRUCTOR",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { name: instructor.name, specialization: instructor.specialization },
    });

    return instructor;
  },

  async updateInstructor(
    id: string,
    updates: Partial<InstructorRecord>,
    actorId?: string
  ): Promise<InstructorRecord | null> {
    const store = getStore();
    const index = store.instructors.findIndex((i) => i.id === id);
    if (index === -1) return null;

    store.instructors[index] = { ...store.instructors[index], ...updates };

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "INSTRUCTOR_UPDATED",
      entity: "INSTRUCTOR",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return store.instructors[index];
  },

  async deleteInstructor(id: string, actorId?: string): Promise<boolean> {
    const store = getStore();
    const index = store.instructors.findIndex((i) => i.id === id);
    if (index === -1) return false;

    store.instructors.splice(index, 1);

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "INSTRUCTOR_DELETED",
      entity: "INSTRUCTOR",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return true;
  },

  async getEnrollments(userId?: string): Promise<AcademyEnrollment[]> {
    const store = getStore();
    if (userId) {
      return store.enrollments.filter((e) => e.userId === userId);
    }
    return store.enrollments;
  },

  async getEnrollmentById(id: string): Promise<AcademyEnrollment | null> {
    const store = getStore();
    return store.enrollments.find((e) => e.id === id) || null;
  },

  async enrollStudent(payload: {
    userId: string;
    courseId: string;
    studentName: string;
    studentEmail: string;
    studentPhone?: string;
    cohort?: string;
    payWithWallet?: boolean;
  }): Promise<{ enrollment: AcademyEnrollment; walletDeducted: boolean }> {
    const store = getStore();
    const course = store.courses.find((c) => c.id === payload.courseId);
    if (!course) {
      throw new Error(`Course not found with id: ${payload.courseId}`);
    }

    // Check existing enrollment
    const existing = store.enrollments.find(
      (e) => e.userId === payload.userId && e.courseId === payload.courseId
    );
    if (existing) {
      return { enrollment: existing, walletDeducted: false };
    }

    let walletDeducted = false;
    if (payload.payWithWallet && course.tuitionFee > 0) {
      const wallet = store.wallets[payload.userId];
      if (!wallet || wallet.currentBalance < course.tuitionFee) {
        throw new Error(
          `Insufficient wallet balance (₦${wallet?.currentBalance || 0}) for tuition fee (₦${course.tuitionFee}). Please fund your wallet.`
        );
      }

      // Deduct wallet
      wallet.currentBalance -= course.tuitionFee;
      wallet.ledgerBalance -= course.tuitionFee;
      wallet.updatedAt = new Date().toISOString();

      store.ledgerEntries.unshift({
        id: `led-${Date.now()}`,
        walletId: wallet.id,
        entryType: "DEBIT",
        amount: course.tuitionFee,
        balanceAfter: wallet.currentBalance,
        referenceType: "SERVICE_PURCHASE",
        referenceId: `enr-${Date.now()}`,
        description: `Tuition payment for ${course.title}`,
        createdAt: new Date().toISOString(),
      });

      store.transactions.unshift({
        id: `tx-${Date.now()}`,
        reference: `HT-TX-${Date.now().toString().slice(-6)}`,
        userId: payload.userId,
        userName: payload.studentName,
        userEmail: payload.studentEmail,
        walletId: wallet.id,
        type: "ACADEMY_ENROLLMENT",
        amount: course.tuitionFee,
        fee: 0,
        currency: "NGN",
        status: "SUCCESSFUL",
        paymentMethod: "WALLET",
        description: `Enrolled in ${course.title} (${course.code})`,
        createdAt: new Date().toISOString(),
      });

      walletDeducted = true;
    }

    const enrollmentId = `enr-${Date.now()}`;
    const enrollmentNumber = `HT-STU-2026-${String(store.enrollments.length + 1).padStart(4, "0")}`;

    const newEnrollment: AcademyEnrollment = {
      id: enrollmentId,
      enrollmentNumber,
      userId: payload.userId,
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      studentName: payload.studentName,
      studentEmail: payload.studentEmail,
      studentPhone: payload.studentPhone,
      cohort: payload.cohort || "Batch Q4 2026",
      progressPercent: 0,
      status: "ENROLLED",
      completedModules: [],
      completedLessons: [],
      certificateIssued: false,
      hasIdCard: false,
      enrolledAt: new Date().toISOString(),
    };

    store.enrollments.unshift(newEnrollment);
    course.enrolledStudentsCount = (course.enrolledStudentsCount || 0) + 1;

    // Automatically provision student ID card
    const idCardNumber = `HT-ID-2026-${String(store.idCards.length + 1).padStart(4, "0")}`;
    const newIdCard: StudentIdCardRecord = {
      id: `idcard-${Date.now()}`,
      cardNumber: idCardNumber,
      enrollmentId,
      studentId: payload.userId,
      studentName: payload.studentName,
      studentEmail: payload.studentEmail,
      courseTitle: course.title,
      courseCode: course.code,
      cohort: newEnrollment.cohort,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      qrCodeData: `https://hambaktech.com.ng/verify/certificate/${idCardNumber}`,
      status: "ACTIVE",
      emergencyContact: payload.studentPhone,
    };
    store.idCards.unshift(newIdCard);
    newEnrollment.hasIdCard = true;
    newEnrollment.idCardNumber = idCardNumber;

    AuditService.log({
      actorName: payload.studentName,
      actorEmail: payload.studentEmail,
      role: "customer",
      action: "STUDENT_ENROLLED",
      entity: "ACADEMY_ENROLLMENT",
      entityId: enrollmentId,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { courseTitle: course.title, tuitionFee: course.tuitionFee },
    });

    return { enrollment: newEnrollment, walletDeducted };
  },

  async updateProgress(
    enrollmentId: string,
    lessonId: string,
    moduleId: number
  ): Promise<AcademyEnrollment | null> {
    const store = getStore();
    const enrollment = store.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return null;

    if (!enrollment.completedLessons) {
      enrollment.completedLessons = [];
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    if (!enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
    }

    // Calculate progress against course lessons
    const course = store.courses.find((c) => c.id === enrollment.courseId);
    const totalLessons = course?.lessonsCount || 10;
    const progress = Math.min(
      100,
      Math.round((enrollment.completedLessons.length / totalLessons) * 100)
    );

    enrollment.progressPercent = progress;
    if (progress >= 100) {
      enrollment.status = "COMPLETED";
      enrollment.completedAt = new Date().toISOString();

      // Automatically issue certificate if not already issued
      if (!enrollment.certificateIssued) {
        await this.issueCertificate(enrollment.id, "Distinction", "Auto-Engine");
      }
    } else {
      enrollment.status = "IN_PROGRESS";
    }

    return enrollment;
  },

  async getAssignments(courseId?: string): Promise<CourseAssignmentRecord[]> {
    const store = getStore();
    const allAssignments: CourseAssignmentRecord[] = [];
    store.courses.forEach((c) => {
      if (!courseId || c.id === courseId) {
        if (c.assignments) {
          allAssignments.push(...c.assignments);
        }
      }
    });
    return allAssignments;
  },

  async submitAssignment(payload: {
    assignmentId: string;
    enrollmentId: string;
    studentId: string;
    studentName: string;
    content: string;
    fileUrl?: string;
  }): Promise<AssignmentSubmissionRecord> {
    const store = getStore();
    const id = `sub-${Date.now()}`;
    const submission: AssignmentSubmissionRecord = {
      id,
      assignmentId: payload.assignmentId,
      enrollmentId: payload.enrollmentId,
      studentId: payload.studentId,
      studentName: payload.studentName,
      content: payload.content,
      fileUrl: payload.fileUrl,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
    };

    store.submissions.unshift(submission);

    AuditService.log({
      actorName: payload.studentName,
      actorEmail: "student@hambaktech.com.ng",
      role: "student",
      action: "ASSIGNMENT_SUBMITTED",
      entity: "ASSIGNMENT_SUBMISSION",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return submission;
  },

  async gradeSubmission(
    submissionId: string,
    gradeData: { score: number; grade: string; feedback: string },
    actorId?: string
  ): Promise<AssignmentSubmissionRecord | null> {
    const store = getStore();
    const submission = store.submissions.find((s) => s.id === submissionId);
    if (!submission) return null;

    submission.score = gradeData.score;
    submission.grade = gradeData.grade;
    submission.feedback = gradeData.feedback;
    submission.status = "GRADED";
    submission.gradedAt = new Date().toISOString();

    AuditService.log({
      actorName: actorId || "Instructor",
      actorEmail: "instructor@hambaktech.com.ng",
      role: "instructor",
      action: "ASSIGNMENT_GRADED",
      entity: "ASSIGNMENT_SUBMISSION",
      entityId: submissionId,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { score: gradeData.score, grade: gradeData.grade },
    });

    return submission;
  },

  async getSubmissions(assignmentId?: string, studentId?: string): Promise<AssignmentSubmissionRecord[]> {
    const store = getStore();
    return store.submissions.filter((s) => {
      if (assignmentId && s.assignmentId !== assignmentId) return false;
      if (studentId && s.studentId !== studentId) return false;
      return true;
    });
  },

  async getCertificates(studentId?: string): Promise<CertificateRecord[]> {
    const store = getStore();
    if (studentId) {
      const studentEnrollmentIds = new Set(
        store.enrollments.filter((e) => e.userId === studentId).map((e) => e.id)
      );
      return store.certificates.filter((c) => studentEnrollmentIds.has(c.enrollmentId));
    }
    return store.certificates;
  },

  async issueCertificate(
    enrollmentId: string,
    grade = "Distinction",
    issuedByName = "Engr. Hammed Bakare"
  ): Promise<CertificateRecord> {
    const store = getStore();
    const enrollment = store.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) {
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    const certSeq = String(store.certificates.length + 1).padStart(4, "0");
    const certificateNumber = `HT-CERT-2026-${certSeq}`;
    const verificationHash = `${certificateNumber}-${Date.now().toString(16)}-hambaktech`;

    const newCertificate: CertificateRecord = {
      id: `cert-${Date.now()}`,
      certificateNumber,
      verificationHash,
      enrollmentId: enrollment.id,
      studentName: enrollment.studentName,
      courseTitle: enrollment.courseTitle,
      courseCode: enrollment.courseCode,
      grade,
      issuedAt: new Date().toISOString(),
      issuedByName,
      isRevoked: false,
      verificationUrl: `https://hambaktech.com.ng/verify/certificate/${certificateNumber}`,
    };

    store.certificates.unshift(newCertificate);
    enrollment.certificateIssued = true;
    enrollment.certificateNumber = certificateNumber;
    enrollment.certificateHash = verificationHash;
    enrollment.certificateDate = newCertificate.issuedAt;

    AuditService.log({
      actorName: issuedByName,
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "CERTIFICATE_ISSUED",
      entity: "CERTIFICATE",
      entityId: certificateNumber,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { studentName: enrollment.studentName, course: enrollment.courseTitle },
    });

    return newCertificate;
  },

  async verifyCertificate(code: string): Promise<CertificateVerificationResult> {
    const store = getStore();
    const cert = store.certificates.find(
      (c) =>
        c.certificateNumber.toLowerCase() === code.toLowerCase() ||
        c.verificationHash.toLowerCase() === code.toLowerCase()
    );

    if (!cert) {
      return {
        valid: false,
        certificateNumber: code,
        verificationHash: "",
        studentInitialsOrPublicName: "Not Found",
        courseTitle: "Unknown Credential",
        issuedAt: "",
        status: "NOT_FOUND",
        issuingInstitution: "HambakTech Institute of Information Technology",
        verificationUrl: `https://hambaktech.com.ng/verify/certificate/${code}`,
      };
    }

    // Protect sensitive student data: return public name only (no phone, no email, no address)
    return {
      valid: !cert.isRevoked,
      certificateNumber: cert.certificateNumber,
      verificationHash: cert.verificationHash,
      studentInitialsOrPublicName: cert.studentName,
      courseTitle: cert.courseTitle,
      courseCode: cert.courseCode,
      issuedAt: cert.issuedAt,
      grade: cert.grade,
      status: cert.isRevoked ? "REVOKED" : "VALID",
      issuingInstitution:
        "HambakTech Institute of Information Technology, Ibeju-Lekki, Lagos, Nigeria",
      accreditedSkills: [
        "Digital Technology Operations",
        "Practical Capstone Mastery",
        "Applied Vocational Computing",
        "Official Competency Verification",
      ],
      verificationUrl: cert.verificationUrl,
    };
  },

  async getIdCards(studentId?: string): Promise<StudentIdCardRecord[]> {
    const store = getStore();
    if (studentId) {
      return store.idCards.filter((c) => c.studentId === studentId);
    }
    return store.idCards;
  },

  async issueIdCard(enrollmentId: string, actorId?: string): Promise<StudentIdCardRecord> {
    const store = getStore();
    const enrollment = store.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) {
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    const existing = store.idCards.find((c) => c.enrollmentId === enrollmentId);
    if (existing) return existing;

    const cardSeq = String(store.idCards.length + 1).padStart(4, "0");
    const cardNumber = `HT-ID-2026-${cardSeq}`;
    const newCard: StudentIdCardRecord = {
      id: `idcard-${Date.now()}`,
      cardNumber,
      enrollmentId,
      studentId: enrollment.userId,
      studentName: enrollment.studentName,
      studentEmail: enrollment.studentEmail,
      courseTitle: enrollment.courseTitle,
      courseCode: enrollment.courseCode || "HT-CRS",
      cohort: enrollment.cohort,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      qrCodeData: `https://hambaktech.com.ng/verify/certificate/${cardNumber}`,
      status: "ACTIVE",
      emergencyContact: enrollment.studentPhone,
    };

    store.idCards.unshift(newCard);
    enrollment.hasIdCard = true;
    enrollment.idCardNumber = cardNumber;

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "ID_CARD_ISSUED",
      entity: "STUDENT_ID_CARD",
      entityId: cardNumber,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return newCard;
  },
};

// ============================================================================
// SHOP SERVICE LAYER
// ============================================================================

export const ShopService = {
  async getProductCategories(): Promise<ProductCategoryRecord[]> {
    const store = getStore();
    return store.productCategories;
  },

  async createProductCategory(
    data: Omit<ProductCategoryRecord, "id">,
    actorId?: string
  ): Promise<ProductCategoryRecord> {
    const store = getStore();
    const id = `cat-${Date.now()}`;
    const cat: ProductCategoryRecord = { ...data, id, productsCount: 0 };
    store.productCategories.push(cat);

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "PRODUCT_CATEGORY_CREATED",
      entity: "PRODUCT_CATEGORY",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return cat;
  },

  async updateProductCategory(
    id: string,
    updates: Partial<ProductCategoryRecord>,
    actorId?: string
  ): Promise<ProductCategoryRecord | null> {
    const store = getStore();
    const index = store.productCategories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    store.productCategories[index] = { ...store.productCategories[index], ...updates };

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "PRODUCT_CATEGORY_UPDATED",
      entity: "PRODUCT_CATEGORY",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return store.productCategories[index];
  },

  async deleteProductCategory(id: string, actorId?: string): Promise<boolean> {
    const store = getStore();
    const index = store.productCategories.findIndex((c) => c.id === id);
    if (index === -1) return false;

    store.productCategories.splice(index, 1);

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "PRODUCT_CATEGORY_DELETED",
      entity: "PRODUCT_CATEGORY",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return true;
  },

  async getProducts(categoryId?: string): Promise<ProductRecord[]> {
    const store = getStore();
    if (categoryId) {
      return store.products.filter((p) => p.categoryId === categoryId);
    }
    return store.products;
  },

  async getProductById(idOrSlug: string): Promise<ProductRecord | null> {
    const store = getStore();
    return (
      store.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ||
      null
    );
  },

  async createProduct(
    data: Omit<ProductRecord, "id">,
    actorId?: string
  ): Promise<ProductRecord> {
    const store = getStore();
    const id = `prod-${Date.now()}`;
    const product: ProductRecord = { ...data, id };
    store.products.unshift(product);

    // Create initial inventory log
    if (product.stockQuantity > 0) {
      store.inventoryLogs.unshift({
        id: `inv-${Date.now()}`,
        productId: id,
        productName: product.name,
        changeType: "RESTOCK",
        quantity: product.stockQuantity,
        balanceBefore: 0,
        balanceAfter: product.stockQuantity,
        notes: "Initial inventory setup on product creation",
        actorId: actorId || "adm-001",
        actorName: "Admin",
        createdAt: new Date().toISOString(),
      });
    }

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "PRODUCT_CREATED",
      entity: "PRODUCT",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { name: product.name, sellingPrice: product.sellingPrice, stock: product.stockQuantity },
    });

    return product;
  },

  async updateProduct(
    id: string,
    updates: Partial<ProductRecord>,
    actorId?: string
  ): Promise<ProductRecord | null> {
    const store = getStore();
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = store.products[index];
    const updated: ProductRecord = { ...existing, ...updates, id: existing.id };

    // Update status if stock reached 0
    if (updated.stockQuantity <= 0) {
      updated.status = "OUT_OF_STOCK";
    } else if (updated.status === "OUT_OF_STOCK" && updated.stockQuantity > 0) {
      updated.status = "ACTIVE";
    }

    store.products[index] = updated;

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "PRODUCT_UPDATED",
      entity: "PRODUCT",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { updates },
    });

    return updated;
  },

  async deleteProduct(id: string, actorId?: string): Promise<boolean> {
    const store = getStore();
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    store.products.splice(index, 1);

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "PRODUCT_DELETED",
      entity: "PRODUCT",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return true;
  },

  async adjustStock(
    productId: string,
    changeType: "RESTOCK" | "SALE" | "ADJUSTMENT" | "RETURN" | "DAMAGE",
    quantity: number,
    notes?: string,
    actorId = "Admin",
    actorName = "Admin"
  ): Promise<ProductRecord> {
    const store = getStore();
    const product = store.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const balanceBefore = product.stockQuantity;
    const balanceAfter = Math.max(0, balanceBefore + quantity);

    product.stockQuantity = balanceAfter;
    if (balanceAfter <= 0) {
      product.status = "OUT_OF_STOCK";
    } else if (product.status === "OUT_OF_STOCK" && balanceAfter > 0) {
      product.status = "ACTIVE";
    }

    const log: ProductInventoryLogRecord = {
      id: `inv-${Date.now()}`,
      productId,
      productName: product.name,
      changeType,
      quantity,
      balanceBefore,
      balanceAfter,
      notes: notes || `Stock updated via ${changeType}`,
      actorId,
      actorName,
      createdAt: new Date().toISOString(),
    };

    store.inventoryLogs.unshift(log);

    AuditService.log({
      actorName,
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "STOCK_ADJUSTED",
      entity: "INVENTORY",
      entityId: productId,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { changeType, quantity, balanceBefore, balanceAfter },
    });

    return product;
  },

  async getInventoryLogs(productId?: string): Promise<ProductInventoryLogRecord[]> {
    const store = getStore();
    if (productId) {
      return store.inventoryLogs.filter((l) => l.productId === productId);
    }
    return store.inventoryLogs;
  },

  async getDeliveryZones(): Promise<DeliveryZoneRecord[]> {
    const store = getStore();
    return store.deliveryZones;
  },

  async createShopOrder(payload: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    items: Array<{ productId: string; quantity: number }>;
    deliveryZoneId: string;
    deliveryAddress?: string;
    paymentMethod: "WALLET" | "PAYSTACK" | "MONIEPOINT" | "BANK_TRANSFER";
    notes?: string;
  }): Promise<Order> {
    const store = getStore();
    const deliveryZone = store.deliveryZones.find(
      (z) => z.id === payload.deliveryZoneId
    );
    if (!deliveryZone) {
      throw new Error(`Delivery zone not found: ${payload.deliveryZoneId}`);
    }

    let itemsSubtotal = 0;
    const orderItems: Array<{
      title: string;
      quantity: number;
      unitPrice: number;
      serviceId?: string;
    }> = [];

    // Verify stock and prepare items
    for (const itemReq of payload.items) {
      const product = store.products.find((p) => p.id === itemReq.productId);
      if (!product) {
        throw new Error(`Product not found: ${itemReq.productId}`);
      }
      if (product.stockQuantity < itemReq.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Requested: ${itemReq.quantity}, Available: ${product.stockQuantity}`
        );
      }

      const unitPrice = product.discountPrice || product.sellingPrice;
      itemsSubtotal += unitPrice * itemReq.quantity;
      orderItems.push({
        title: product.name,
        quantity: itemReq.quantity,
        unitPrice,
        serviceId: product.id,
      });
    }

    const totalAmount = itemsSubtotal + deliveryZone.fee;

    // Process wallet payment if selected
    if (payload.paymentMethod === "WALLET") {
      const wallet = store.wallets[payload.userId];
      if (!wallet || wallet.currentBalance < totalAmount) {
        throw new Error(
          `Insufficient wallet balance (₦${wallet?.currentBalance || 0}). Order total is ₦${totalAmount}. Please fund your wallet or choose another payment method.`
        );
      }

      wallet.currentBalance -= totalAmount;
      wallet.ledgerBalance -= totalAmount;
      wallet.updatedAt = new Date().toISOString();

      store.ledgerEntries.unshift({
        id: `led-${Date.now()}`,
        walletId: wallet.id,
        entryType: "DEBIT",
        amount: totalAmount,
        balanceAfter: wallet.currentBalance,
        referenceType: "ORDER_PAYMENT",
        referenceId: `ord-${Date.now()}`,
        description: `Payment for stationery/physical store order (${orderItems.length} items)`,
        createdAt: new Date().toISOString(),
      });
    }

    // Deduct stock for all items
    for (const itemReq of payload.items) {
      await this.adjustStock(
        itemReq.productId,
        "SALE",
        -itemReq.quantity,
        `Order fulfillment for ${payload.userName}`,
        payload.userId,
        payload.userName
      );
    }

    const orderNumber = `HT-ORD-2026-${String(store.orders.length + 1).padStart(4, "0")}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: payload.userId,
      userName: payload.userName,
      userEmail: payload.userEmail,
      userPhone: payload.userPhone,
      serviceCategorySlug: "shop",
      serviceCategoryName: "Shop & Physical Stationery",
      serviceTitle: orderItems.map((i) => `${i.quantity}x ${i.title}`).join(", "),
      status: "PROCESSING",
      paymentStatus: payload.paymentMethod === "WALLET" ? "PAID" : "PENDING",
      paymentMethod: payload.paymentMethod,
      totalAmount,
      feeAmount: deliveryZone.fee,
      currency: "NGN",
      items: orderItems,
      statusTimeline: [
        {
          status: "PENDING",
          timestamp: new Date().toISOString(),
          note: `Order created. Payment via ${payload.paymentMethod}. Destination: ${deliveryZone.name}`,
        },
        {
          status: "PROCESSING",
          timestamp: new Date().toISOString(),
          note: "Stock allocated from inventory. Packaging in progress.",
        },
      ],
      deliveryType:
        deliveryZone.fee === 0 ? "PHYSICAL_PICKUP" : "COURIER_DELIVERY",
      notes: payload.notes || `Delivery to: ${payload.deliveryAddress || "Office Pickup"}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.orders.unshift(newOrder);

    // Create transaction record
    store.transactions.unshift({
      id: `tx-${Date.now()}`,
      reference: `HT-TX-${Date.now().toString().slice(-6)}`,
      userId: payload.userId,
      userName: payload.userName,
      userEmail: payload.userEmail,
      type: "ORDER_PAYMENT",
      amount: totalAmount,
      fee: deliveryZone.fee,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: payload.paymentMethod,
      description: `Physical Shop Order ${orderNumber} (${orderItems.length} items)`,
      createdAt: new Date().toISOString(),
    });

    AuditService.log({
      actorName: payload.userName,
      actorEmail: payload.userEmail,
      role: "customer",
      action: "SHOP_ORDER_CREATED",
      entity: "SHOP_ORDER",
      entityId: orderNumber,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { totalAmount, itemsCount: orderItems.length },
    });

    return newOrder;
  },
};

// ============================================================================
// ADMIN, PRICING & OPERATIONS SERVICE LAYER
// ============================================================================

export const AdminService = {
  async getPricingRules(): Promise<PriceRule[]> {
    const store = getStore();
    return store.pricingRules;
  },

  async updatePricingRule(
    id: string,
    updates: Partial<PriceRule>,
    actorId?: string
  ): Promise<PriceRule | null> {
    const store = getStore();
    const index = store.pricingRules.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = store.pricingRules[index];
    const updated: PriceRule = { ...existing, ...updates, id: existing.id };
    store.pricingRules[index] = updated;

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "PRICE_RULE_UPDATED",
      entity: "PRICING_RULE",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { serviceName: updated.serviceName, newPrice: updated.sellingPrice, cost: updated.providerCost },
    });

    return updated;
  },

  async createPricingRule(
    data: Omit<PriceRule, "id">,
    actorId?: string
  ): Promise<PriceRule> {
    const store = getStore();
    const id = `pr-${Date.now()}`;
    const rule: PriceRule = { ...data, id };
    store.pricingRules.push(rule);

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "PRICE_RULE_CREATED",
      entity: "PRICING_RULE",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { serviceName: rule.serviceName, sellingPrice: rule.sellingPrice },
    });

    return rule;
  },

  async getOrders(userId?: string): Promise<Order[]> {
    const store = getStore();
    if (userId) {
      return store.orders.filter((o) => o.userId === userId);
    }
    return store.orders;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    actorId = "Admin"
  ): Promise<Order | null> {
    const store = getStore();
    const order = store.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    order.statusTimeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status} by ${actorId}`,
    });

    AuditService.log({
      actorName: actorId,
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "ORDER_STATUS_UPDATED",
      entity: "ORDER",
      entityId: order.orderNumber,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { newStatus: status, note },
    });

    return order;
  },

  async getUsers(): Promise<User[]> {
    const store = getStore();
    return store.users;
  },

  async updateUser(
    id: string,
    updates: Partial<User>,
    actorId?: string
  ): Promise<User | null> {
    const store = getStore();
    const index = store.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    store.users[index] = { ...store.users[index], ...updates };

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "USER_UPDATED",
      entity: "USER",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { updates },
    });

    return store.users[index];
  },

  async getWallets(): Promise<Wallet[]> {
    const store = getStore();
    return Object.values(store.wallets);
  },

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const store = getStore();
    if (!store.wallets[userId]) {
      store.wallets[userId] = {
        id: `w-${userId}`,
        userId,
        currency: "NGN",
        currentBalance: 0,
        ledgerBalance: 0,
        lockedBalance: 0,
        status: "ACTIVE",
        updatedAt: new Date().toISOString(),
      };
    }
    return store.wallets[userId];
  },

  async adjustWalletBalance(
    userId: string,
    amount: number,
    type: "CREDIT" | "DEBIT",
    description: string,
    actorId = "Admin"
  ): Promise<Wallet> {
    const store = getStore();
    const wallet = await this.getWalletByUserId(userId);

    if (type === "DEBIT" && wallet.currentBalance < amount) {
      throw new Error(`Insufficient wallet balance for debit of ₦${amount}.`);
    }

    if (type === "CREDIT") {
      wallet.currentBalance += amount;
      wallet.ledgerBalance += amount;
    } else {
      wallet.currentBalance -= amount;
      wallet.ledgerBalance -= amount;
    }
    wallet.updatedAt = new Date().toISOString();

    const ledgerId = `led-${Date.now()}`;
    store.ledgerEntries.unshift({
      id: ledgerId,
      walletId: wallet.id,
      entryType: type,
      amount,
      balanceAfter: wallet.currentBalance,
      referenceType: "ADMIN_ADJUSTMENT",
      referenceId: ledgerId,
      description: description || `Manual admin adjustment (${type})`,
      createdAt: new Date().toISOString(),
    });

    AuditService.log({
      actorName: actorId,
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: `WALLET_${type}`,
      entity: "WALLET",
      entityId: wallet.id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { userId, amount, newBalance: wallet.currentBalance, description },
    });

    return wallet;
  },

  async getProviders(): Promise<SystemProvider[]> {
    const store = getStore();
    return store.systemProviders;
  },

  async updateProvider(
    id: string,
    updates: Partial<SystemProvider>,
    actorId?: string
  ): Promise<SystemProvider | null> {
    const store = getStore();
    const index = store.systemProviders.findIndex((p) => p.id === id);
    if (index === -1) return null;

    store.systemProviders[index] = { ...store.systemProviders[index], ...updates };

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "PROVIDER_UPDATED",
      entity: "SYSTEM_PROVIDER",
      entityId: id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
    });

    return store.systemProviders[index];
  },

  async getReportsStats() {
    const store = getStore();
    const totalOrders = store.orders.length;
    const grossVolume = store.orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const activeStudents = store.enrollments.length;
    const completedStudents = store.enrollments.filter((e) => e.status === "COMPLETED").length;
    const totalProducts = store.products.length;
    const totalInventoryValuation = store.products.reduce(
      (acc, p) => acc + p.sellingPrice * p.stockQuantity,
      0
    );

    return {
      totalOrders,
      grossVolume,
      activeStudents,
      completedStudents,
      totalProducts,
      totalInventoryValuation,
      totalUsers: store.users.length,
      announcementsCount: store.announcements.length,
      auditLogsCount: store.auditLogs.length,
    };
  },

  async getSystemSettings() {
    const store = getStore();
    return store.systemSettings;
  },

  async updateSystemSettings(
    updates: Partial<PlatformStoreState["systemSettings"]>,
    actorId?: string
  ) {
    const store = getStore();
    store.systemSettings = { ...store.systemSettings, ...updates };

    AuditService.log({
      actorName: actorId || "Admin",
      actorEmail: "admin@hambaktech.com.ng",
      role: "admin",
      action: "SETTINGS_UPDATED",
      entity: "SYSTEM_SETTINGS",
      entityId: "SYS-SETTINGS",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { updates },
    });

    return store.systemSettings;
  },
};

// ============================================================================
// AUDIT SERVICE LAYER
// ============================================================================

export const AuditService = {
  log(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
    const store = getStore();
    const sanitizedMetadata = entry.metadata ? sanitizeSensitiveRecord(entry.metadata) : undefined;
    const newEntry: AuditLogEntry = {
      ...entry,
      metadata: sanitizedMetadata,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    store.auditLogs.unshift(newEntry);
    if (store.auditLogs.length > 500) {
      store.auditLogs.pop();
    }
  },

  getLogs(): AuditLogEntry[] {
    const store = getStore();
    return store.auditLogs;
  },
};

// ============================================================================
// WALLET SERVICE LAYER (Authoritative financial operations for Web & Mobile)
// ============================================================================
export const WalletService = {
  async getWallet(userId: string): Promise<Wallet> {
    const store = getStore();
    if (!store.wallets[userId]) {
      store.wallets[userId] = {
        id: `w-${userId}`,
        userId,
        currency: "NGN",
        currentBalance: 0,
        ledgerBalance: 0,
        lockedBalance: 0,
        status: "ACTIVE",
        updatedAt: new Date().toISOString(),
      };
    }
    return store.wallets[userId];
  },

  async getTransactions(userId?: string): Promise<Transaction[]> {
    const store = getStore();
    if (userId) {
      return store.transactions.filter((t) => t.userId === userId);
    }
    return store.transactions;
  },

  async getLedgerEntries(walletId?: string): Promise<WalletLedgerEntry[]> {
    const store = getStore();
    if (walletId) {
      return store.ledgerEntries.filter((l) => l.walletId === walletId);
    }
    return store.ledgerEntries;
  },

  async fundWallet(payload: {
    userId: string;
    userName: string;
    userEmail: string;
    amount: number;
    paymentMethod: "PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT" | "BANK_TRANSFER";
    reference?: string;
    description?: string;
  }): Promise<{ wallet: Wallet; transaction: Transaction }> {
    const store = getStore();
    const wallet = await this.getWallet(payload.userId);
    const amount = Number(payload.amount);
    if (amount <= 0) {
      throw new Error("Funding amount must be greater than zero");
    }

    wallet.currentBalance += amount;
    wallet.ledgerBalance += amount;
    wallet.updatedAt = new Date().toISOString();

    const txRef = payload.reference || `HT-TX-${Date.now().toString().slice(-6)}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: txRef,
      userId: payload.userId,
      userName: payload.userName,
      userEmail: payload.userEmail,
      walletId: wallet.id,
      type: "WALLET_TOPUP",
      amount,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: payload.paymentMethod,
      description: payload.description || `Wallet Top-up via ${payload.paymentMethod}`,
      createdAt: new Date().toISOString(),
    };
    store.transactions.unshift(newTx);

    store.ledgerEntries.unshift({
      id: `led-${Date.now()}`,
      walletId: wallet.id,
      entryType: "CREDIT",
      amount,
      balanceAfter: wallet.currentBalance,
      referenceType: "WALLET_FUNDING",
      referenceId: newTx.id,
      description: newTx.description,
      createdAt: new Date().toISOString(),
    });

    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: payload.userId,
      title: "Wallet Credited",
      message: `Your wallet has been credited with ₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}. New balance: ₦${wallet.currentBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}.`,
      type: "TRANSACTION",
      read: false,
      createdAt: new Date().toISOString(),
    });

    AuditService.log({
      actorName: payload.userName,
      actorEmail: payload.userEmail,
      role: "customer",
      action: "WALLET_FUNDED",
      entity: "WALLET",
      entityId: wallet.id,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { amount, method: payload.paymentMethod, reference: txRef },
    });

    return { wallet, transaction: newTx };
  },
};

// ============================================================================
// ORDER SERVICE LAYER (Unified orders for services, shop, and academy)
// ============================================================================
export const OrderService = {
  async getOrders(userId?: string, status?: OrderStatus): Promise<Order[]> {
    const store = getStore();
    let orders = store.orders;
    if (userId) {
      orders = orders.filter((o) => o.userId === userId);
    }
    if (status) {
      orders = orders.filter((o) => o.status === status);
    }
    return orders;
  },

  async getOrderById(idOrNumber: string, requestingUserId?: string, isAdmin?: boolean): Promise<Order | null> {
    const store = getStore();
    const order = store.orders.find((o) => o.id === idOrNumber || o.orderNumber === idOrNumber);
    if (!order) return null;
    if (!isAdmin && requestingUserId && order.userId !== requestingUserId) {
      throw new Error("FORBIDDEN: You are not authorized to access this order");
    }
    return order;
  },

  async createServiceOrder(payload: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    serviceCategorySlug: string;
    serviceCategoryName: string;
    serviceTitle: string;
    items: Array<{ title: string; quantity: number; unitPrice: number; serviceId?: string }>;
    paymentMethod: "WALLET" | "PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT" | "BANK_TRANSFER";
    deliveryType?: "INSTANT_DIGITAL" | "PHYSICAL_PICKUP" | "COURIER_DELIVERY" | "ONLINE_PORTAL";
    notes?: string;
  }): Promise<Order> {
    const store = getStore();
    if (!payload.items || payload.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    const totalAmount = payload.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // Process wallet deduction if requested
    if (payload.paymentMethod === "WALLET") {
      const wallet = await WalletService.getWallet(payload.userId);
      if (wallet.currentBalance < totalAmount) {
        throw new Error(
          `Insufficient wallet balance (₦${wallet.currentBalance.toLocaleString()}). Required: ₦${totalAmount.toLocaleString()}. Please fund your wallet.`
        );
      }
      wallet.currentBalance -= totalAmount;
      wallet.ledgerBalance -= totalAmount;
      wallet.updatedAt = new Date().toISOString();

      store.ledgerEntries.unshift({
        id: `led-${Date.now()}`,
        walletId: wallet.id,
        entryType: "DEBIT",
        amount: totalAmount,
        balanceAfter: wallet.currentBalance,
        referenceType: "SERVICE_PURCHASE",
        referenceId: `ord-${Date.now()}`,
        description: `Payment for ${payload.serviceTitle}`,
        createdAt: new Date().toISOString(),
      });
    }

    const orderNumber = `HT-ORD-2026-${String(store.orders.length + 1).padStart(4, "0")}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: payload.userId,
      userName: payload.userName,
      userEmail: payload.userEmail,
      userPhone: payload.userPhone,
      serviceCategorySlug: payload.serviceCategorySlug,
      serviceCategoryName: payload.serviceCategoryName,
      serviceTitle: payload.serviceTitle,
      status: "PENDING",
      paymentStatus: payload.paymentMethod === "WALLET" ? "PAID" : "PENDING",
      paymentMethod: payload.paymentMethod,
      totalAmount,
      feeAmount: 0,
      currency: "NGN",
      items: payload.items,
      statusTimeline: [
        {
          status: "PENDING",
          timestamp: new Date().toISOString(),
          note: `Service order placed via ${payload.paymentMethod}. Total: ₦${totalAmount}`,
        },
      ],
      notes: payload.notes,
      deliveryType: payload.deliveryType || "INSTANT_DIGITAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.orders.unshift(newOrder);

    store.transactions.unshift({
      id: `tx-${Date.now()}`,
      reference: `HT-TX-${Date.now().toString().slice(-6)}`,
      userId: payload.userId,
      userName: payload.userName,
      userEmail: payload.userEmail,
      type: "ORDER_PAYMENT",
      amount: totalAmount,
      fee: 0,
      currency: "NGN",
      status: payload.paymentMethod === "WALLET" ? "SUCCESSFUL" : "PENDING",
      paymentMethod: payload.paymentMethod,
      description: `Order ${orderNumber} - ${payload.serviceTitle}`,
      createdAt: new Date().toISOString(),
    });

    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: payload.userId,
      title: "Order Placed Successfully",
      message: `Your order #${orderNumber} for "${payload.serviceTitle}" has been received.`,
      type: "ORDER",
      read: false,
      createdAt: new Date().toISOString(),
    });

    AuditService.log({
      actorName: payload.userName,
      actorEmail: payload.userEmail,
      role: "customer",
      action: "ORDER_CREATED",
      entity: "ORDER",
      entityId: orderNumber,
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      metadata: { totalAmount, paymentMethod: payload.paymentMethod },
    });

    return newOrder;
  },
};

// ============================================================================
// PAYMENT SERVICE LAYER (Payment gateways & server verification)
// ============================================================================
export const PaymentService = {
  async getActiveGateways() {
    return [
      { id: "wallet", code: "WALLET", name: "HambakTech Instant Wallet", isInstant: true, feePercent: 0, active: true },
      { id: "paystack", code: "PAYSTACK", name: "Paystack (Cards, USSD, Transfer)", isInstant: true, feePercent: 1.5, active: true },
      { id: "flutterwave", code: "FLUTTERWAVE", name: "Flutterwave Multi-channel", isInstant: true, feePercent: 1.4, active: true },
      { id: "moniepoint", code: "MONIEPOINT", name: "Moniepoint Virtual Account / Transfer", isInstant: true, feePercent: 1.0, active: true },
      {
        id: "bank_transfer",
        code: "BANK_TRANSFER",
        name: "Direct Bank Transfer (Manual Verification)",
        isInstant: false,
        feePercent: 0,
        active: true,
        accountDetails: {
          bankName: "Moniepoint Microfinance Bank",
          accountNumber: "8147837664",
          accountName: "Hambaktech & Services",
        },
      },
    ];
  },

  async initializePayment(payload: {
    userId: string;
    userName: string;
    userEmail: string;
    amount: number;
    gateway: "PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT" | "WALLET" | "BANK_TRANSFER";
    purpose: "WALLET_FUNDING" | "ORDER_PAYMENT" | "ACADEMY_ENROLLMENT";
    metadata?: Record<string, unknown>;
  }) {
    const reference = `HT-PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const checkoutUrl = `https://checkout.hambaktech.com.ng/pay/${reference}`;

    return {
      reference,
      gateway: payload.gateway,
      amount: payload.amount,
      currency: "NGN",
      checkoutUrl,
      accessCode: `acc_${Math.random().toString(36).slice(2, 10)}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  },

  async verifyPayment(reference: string, userId: string) {
    const store = getStore();
    const existingTx = store.transactions.find((t) => t.reference === reference);
    if (existingTx && existingTx.status === "SUCCESSFUL") {
      return { verified: true, transaction: existingTx, message: "Payment already verified" };
    }

    return {
      verified: true,
      reference,
      userId,
      amount: existingTx?.amount || 5000,
      currency: "NGN",
      status: "SUCCESSFUL",
      verifiedAt: new Date().toISOString(),
    };
  },
};

// ============================================================================
// NOTIFICATION SERVICE LAYER (In-app, order, and broadcast notifications)
// ============================================================================
export const NotificationService = {
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const store = getStore();
    if (userId) {
      return store.notifications.filter((n) => !n.userId || n.userId === userId);
    }
    return store.notifications;
  },

  async markRead(id: string, userId?: string): Promise<boolean> {
    const store = getStore();
    const notif = store.notifications.find((n) => n.id === id && (!userId || !n.userId || n.userId === userId));
    if (!notif) return false;
    notif.read = true;
    return true;
  },

  async markAllRead(userId: string): Promise<number> {
    const store = getStore();
    let count = 0;
    for (const n of store.notifications) {
      if ((!n.userId || n.userId === userId) && !n.read) {
        n.read = true;
        count++;
      }
    }
    return count;
  },
};

// ============================================================================
// SERVICES CATALOG SERVICE LAYER (Authoritative services & dynamic pricing)
// ============================================================================
export const ServicesCatalogService = {
  async getCategories() {
    const store = getStore();
    return store.serviceCategories;
  },

  async getServices(categorySlug?: string) {
    const store = getStore();
    if (categorySlug) {
      return store.services.filter((s) => s.slug === categorySlug || s.id === categorySlug);
    }
    return store.services;
  },

  async getServiceBySlug(slug: string) {
    const store = getStore();
    return store.services.find((s) => s.slug === slug || s.id === slug) || null;
  },

  async calculatePrice(serviceIdOrSlug: string, customerTier: CustomerTierSlug = "STANDARD", quantity = 1) {
    const store = getStore();
    const service = store.services.find((s) => s.slug === serviceIdOrSlug || s.id === serviceIdOrSlug);
    const priceRule = store.pricingRules.find(
      (p) =>
        (p.id === serviceIdOrSlug || (service && p.serviceName.toLowerCase() === service.title.toLowerCase())) &&
        p.customerTier === customerTier &&
        p.isActive
    );

    const startingPriceNum = service?.startingPrice ? parseInt(service.startingPrice.replace(/[^0-9]/g, ""), 10) : 1000;
    const basePrice = priceRule ? priceRule.sellingPrice : (startingPriceNum || 1000);
    const serviceFee = priceRule ? priceRule.serviceFee : 0;
    const unitPrice = basePrice + serviceFee;
    const totalPrice = unitPrice * Math.max(1, quantity);

    return {
      serviceId: service?.id || serviceIdOrSlug,
      serviceTitle: service?.title || "Platform Service",
      customerTier,
      quantity,
      unitPrice,
      serviceFee,
      totalPrice,
      currency: "NGN",
    };
  },
};

// ============================================================================
// MOBILE SYSTEM SERVICE LAYER (System metadata, health, and mobile configuration)
// ============================================================================
export const MobileSystemService = {
  async getAppConfig() {
    const store = getStore();
    return {
      appName: "HambakTech",
      tagline: "Where Technology Meet Service",
      apiVersion: "v1",
      environment: process.env.NODE_ENV || "production",
      defaultCurrency: store.systemSettings.defaultCurrency,
      maintenanceMode: store.systemSettings.maintenanceMode,
      allowRegistration: store.systemSettings.allowRegistration,
      support: {
        email: store.systemSettings.supportEmail,
        phone: store.systemSettings.supportPhone,
        address: store.systemSettings.officeAddress,
        whatsapp: "+2348147837664",
      },
      supportedClients: ["Android", "iOS", "Web", "PWA"],
      minAndroidVersion: "8.0",
      minIosVersion: "15.0",
    };
  },

  async getHealthStatus() {
    const store = getStore();
    const dbReachable = await isDatabaseReachable();
    return {
      status: "HEALTHY",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbReachable ? "CONNECTED" : "IN_MEMORY_STORE_ACTIVE",
      version: "1.0.0-m11",
      activeUsers: store.users.length,
      activeOrders: store.orders.length,
      availableCourses: store.courses.length,
      availableProducts: store.products.length,
    };
  },
};
