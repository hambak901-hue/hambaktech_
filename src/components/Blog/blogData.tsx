import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "Essential Checklist for Registering Your Business Name with CAC in Nigeria",
    paragraph:
      "A clear step-by-step breakdown of requirements, name reservation guidelines, and post-incorporation document retrieval for Nigerian entrepreneurs.",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "HambakTech Editorial Desk",
      image: "/images/blog/author-01.png",
      designation: "Corporate Services",
    },
    tags: ["cac-registration", "business"],
    publishDate: "2026",
  },
  {
    id: 2,
    title: "Why Hands-On Computer Lab Training Outperforms Theory-Only Courses",
    paragraph:
      "How practical, instructor-guided computer practice equips students with the exact productivity and design skills demanded by modern employers.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "HambakTech Academy",
      image: "/images/blog/author-02.png",
      designation: "Education Lead",
    },
    tags: ["ict-training", "academy"],
    publishDate: "2026",
  },
  {
    id: 3,
    title: "The Hybrid Service Centre: Bridging Walk-in Support with Digital Platforms",
    paragraph:
      "How physical neighborhood hubs in Lagos are evolving to provide seamless digital tracking, cloud storage, and automated customer order fulfillment.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "HambakTech Insights",
      image: "/images/blog/author-03.png",
      designation: "Digital Solutions",
    },
    tags: ["technology", "digital-platform"],
    publishDate: "2026",
  },
];

export default blogData;
