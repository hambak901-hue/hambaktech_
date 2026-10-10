"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Search,
  ExternalLink,
  Edit2,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

interface HomepageSection {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  order: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
}

interface HomepageConfig {
  hero: {
    badge: string;
    heading: string;
    subheading: string;
    primaryCta: { text: string; href: string };
    secondaryCta: { text: string; href: string };
    status: "PUBLISHED" | "DRAFT";
  };
  sections: HomepageSection[];
  seo: {
    title: string;
    metaDescription: string;
    keywords: string;
  };
}

export default function AdminHomepagePage() {
  const [config, setConfig] = useState<HomepageConfig>({
    hero: {
      badge: "Physical Hub + Smart Digital Portal",
      heading: "Where Technology Meets Real-World Service",
      subheading: "Ibeju-Lekki business-centre operations, CAC corporate registration, ICT training academy, and enterprise computing.",
      primaryCta: { text: "Explore All Services", href: "/services" },
      secondaryCta: { text: "Academy Programs", href: "/academy" },
      status: "PUBLISHED",
    },
    sections: [
      { id: "sec-services", name: "Services Hub", type: "services", enabled: true, order: 1, status: "PUBLISHED" },
      { id: "sec-academy", name: "ICT Academy Programs", type: "academy", enabled: true, order: 2, status: "PUBLISHED" },
      { id: "sec-shop", name: "Stationery & Tech Store", type: "shop", enabled: true, order: 3, status: "PUBLISHED" },
      { id: "sec-announcements", name: "Public Bulletins & Notices", type: "announcements", enabled: true, order: 4, status: "PUBLISHED" },
      { id: "sec-contact", name: "Business Centre Desk & Location", type: "contact", enabled: true, order: 5, status: "PUBLISHED" },
    ],
    seo: {
      title: "HambakTech — Where Technology Meet Service | Smart Digital Platform",
      metaDescription: "Official website of HambakTech & Services. Combining physical business-centre operations, CAC registration, ICT academy, and modern digital platform solutions in Ibeju-Lekki, Lagos.",
      keywords: "business centre lagos, CAC registration, ICT training, NIN registration, computer services ibeju lekki",
    },
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/admin/cms/homepage"), {
      headers: getAuthHeaders(),
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.hero) {
          setConfig(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...config.sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    newSections.forEach((sec, idx) => {
      sec.order = idx + 1;
    });

    setConfig({ ...config, sections: newSections });
  };

  const toggleSectionEnabled = (index: number) => {
    const newSections = [...config.sections];
    newSections[index].enabled = !newSections[index].enabled;
    setConfig({ ...config, sections: newSections });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/admin/cms/homepage"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(config),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: "Homepage hero, section hierarchy, and SEO saved successfully." });
      } else {
        setFeedback({ type: "error", message: json.message || "Failed to update homepage configuration." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error occurred while saving." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <AdminLayout
      pageTitle="Super Admin Homepage Control Centre"
      breadcrumbs={[{ label: "Super Admin" }, { label: "Homepage Control" }]}
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-6xl">
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Section 1: Hero Banner CRUD */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Hero Showcase Control</h3>
                <p className="text-xs text-body-color">The authoritative top headline, badges, and call-to-actions on the public homepage</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-body-color">Hero Status:</span>
              <select
                value={config.hero.status}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, status: e.target.value as "PUBLISHED" | "DRAFT" },
                  })
                }
                className="text-xs font-semibold px-3 py-1 rounded-lg border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white"
              >
                <option value="PUBLISHED">PUBLISHED (Live)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Top Eyebrow Badge</label>
              <input
                type="text"
                value={config.hero.badge}
                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, badge: e.target.value } })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                placeholder="e.g. Physical Hub + Smart Digital Portal"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Primary Hero Headline</label>
              <input
                type="text"
                value={config.hero.heading}
                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, heading: e.target.value } })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Subheading Paragraph</label>
              <textarea
                rows={2}
                value={config.hero.subheading}
                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subheading: e.target.value } })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Primary CTA Button Text</label>
              <input
                type="text"
                value={config.hero.primaryCta.text}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, primaryCta: { ...config.hero.primaryCta, text: e.target.value } },
                  })
                }
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Primary CTA Link URL</label>
              <input
                type="text"
                value={config.hero.primaryCta.href}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, primaryCta: { ...config.hero.primaryCta, href: e.target.value } },
                  })
                }
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Secondary CTA Button Text</label>
              <input
                type="text"
                value={config.hero.secondaryCta.text}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, secondaryCta: { ...config.hero.secondaryCta, text: e.target.value } },
                  })
                }
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Secondary CTA Link URL</label>
              <input
                type="text"
                value={config.hero.secondaryCta.href}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, secondaryCta: { ...config.hero.secondaryCta, href: e.target.value } },
                  })
                }
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Live Preview of Hero Banner */}
          <div className="mt-4 p-5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark/40 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Live Hero Appearance Preview</span>
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                {config.hero.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-dark dark:text-white">{config.hero.heading}</h2>
              <p className="text-xs text-body-color max-w-2xl">{config.hero.subheading}</p>
              <div className="flex items-center gap-2 pt-2">
                <span className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm">
                  {config.hero.primaryCta.text}
                </span>
                <span className="px-4 py-2 rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-dark text-xs font-semibold">
                  {config.hero.secondaryCta.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Homepage Sections Ordering & Visibility */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Homepage Sections Hierarchy</h3>
                <p className="text-xs text-body-color">Reorder, enable/disable, and publish modular sections on the landing page</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {config.sections.map((section, idx) => (
              <div
                key={section.id}
                className={`p-4 rounded-xl border transition flex items-center justify-between ${
                  section.enabled
                    ? "bg-white dark:bg-dark border-stroke dark:border-strokedark"
                    : "bg-gray-50 dark:bg-gray-dark/50 border-stroke/60 dark:border-strokedark/60 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {section.order}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-dark dark:text-white">{section.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          section.status === "PUBLISHED"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-600"
                        }`}
                      >
                        {section.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-body-color font-mono">type: {section.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark disabled:opacity-30 transition"
                    title="Move section up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, "down")}
                    disabled={idx === config.sections.length - 1}
                    className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark disabled:opacity-30 transition"
                    title="Move section down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSectionEnabled(idx)}
                    className="p-1 rounded-lg transition"
                    title={section.enabled ? "Disable section" : "Enable section"}
                  >
                    {section.enabled ? (
                      <ToggleRight className="w-7 h-7 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: SEO Metadata Control */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Landing Page SEO & Metadata</h3>
              <p className="text-xs text-body-color">Manage search engine indexing title, description, and keywords</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Page Title (Meta & OG Title)</label>
              <input
                type="text"
                value={config.seo.title}
                onChange={(e) => setConfig({ ...config, seo: { ...config.seo, title: e.target.value } })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Meta Description (150-160 chars recommended)</label>
              <textarea
                rows={2}
                value={config.seo.metaDescription}
                onChange={(e) => setConfig({ ...config, seo: { ...config.seo, metaDescription: e.target.value } })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Meta Keywords (Comma separated)</label>
              <input
                type="text"
                value={config.seo.keywords}
                onChange={(e) => setConfig({ ...config, seo: { ...config.seo, keywords: e.target.value } })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Publishing Changes..." : "Save Homepage Configuration"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
