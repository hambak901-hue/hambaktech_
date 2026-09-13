"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Megaphone,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  X,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { CMSAnnouncement, CMSPage, BlogPost } from "@/types/platform";

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<"announcements" | "pages" | "blog">("announcements");
  const [announcements, setAnnouncements] = useState<CMSAnnouncement[]>([]);
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // --- Announcement Modals ---
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState<CMSAnnouncement | null>(null);
  const [deletingAnn, setDeletingAnn] = useState<CMSAnnouncement | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annCategory, setAnnCategory] = useState<CMSAnnouncement["category"]>("PROMOTION");
  const [annActive, setAnnActive] = useState(true);

  // --- Page Modals ---
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [deletingPage, setDeletingPage] = useState<CMSPage | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageMeta, setPageMeta] = useState("");
  const [pagePublished, setPagePublished] = useState(true);

  // --- Blog Post Modals ---
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<BlogPost | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogSummary, setBlogSummary] = useState("");
  const [blogCategory, setBlogCategory] = useState("Identity Systems");
  const [blogAuthor, setBlogAuthor] = useState("Hambak Editorial Team");
  const [blogFeatured, setBlogFeatured] = useState(false);

  const loadCMS = () => {
    setAnnouncements([...platformApi.getCMSAnnouncements()]);
    setPages([...platformApi.getCMSPages()]);
    setPosts([...platformApi.getBlogPosts()]);
  };

  useEffect(() => {
    loadCMS();
  }, []);

  const showSuccessMessage = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // --- Announcement CRUD ---
  const openCreateAnnouncement = () => {
    setAnnTitle("");
    setAnnMessage("");
    setAnnCategory("PROMOTION");
    setAnnActive(true);
    setShowAnnModal(true);
  };

  const openEditAnnouncement = (a: CMSAnnouncement) => {
    setEditingAnn(a);
    setAnnTitle(a.title);
    setAnnMessage(a.message);
    setAnnCategory(a.category);
    setAnnActive(a.isActive);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    platformApi.createAnnouncement(annTitle.trim(), annMessage.trim(), annCategory);
    setShowAnnModal(false);
    showSuccessMessage("Announcement created successfully.");
    loadCMS();
  };

  const handleUpdateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn) return;

    platformApi.updateAnnouncement(editingAnn.id, {
      title: annTitle.trim(),
      message: annMessage.trim(),
      category: annCategory,
      isActive: annActive,
    });
    setEditingAnn(null);
    showSuccessMessage(`Announcement "${annTitle}" updated.`);
    loadCMS();
  };

  const handleDeleteAnnouncement = () => {
    if (!deletingAnn) return;
    platformApi.deleteAnnouncement(deletingAnn.id);
    setDeletingAnn(null);
    showSuccessMessage("Announcement removed.");
    loadCMS();
  };

  const handleToggleAnnouncement = (id: string, active: boolean) => {
    platformApi.toggleAnnouncement(id, !active);
    loadCMS();
  };

  // --- Page CRUD ---
  const openCreatePage = () => {
    setPageTitle("");
    setPageSlug("");
    setPageMeta("");
    setPagePublished(true);
    setShowPageModal(true);
  };

  const openEditPage = (p: CMSPage) => {
    setEditingPage(p);
    setPageTitle(p.title);
    setPageSlug(p.slug);
    setPageMeta(p.metaDescription);
    setPagePublished(p.published);
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim() || !pageSlug.trim()) return;

    platformApi.createCMSPage({
      title: pageTitle.trim(),
      slug: pageSlug.trim().toLowerCase().replace(/^\//, ""),
      metaDescription: pageMeta.trim(),
      published: pagePublished,
    });
    setShowPageModal(false);
    showSuccessMessage(`Page /${pageSlug} created.`);
    loadCMS();
  };

  const handleUpdatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    platformApi.updateCMSPage(editingPage.id, {
      title: pageTitle.trim(),
      slug: pageSlug.trim().toLowerCase().replace(/^\//, ""),
      metaDescription: pageMeta.trim(),
      published: pagePublished,
    });
    setEditingPage(null);
    showSuccessMessage(`Page /${pageSlug} updated.`);
    loadCMS();
  };

  const handleDeletePage = () => {
    if (!deletingPage) return;
    platformApi.deleteCMSPage(deletingPage.id);
    setDeletingPage(null);
    showSuccessMessage(`Page /${deletingPage.slug} deleted.`);
    loadCMS();
  };

  // --- Blog Post CRUD ---
  const openCreateBlog = () => {
    setBlogTitle("");
    setBlogSlug("");
    setBlogSummary("");
    setBlogCategory("Identity Systems");
    setBlogAuthor("Hambak Editorial Team");
    setBlogFeatured(false);
    setShowBlogModal(true);
  };

  const openEditBlog = (b: BlogPost) => {
    setEditingBlog(b);
    setBlogTitle(b.title);
    setBlogSlug(b.slug);
    setBlogSummary(b.summary);
    setBlogCategory(b.category);
    setBlogAuthor(b.author);
    setBlogFeatured(b.featured);
  };

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogSlug.trim()) return;

    platformApi.createBlogPost({
      title: blogTitle.trim(),
      slug: blogSlug.trim().toLowerCase().replace(/^\//, ""),
      summary: blogSummary.trim(),
      category: blogCategory.trim(),
      author: blogAuthor.trim(),
      featured: blogFeatured,
    });
    setShowBlogModal(false);
    showSuccessMessage(`Article "${blogTitle}" published.`);
    loadCMS();
  };

  const handleUpdateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    platformApi.updateBlogPost(editingBlog.id, {
      title: blogTitle.trim(),
      slug: blogSlug.trim().toLowerCase().replace(/^\//, ""),
      summary: blogSummary.trim(),
      category: blogCategory.trim(),
      author: blogAuthor.trim(),
      featured: blogFeatured,
    });
    setEditingBlog(null);
    showSuccessMessage(`Article "${blogTitle}" updated.`);
    loadCMS();
  };

  const handleDeleteBlog = () => {
    if (!deletingBlog) return;
    platformApi.deleteBlogPost(deletingBlog.id);
    setDeletingBlog(null);
    showSuccessMessage(`Article deleted.`);
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
          title="Click to toggle banner visibility"
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
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openEditAnnouncement(a)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit Announcement"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingAnn(a)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Announcement"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
          <span className="text-[11px] text-body-color line-clamp-1">{p.metaDescription}</span>
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
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
          p.published
            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
            : "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.published ? "bg-emerald-500" : "bg-gray-400"}`} />
          {p.published ? "Published" : "Draft"}
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
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/${p.slug}`}
            target="_blank"
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-primary transition"
            title="Visit Page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => openEditPage(p)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit Page"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingPage(p)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Page"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openEditBlog(b)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit Article"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingBlog(b)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Article"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
            onClick={openCreateAnnouncement}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        ) : activeTab === "pages" ? (
          <button
            type="button"
            onClick={openCreatePage}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openCreateBlog}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </button>
        )
      }
    >
      <div className="space-y-6">
        {/* Action feedback */}
        {actionFeedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionFeedback}</span>
          </div>
        )}

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
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Publish New Announcement</h3>
                    <p className="text-xs text-body-color">Displayed on customer dashboard & top notifications</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
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
                    placeholder="e.g. Visit our office for free verification and guidance on CAC & NIN applications."
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

        {/* Edit Announcement Modal */}
        {editingAnn && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit Announcement</h3>
                    <p className="text-xs text-body-color">Modify banner headline and status</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateAnnouncement} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Category Tag
                  </label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="PROMOTION">PROMOTION</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="GENERAL">GENERAL</option>
                    <option value="ALERT">ALERT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Headline</label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Message</label>
                  <textarea
                    rows={3}
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editAnnActiveCheckbox"
                    checked={annActive}
                    onChange={(e) => setAnnActive(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="editAnnActiveCheckbox" className="text-xs font-medium text-dark dark:text-white cursor-pointer">
                    Live Banner (Active on Website)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingAnn(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Announcement Modal */}
        {deletingAnn && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Announcement</h3>
                  <p className="text-xs text-body-color">Removal of promotional banner</p>
                </div>
              </div>
              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete announcement &ldquo;<strong className="text-dark dark:text-white">{deletingAnn.title}</strong>&rdquo;?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingAnn(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAnnouncement}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Page Modal */}
        {showPageModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Create New Page</h3>
                    <p className="text-xs text-body-color">Add a dynamic content route</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPageModal(false)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePage} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Page Title *</label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="e.g. Terms & Privacy Policy"
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Route Slug *</label>
                  <input
                    type="text"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                    placeholder="e.g. privacy-policy"
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">SEO Meta Description</label>
                  <textarea
                    rows={3}
                    value={pageMeta}
                    onChange={(e) => setPageMeta(e.target.value)}
                    placeholder="Brief description for search engines and social cards..."
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="createPagePubCheckbox"
                    checked={pagePublished}
                    onChange={(e) => setPagePublished(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="createPagePubCheckbox" className="text-xs font-medium text-dark dark:text-white cursor-pointer">
                    Publish immediately (Visible publicly)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setShowPageModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Create Page
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Page Modal */}
        {editingPage && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit Page</h3>
                    <p className="text-xs text-body-color">/{editingPage.slug}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdatePage} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Page Title *</label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Route Slug *</label>
                  <input
                    type="text"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Meta Description</label>
                  <textarea
                    rows={3}
                    value={pageMeta}
                    onChange={(e) => setPageMeta(e.target.value)}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editPagePubCheckbox"
                    checked={pagePublished}
                    onChange={(e) => setPagePublished(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="editPagePubCheckbox" className="text-xs font-medium text-dark dark:text-white cursor-pointer">
                    Published
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Page Modal */}
        {deletingPage && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Page</h3>
                  <p className="text-xs text-body-color">Permanently remove route</p>
                </div>
              </div>
              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete page &ldquo;<strong className="text-dark dark:text-white">/{deletingPage.slug}</strong>&rdquo;?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPage(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePage}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Blog Post Modal */}
        {showBlogModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Write New Article</h3>
                    <p className="text-xs text-body-color">Publish educational guide or blog post</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBlog} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Article Title *</label>
                  <input
                    type="text"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="e.g. Ultimate Guide to CAC Registration in Nigeria"
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Article Slug *</label>
                  <input
                    type="text"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    placeholder="e.g. ultimate-guide-to-cac-registration"
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Summary / Excerpt *</label>
                  <textarea
                    rows={3}
                    value={blogSummary}
                    onChange={(e) => setBlogSummary(e.target.value)}
                    placeholder="Key takeaways and summary for users..."
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Category</label>
                    <input
                      type="text"
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Author</label>
                    <input
                      type="text"
                      value={blogAuthor}
                      onChange={(e) => setBlogAuthor(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="createBlogFeatCheckbox"
                    checked={blogFeatured}
                    onChange={(e) => setBlogFeatured(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="createBlogFeatCheckbox" className="text-xs font-medium text-dark dark:text-white cursor-pointer">
                    Mark as Featured Article
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setShowBlogModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Publish Article
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Blog Post Modal */}
        {editingBlog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit Article</h3>
                    <p className="text-xs text-body-color">{editingBlog.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateBlog} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Article Title *</label>
                  <input
                    type="text"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Article Slug *</label>
                  <input
                    type="text"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Summary *</label>
                  <textarea
                    rows={3}
                    value={blogSummary}
                    onChange={(e) => setBlogSummary(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Category</label>
                    <input
                      type="text"
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Author</label>
                    <input
                      type="text"
                      value={blogAuthor}
                      onChange={(e) => setBlogAuthor(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editBlogFeatCheckbox"
                    checked={blogFeatured}
                    onChange={(e) => setBlogFeatured(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="editBlogFeatCheckbox" className="text-xs font-medium text-dark dark:text-white cursor-pointer">
                    Featured Article
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingBlog(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Blog Modal */}
        {deletingBlog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Article</h3>
                  <p className="text-xs text-body-color">Removal of published article</p>
                </div>
              </div>
              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete article &ldquo;<strong className="text-dark dark:text-white">{deletingBlog.title}</strong>&rdquo;?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingBlog(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBlog}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

