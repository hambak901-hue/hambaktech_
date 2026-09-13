"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Megaphone,
  BookOpen,
  HelpCircle,
  Plus,
  Eye,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { CMSAnnouncement, CMSPage, BlogPost } from "@/types/platform";

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<"announcements" | "pages" | "blog" | "faqs">("announcements");
  const [announcements, setAnnouncements] = useState<CMSAnnouncement[]>([]);
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  // Create Announcement Modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annCategory, setAnnCategory] = useState<CMSAnnouncement["category"]>("PROMOTION");

  const loadCMS = () => {
    setAnnouncements([...platformApi.getCMSAnnouncements()]);
    setPages([...platformApi.getCMSPages()]);
    setPosts([...platformApi.getBlogPosts()]);
  };

  useEffect(() => {
    loadCMS();
  }, []);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    platformApi.createAnnouncement(annTitle.trim(), annMessage.trim(), annCategory);
    setShowAnnModal(false);
    setAnnTitle("");
    setAnnMessage("");
    loadCMS();
  };

  const handleToggleAnnouncement = (id: string, active: boolean) => {
    platformApi.toggleAnnouncement(id, !active);
    loadCMS();
  };

  const handleDeleteAnnouncement = (id: string) => {
    platformApi.deleteAnnouncement(id);
    loadCMS();
  };

  // --- Announcements Columns ---
  const announcementColumns: Column<CMSAnnouncement>[] = [
    {
      key: "title",
      header: "Announcement Headline",
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-bold text-dark dark:text-white text-xs block">{a.title}</span>
          <span className="text-[11px] text-body-color line-clamp-1">{a.message}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Display Category",
      sortable: true,
      render: (a) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">
          {a.category}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Banner Status",
      sortable: true,
      render: (a) => (
        <button
          type="button"
          onClick={() => handleToggleAnnouncement(a.id, a.isActive)}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition ${
            a.isActive
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {a.isActive ? "Live on Site" : "Draft / Paused"}
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Date Posted",
      sortable: true,
      render: (a) => (
        <span className="text-xs text-body-color">
          {new Date(a.createdAt).toLocaleDateString("en-NG")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (a) => (
        <button
          type="button"
          onClick={() => handleDeleteAnnouncement(a.id)}
          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          title="Delete Announcement"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  // --- Pages Columns ---
  const pageColumns: Column<CMSPage>[] = [
    {
      key: "title",
      header: "Page Title",
      sortable: true,
      render: (p) => (
        <div>
          <span className="font-bold text-dark dark:text-white text-xs block">{p.title}</span>
          <span className="text-[11px] text-body-color">{p.metaDescription}</span>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Route Path",
      render: (p) => <span className="font-mono text-xs text-primary">/{p.slug}</span>,
    },
    {
      key: "published",
      header: "Publish State",
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Published
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Modified",
      render: (p) => (
        <span className="text-xs text-body-color">
          {new Date(p.updatedAt).toLocaleDateString("en-NG")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "View",
      align: "right",
      render: (p) => (
        <Link
          href={`/${p.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
        >
          <span>Visit</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  // --- Blog Posts Columns ---
  const blogColumns: Column<BlogPost>[] = [
    {
      key: "title",
      header: "Article Title",
      sortable: true,
      render: (b) => (
        <div>
          <span className="font-bold text-dark dark:text-white text-xs block">{b.title}</span>
          <span className="text-[11px] text-body-color line-clamp-1">{b.summary}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (b) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {b.category}
        </span>
      ),
    },
    {
      key: "author",
      header: "Author",
      render: (b) => <span className="text-xs font-semibold text-dark dark:text-white">{b.author}</span>,
    },
    {
      key: "featured",
      header: "Featured",
      render: (b) => (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
          b.featured ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-body-color"
        }`}>
          {b.featured ? "Featured" : "Standard"}
        </span>
      ),
    },
    {
      key: "publishedAt",
      header: "Published",
      sortable: true,
      render: (b) => (
        <span className="text-xs text-body-color">
          {new Date(b.publishedAt).toLocaleDateString("en-NG")}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout
      pageTitle="Content Management System (CMS)"
      breadcrumbs={[{ label: "CMS & Content" }]}
      actionButton={
        activeTab === "announcements" ? (
          <button
            type="button"
            onClick={() => setShowAnnModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Sub-Nav Tabs */}
        <div className="flex items-center gap-2 border-b border-stroke dark:border-strokedark pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("announcements")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === "announcements"
                ? "bg-primary text-white shadow-sm"
                : "text-body-color hover:text-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements & Banners ({announcements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pages")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === "pages"
                ? "bg-primary text-white shadow-sm"
                : "text-body-color hover:text-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Published Pages ({pages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("blog")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === "blog"
                ? "bg-primary text-white shadow-sm"
                : "text-body-color hover:text-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Blog & Educational Articles ({posts.length})</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === "announcements" && (
          <AdminDataTable
            columns={announcementColumns}
            data={announcements}
            searchPlaceholder="Search announcements..."
            searchKeys={["title", "message", "category"]}
            emptyTitle="No announcements created"
            emptyDescription="Create a promotional or operational alert banner to show across the portal."
          />
        )}

        {activeTab === "pages" && (
          <AdminDataTable
            columns={pageColumns}
            data={pages}
            searchPlaceholder="Search pages..."
            searchKeys={["title", "slug", "metaDescription"]}
            emptyTitle="No pages found"
          />
        )}

        {activeTab === "blog" && (
          <AdminDataTable
            columns={blogColumns}
            data={posts}
            searchPlaceholder="Search articles..."
            searchKeys={["title", "summary", "category", "author"]}
            emptyTitle="No articles found"
          />
        )}

        {/* Create Announcement Modal */}
        {showAnnModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Publish New Announcement</h3>
                  <p className="text-xs text-body-color">Displayed on customer dashboard & top notifications</p>
                </div>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Category Tag
                  </label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as CMSAnnouncement["category"])}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="PROMOTION">PROMOTION (Special Offer / Discount)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Provider Downtime / Notice)</option>
                    <option value="GENERAL">GENERAL (Company Update)</option>
                    <option value="ALERT">ALERT (Security / Priority Notice)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. Free NIN Consultation Week at Ibeju-Lekki Hub"
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Announcement Message
                  </label>
                  <textarea
                    rows={3}
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    placeholder="e.g. Visit our Origanrigan office for free verification and guidance on CAC & NIN applications."
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAnnModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Save & Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
