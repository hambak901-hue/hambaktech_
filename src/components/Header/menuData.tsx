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

export const PUBLIC_NAVIGATION = menuData;

export const AUTHENTICATED_NAVIGATION: Menu[] = [
  { id: 101, title: "Overview", path: "/dashboard", newTab: false },
  { id: 102, title: "My Wallet", path: "/dashboard/wallet", newTab: false },
  { id: 103, title: "Orders", path: "/dashboard/orders", newTab: false },
  { id: 104, title: "Services", path: "/dashboard/services", newTab: false },
  { id: 105, title: "NIN Centre", path: "/dashboard/nin", newTab: false },
  { id: 106, title: "CAC Desk", path: "/dashboard/cac", newTab: false },
  { id: 107, title: "Academy", path: "/dashboard/academy", newTab: false },
  { id: 108, title: "Support", path: "/dashboard/support", newTab: false },
  { id: 109, title: "Profile", path: "/dashboard/profile", newTab: false },
];

export const ADMIN_NAVIGATION: Menu[] = [
  { id: 201, title: "Command Centre", path: "/admin", newTab: false },
  { id: 202, title: "Users & Accounts", path: "/admin/users", newTab: false },
  { id: 203, title: "Orders & Fulfillment", path: "/admin/orders", newTab: false },
  { id: 204, title: "Wallets & Ledger", path: "/admin/wallets", newTab: false },
  { id: 205, title: "Payments", path: "/admin/payments", newTab: false },
  { id: 206, title: "NIN Operations", path: "/admin/nin", newTab: false },
  { id: 207, title: "CAC Filings", path: "/admin/cac", newTab: false },
  { id: 208, title: "Services Catalog", path: "/admin/services", newTab: false },
  { id: 209, title: "Academy Admin", path: "/admin/academy", newTab: false },
  { id: 210, title: "Shop & Stock", path: "/admin/shop", newTab: false },
  { id: 211, title: "CMS & Pages", path: "/admin/cms", newTab: false },
  { id: 212, title: "System Settings", path: "/admin/settings", newTab: false },
  { id: 213, title: "Audit Trail", path: "/admin/audit-logs", newTab: false },
];

export default menuData;
