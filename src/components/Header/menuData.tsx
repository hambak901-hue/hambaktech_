import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "Services",
    newTab: false,
    submenu: [
      {
        id: 201,
        title: "All Services Overview",
        path: "/services",
        newTab: false,
      },
      {
        id: 202,
        title: "Digital Services",
        path: "/services/digital-services",
        newTab: false,
      },
      {
        id: 203,
        title: "Business Centre",
        path: "/services/business-centre",
        newTab: false,
      },
      {
        id: 204,
        title: "Printing & Documentation",
        path: "/services/printing",
        newTab: false,
      },
      {
        id: 205,
        title: "NIN Centre",
        path: "/services/nin-centre",
        newTab: false,
      },
      {
        id: 206,
        title: "VTU & Bill Payments",
        path: "/services/vtu-bill-payments",
        newTab: false,
      },
      {
        id: 207,
        title: "Business Registration (CAC)",
        path: "/services/business-registration",
        newTab: false,
      },
      {
        id: 208,
        title: "Web & Software",
        path: "/services/web-software",
        newTab: false,
      },
      {
        id: 209,
        title: "Graphics & Branding",
        path: "/services/graphics-branding",
        newTab: false,
      },
      {
        id: 210,
        title: "Academy",
        path: "/academy",
        newTab: false,
      },
    ],
  },
  {
    id: 3,
    title: "Academy",
    path: "/academy",
    newTab: false,
  },
  {
    id: 301,
    title: "Shop",
    path: "/shop",
    newTab: false,
  },
  {
    id: 302,
    title: "Verify",
    path: "/verify",
    newTab: false,
  },
  {
    id: 31,
    title: "Customer Dashboard",
    path: "/dashboard",
    newTab: false,
  },
  {
    id: 32,
    title: "Admin Portal",
    path: "/admin",
    newTab: false,
  },
  {
    id: 4,
    title: "About",
    path: "/about",
    newTab: false,
  },
  {
    id: 5,
    title: "Blog",
    path: "/blog",
    newTab: false,
  },
  {
    id: 6,
    title: "Contact",
    path: "/contact",
    newTab: false,
  },
];

export default menuData;
