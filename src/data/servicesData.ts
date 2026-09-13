import { ServiceCategory } from "@/types/service";

export const servicesData: ServiceCategory[] = [
  {
    id: "digital-services",
    slug: "digital-services",
    title: "Digital Services",
    shortDescription:
      "Comprehensive digital assistance, online portal applications, document digitization, and technical support for individuals and businesses.",
    fullDescription:
      "HambakTech delivers hands-on digital assistance to help individuals and businesses navigate modern technology. From online government portal submissions and academic registrations to format conversion and software setup, we ensure seamless execution with accuracy and confidentiality.",
    iconName: "Laptop",
    status: "available",
    onlineAvailability: "Physical Walk-in & Online",
    features: [
      "Online portal registrations (JAMB, WAEC, NECO, civil service portals)",
      "Document format conversions (PDF, Word, OCR text extraction)",
      "Digital forms processing and e-affidavit filing assistance",
      "Email setup, cloud backup, and basic cybersecurity guidance",
      "Software installation and office application assistance",
    ],
    deliverables: [
      "Completed and verified online submissions with print receipts",
      "Digitized documents formatted to regulatory portal standards",
      "Technical guidance and setup documentation",
    ],
    requirements: [
      "Valid identification (where required by third-party portal)",
      "Source documents or credentials for registration",
    ],
    targetAudience:
      "Students, job applicants, individual professionals, and small business owners.",
    estimatedProcessingTime: "Same-day service for standard portal requests.",
    ctaText: "Request Digital Service",
    ctaLink: "/contact?service=digital-services",
    featured: true,
  },
  {
    id: "business-centre",
    slug: "business-centre",
    title: "Business Centre",
    shortDescription:
      "Essential daily office, clerical, and secretarial operations: high-speed photocopying, typing, high-res scanning, lamination, and spiral binding.",
    fullDescription:
      "Our physical business centre in Ibeju-Lekki is fully equipped to handle all your daily documentation requirements. We provide high-speed copying, professional typing, crisp scanning, thermal lamination, and comb/spiral binding to present your documents in pristine quality.",
    iconName: "Printer",
    status: "available",
    onlineAvailability: "Physical Walk-in & Online",
    features: [
      "High-speed monochrome and full-color photocopying",
      "Professional secretarial typing, transcription, and document formatting",
      "High-resolution document scanning to email, flash drive, or cloud",
      "Protective thermal lamination up to A3 size",
      "Spiral and comb binding for reports, projects, and proposals",
    ],
    deliverables: [
      "Crisp, clear physical copies and bound documents",
      "Digital scans delivered directly to your device or email",
      "Proofread and neatly formatted digital files",
    ],
    requirements: [
      "Original documents for copying, scanning, or binding",
      "Draft manuscripts or audio for typing and transcription",
    ],
    targetAudience:
      "Local residents, professionals, students, contractors, and corporate offices.",
    estimatedProcessingTime: "Instant while-you-wait service in our centre.",
    ctaText: "Visit Business Centre",
    ctaLink: "/contact",
    featured: true,
  },
  {
    id: "printing",
    slug: "printing",
    title: "Printing & Documentation",
    shortDescription:
      "Commercial-grade digital printing, business stationery, marketing collaterals, customized business cards, letterheads, and banners.",
    fullDescription:
      "Whether you need corporate stationery, marketing collaterals, or high-volume report printing, HambakTech provides dependable print solutions. We utilize quality paper stock, vibrant color calibration, and careful finishing to elevate your brand's physical presence.",
    iconName: "FileText",
    status: "available",
    onlineAvailability: "Physical Walk-in & Online",
    features: [
      "High-volume document and project printing",
      "Custom business cards with matte or gloss finishing",
      "Official corporate letterheads and branded envelopes",
      "Duplicate and triplicate customized invoice/receipt booklets",
      "Event programs, brochures, flyers, and roll-up banners",
    ],
    deliverables: [
      "Commercially printed and neatly trimmed physical materials",
      "Print-ready proof files for customer sign-off prior to production",
    ],
    requirements: [
      "Print-ready artwork (PDF/PNG/CorelDraw) or brief for design",
      "Quantity and paper weight/finishing specifications",
    ],
    targetAudience:
      "Enterprises, schools, churches, event planners, and retail merchants.",
    estimatedProcessingTime: "1–3 business days depending on volume and finishing.",
    ctaText: "Request Print Quote",
    ctaLink: "/contact?service=printing",
    featured: true,
  },
  {
    id: "nin-centre",
    slug: "nin-centre",
    title: "NIN Centre",
    shortDescription:
      "Dedicated assistance with National Identification Number (NIN) enrollment guidelines, slip retrieval, data validation, and modification requests.",
    fullDescription:
      "Navigating identity services requires care and adherence to regulatory standards. HambakTech's NIN support desk assists citizens and residents with proper documentation pre-checks, slip retrieval guidance, and formal modification procedures in coordination with accredited identity processing channels.",
    iconName: "ShieldCheck",
    status: "available",
    onlineAvailability: "Physical Walk-in & Online",
    features: [
      "Pre-enrollment guidance and document verification checklist",
      "NIN slip verification and plastic ID card printing support",
      "Guidance on name, date of birth, and phone number modification procedures",
      "BVN-NIN harmonization verification assistance",
      "Safe, secure, and confidential handling of personal identification data",
    ],
    deliverables: [
      "Verified standard NIN slip or durable laminated/plastic identity card",
      "Regulatory submission tracking information for modification cases",
    ],
    requirements: [
      "Valid supporting documents (Birth Certificate, Declaration of Age, BVN, Voter's Card, or Passport)",
      "Physical biometric presence at accredited terminal",
    ],
    targetAudience:
      "Citizens, students, civil servants, and business operators needing identity compliance.",
    estimatedProcessingTime: "Same-day assistance for slip retrieval; variable for official modifications.",
    ctaText: "Check NIN Requirements",
    ctaLink: "/services/nin-centre",
    featured: true,
  },
  {
    id: "vtu-bill-payments",
    slug: "vtu-bill-payments",
    title: "VTU & Bill Payments",
    shortDescription:
      "Instant telecom airtime, data bundles, electricity DISCO token recharging, and cable TV subscription renewals.",
    fullDescription:
      "Stay connected seamlessly. HambakTech provides reliable airtime and high-speed data top-ups for all major Nigerian telecommunication networks, alongside convenient utility token recharge (IKEDC, EKEDC, etc.) and cable TV subscription renewals (DSTV, GOtv, Startimes).",
    iconName: "Smartphone",
    status: "coming_soon",
    onlineAvailability: "Coming Soon",
    features: [
      "MTN, Airtel, Glo, and 9mobile airtime and data subscriptions",
      "Prepaid & postpaid electricity bill payments (EKEDC, IKEDC, AEDC, and others)",
      "Cable TV recharges (DSTV, GOtv, StarTimes) with instant account reactivation",
      "Automated wallet-based recharging (Under development for v1.0 platform)",
      "Instant SMS/Email receipt confirmation",
    ],
    deliverables: [
      "Instant electronic recharge confirmation and transaction token receipts",
    ],
    requirements: [
      "Meter number (for electricity), Smartcard/IUC number (for cable TV), or phone number",
    ],
    targetAudience:
      "Households, businesses, mobile professionals, and community residents.",
    estimatedProcessingTime: "Instant delivery upon payment processing.",
    ctaText: "Join Waitlist / Inquire",
    ctaLink: "/contact?service=vtu",
    featured: true,
  },
  {
    id: "business-registration",
    slug: "business-registration",
    title: "Business Registration (CAC)",
    shortDescription:
      "Expert assistance with Corporate Affairs Commission (CAC) business name registration, limited liability company incorporation, and post-incorporation filings.",
    fullDescription:
      "Formalize your business legally and build trust with customers and banks. HambakTech provides structured guidance through the Corporate Affairs Commission (CAC) portal: name availability search, object drafting, Director/Proprietor documentation, and retrieval of status reports and certificates.",
    iconName: "Building2",
    status: "available",
    onlineAvailability: "Online Request",
    features: [
      "Comprehensive CAC name availability search and reservation",
      "Business Name (Enterprise) registration documentation assistance",
      "Private Limited Liability Company (Ltd) incorporation guidance",
      "Incorporated Trustee and NGO registration advisory",
      "Tax Identification Number (TIN) linkage and post-incorporation filing support",
    ],
    deliverables: [
      "Official CAC Registration Certificate",
      "Certified Status Report / Application details",
      "Tax Identification Number (TIN)",
    ],
    requirements: [
      "Proposed business names (2 options)",
      "Valid government-issued ID (NIN/Passport/Voter's card) of proprietor/directors",
      "Passport photographs and signature specimens",
      "Business address, phone number, and email address",
    ],
    targetAudience:
      "Entrepreneurs, startups, artisans, e-commerce vendors, and expanding enterprises.",
    estimatedProcessingTime: "3–7 business days depending on CAC portal approval cycles.",
    ctaText: "Start CAC Registration",
    ctaLink: "/services/business-registration",
    featured: true,
  },
  {
    id: "web-software",
    slug: "web-software",
    title: "Web & Software Solutions",
    shortDescription:
      "Modern corporate websites, custom web applications, e-commerce storefronts, domain registration, and cloud hosting management.",
    fullDescription:
      "Elevate your brand with high-performance, mobile-responsive web technology. HambakTech designs and develops fast, secure web platforms, custom portals, and content management systems tailored to your operational workflows.",
    iconName: "Globe",
    status: "available",
    onlineAvailability: "Online Request",
    features: [
      "Responsive corporate websites and portfolio showcases",
      "Custom business portals, booking systems, and customer dashboards",
      "E-commerce storefronts with payment gateway integrations",
      "Domain registration (.com, .ng, .com.ng) and business email configuration",
      "Search engine optimization (SEO) and web performance tuning",
    ],
    deliverables: [
      "Fully responsive, production-ready website or web application",
      "Corporate email accounts (e.g., info@yourcompany.com.ng)",
      "Admin dashboard access and staff handover training",
    ],
    requirements: [
      "Project requirements brief and brand assets (logo, content, color palette)",
      "Scope discussion and milestone agreement",
    ],
    targetAudience:
      "Corporates, educational institutions, retail merchants, and technology startups.",
    estimatedProcessingTime: "1–4 weeks based on project complexity and scope.",
    ctaText: "Request Web Consultation",
    ctaLink: "/contact?service=web-software",
    featured: true,
  },
  {
    id: "graphics-branding",
    slug: "graphics-branding",
    title: "Graphics & Brand Identity",
    shortDescription:
      "Memorable visual identity design, corporate logos, social media graphics, product labels, marketing collaterals, and company profiles.",
    fullDescription:
      "A cohesive visual identity creates instant trust. Our creative design team crafts distinctive logos, brand style guidelines, marketing banners, and print-ready assets that clearly express your value proposition to customers.",
    iconName: "Palette",
    status: "available",
    onlineAvailability: "Online Request",
    features: [
      "Custom corporate logo design and vector identity marks",
      "Brand identity style guides (typography, color palettes, usage rules)",
      "Social media design packs (templates for Instagram, LinkedIn, Facebook)",
      "Company profile documents, capability brochures, and annual reports",
      "Packaging, product labels, and promotional merchandise design",
    ],
    deliverables: [
      "High-resolution vector files (AI, EPS, SVG, PDF, PNG, JPG)",
      "Comprehensive brand guidelines booklet",
      "Print-ready and web-optimized graphic formats",
    ],
    requirements: [
      "Creative brief detailing company mission, target market, and design preferences",
    ],
    targetAudience:
      "Growing businesses, emerging brands, event organizers, and content creators.",
    estimatedProcessingTime: "3–5 business days for standard branding packages.",
    ctaText: "Request Branding Package",
    ctaLink: "/contact?service=graphics-branding",
    featured: true,
  },
  {
    id: "academy",
    slug: "academy",
    title: "HambakTech Academy",
    shortDescription:
      "Practical ICT training, digital literacy skills, executive computer packages, web development foundations, and graphics design.",
    fullDescription:
      "Empowering youth, students, and working professionals with in-demand practical digital skills. HambakTech Academy provides structured, hands-on training in basic-to-advanced computing, productivity software, programming foundations, and digital design.",
    iconName: "GraduationCap",
    status: "available",
    onlineAvailability: "Physical Walk-in & Online",
    features: [
      "Executive Computer Literacy (Windows, Microsoft Word, Excel, PowerPoint)",
      "Graphic Design Fundamentals (Photoshop, CorelDraw, Illustrator, Canva)",
      "Web Development Essentials (HTML5, CSS3, JavaScript, modern frameworks)",
      "Data Analysis Fundamentals (Advanced Excel, spreadsheets, reporting)",
      "Hands-on practical lab sessions with experienced instructors",
    ],
    deliverables: [
      "Practical course curriculum materials and real-world project portfolios",
      "Official Certificate of Completion upon assessment",
    ],
    requirements: [
      "Completed registration form and passion for digital literacy",
      "Laptop recommended (desktop workstations available in our lab)",
    ],
    targetAudience:
      "Secondary school leavers, undergraduates, job seekers, and business owners.",
    estimatedProcessingTime: "Cohort-based: 4-week, 8-week, and 12-week modular programs.",
    ctaText: "Explore Academy Courses",
    ctaLink: "/academy",
    featured: true,
  },
];
