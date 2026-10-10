import { NextResponse } from "next/server";

const DEFAULT_COURSES = [
  {
    id: "crs-comp-lit",
    title: "Executive Computer Literacy & Office Productivity",
    slug: "computer-literacy",
    code: "HT-ACAD-101",
    level: "Beginner",
    category: "Foundational",
    duration: "4 Weeks",
    durationWeeks: 4,
    tuitionFee: 35000,
    price: 35000,
    instructorName: "Engr. Ibrahim Hambak",
    instructorId: "inst-1",
    description: "Master Microsoft Word, Excel, PowerPoint, Google Workspace, and secure document workflows.",
    modules: [
      { id: "mod-1", title: "Computing Essentials & OS Navigation", duration: "1 Week" },
      { id: "mod-2", title: "Professional Word Processing & Typist Standards", duration: "1 Week" },
      { id: "mod-3", title: "Spreadsheets, Financial Formulas & Accounting", duration: "1 Week" },
      { id: "mod-4", title: "Executive Presentations & Cloud Collaboration", duration: "1 Week" }
    ]
  },
  {
    id: "crs-graph-brand",
    title: "Graphics Design, UI/UX & Brand Identity",
    slug: "graphics-branding",
    code: "HT-ACAD-201",
    level: "Intermediate",
    category: "Creative",
    duration: "8 Weeks",
    durationWeeks: 8,
    tuitionFee: 60000,
    price: 60000,
    instructorName: "Maryam Bello",
    instructorId: "inst-2",
    description: "Adobe Photoshop, Illustrator, CorelDraw, Figma, and commercial print production standards.",
    modules: [
      { id: "mod-1", title: "Design Principles & Color Theory", duration: "2 Weeks" },
      { id: "mod-2", title: "Vector Illustration & Logo Crafting in Illustrator", duration: "2 Weeks" },
      { id: "mod-3", title: "Raster Editing & Photo Retouching in Photoshop", duration: "2 Weeks" },
      { id: "mod-4", title: "Figma UI/UX Prototyping & Print Prepress", duration: "2 Weeks" }
    ]
  },
  {
    id: "crs-full-stack",
    title: "Full-Stack Web & Software Engineering",
    slug: "web-software-engineering",
    code: "HT-ACAD-301",
    level: "Advanced",
    category: "Engineering",
    duration: "12 Weeks",
    durationWeeks: 12,
    tuitionFee: 120000,
    price: 120000,
    instructorName: "Engr. Ibrahim Hambak",
    instructorId: "inst-1",
    description: "HTML5, CSS3, Tailwind, JavaScript, React, Node.js, PHP, PostgreSQL, Git, and Cloud deployment.",
    modules: [
      { id: "mod-1", title: "Semantic HTML5, CSS3 & Responsive Architecture", duration: "3 Weeks" },
      { id: "mod-2", title: "Modern JavaScript (ES6+), DOM & Async APIs", duration: "3 Weeks" },
      { id: "mod-3", title: "React, Next.js & State Management", duration: "3 Weeks" },
      { id: "mod-4", title: "Backend Systems, PostgreSQL, Auth & Deployment", duration: "3 Weeks" }
    ]
  },
  {
    id: "crs-data-analytics",
    title: "Data Analysis, SQL & Business Intelligence",
    slug: "data-analysis",
    code: "HT-ACAD-302",
    level: "Intermediate",
    category: "Data Science",
    duration: "10 Weeks",
    durationWeeks: 10,
    tuitionFee: 95000,
    price: 95000,
    instructorName: "Olanrewaju Davies",
    instructorId: "inst-3",
    description: "Advanced Excel, SQL data manipulation, PowerBI dashboards, and strategic business reporting.",
    modules: [
      { id: "mod-1", title: "Advanced Excel Formulas, Pivot & Power Query", duration: "2 Weeks" },
      { id: "mod-2", title: "Relational Databases & Complex SQL Querying", duration: "3 Weeks" },
      { id: "mod-3", title: "Interactive PowerBI Dashboard Development", duration: "3 Weeks" },
      { id: "mod-4", title: "Business Storytelling & Executive Reporting", duration: "2 Weeks" }
    ]
  },
  {
    id: "crs-digital-mktg",
    title: "Digital Marketing, SEO & Ads Management",
    slug: "digital-marketing",
    code: "HT-ACAD-202",
    level: "Beginner",
    category: "Marketing",
    duration: "6 Weeks",
    durationWeeks: 6,
    tuitionFee: 50000,
    price: 50000,
    instructorName: "Aisha Danjuma",
    instructorId: "inst-2",
    description: "Meta Ads, Google Search Ads, TikTok marketing, content strategy, copy crafting, and sales funnels.",
    modules: [
      { id: "mod-1", title: "Audience Profiling & High-Converting Copy", duration: "1 Week" },
      { id: "mod-2", title: "Meta Ads Manager & Pixel Architecture", duration: "2 Weeks" },
      { id: "mod-3", title: "Google Search & Performance Max Campaigns", duration: "2 Weeks" },
      { id: "mod-4", title: "Analytics, Attribution & Funnel Optimization", duration: "1 Week" }
    ]
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DEFAULT_COURSES
  });
}
