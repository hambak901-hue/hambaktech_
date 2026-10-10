"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Building2,
  Upload,
  RefreshCw,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Mail,
  Phone,
  Clock,
  MapPin,
  Shield,
  ExternalLink,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { companyConfig } from "@/data/companyConfig";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

export default function AdminCompanyPage() {
  const [config, setConfig] = useState({
    legalName: companyConfig.legalName,
    brandName: companyConfig.brandName,
    slogan: companyConfig.slogan,
    description: companyConfig.description,
    cacRcNumber: companyConfig.cacRcNumber || "RC-7489201",
    email: companyConfig.email,
    supportEmail: companyConfig.supportEmail || "support@hambaktech.com.ng",
    phonePrimary: companyConfig.phonePrimary,
    phoneSecondary: companyConfig.phoneSecondary || "",
    whatsapp: companyConfig.whatsapp,
    address: companyConfig.address,
    locationLga: companyConfig.locationLga || "Ibeju-Lekki",
    locationState: companyConfig.locationState || "Lagos State",
    country: companyConfig.country || "Nigeria",
    openingHours: companyConfig.operatingHours,
    websiteUrl: "https://business.hambaktech.com.ng",
    copyright: "© 2026 HambakTech & Services. All Rights Reserved.",
    footerText: "Where Technology Meets Real-World Service. Physical business centre operations, CAC corporate filings, ICT academy, and enterprise computing.",
    socialFacebook: companyConfig.socialLinks?.facebook || "https://facebook.com/hambaktech",
    socialTwitter: companyConfig.socialLinks?.twitter || "https://x.com/hambaktech",
    socialInstagram: companyConfig.socialLinks?.instagram || "https://instagram.com/hambaktech",
    socialLinkedin: companyConfig.socialLinks?.linkedin || "https://linkedin.com/company/hambaktech",
    socialWhatsapp: companyConfig.socialLinks?.whatsapp || `https://wa.me/${companyConfig.whatsapp.replace(/[^0-9]/g, "")}`,
  });

  const [logoUrl, setLogoUrl] = useState("/images/brand/logo.png");
  const [faviconUrl, setFaviconUrl] = useState("/images/brand/favicon/hambaktech-favicon.svg");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/admin/settings"), {
      headers: getAuthHeaders(),
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          if (json.data.companyConfig) {
            setConfig((prev) => ({ ...prev, ...json.data.companyConfig }));
          }
          if (json.data.branding_logo) setLogoUrl(json.data.branding_logo);
          if (json.data.branding_favicon) setFaviconUrl(json.data.branding_favicon);
        }
      })
      .catch(() => {});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 2097152) {
      setFeedback({ type: "error", message: "File exceeds maximum size limit of 2MB." });
      return;
    }

    const validExtensions = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
    if (!validExtensions.includes(file.type)) {
      setFeedback({ type: "error", message: "Invalid format. Only PNG, JPG, WEBP, SVG, and ICO assets are permitted." });
      return;
    }

    if (type === "logo") setUploadingLogo(true);
    else setUploadingFavicon(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await fetch(getApiUrl("/api/admin/branding/upload"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
          body: JSON.stringify({
            type,
            data: base64Data,
            filename: file.name,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          if (type === "logo") setLogoUrl(json.data.url);
          else setFaviconUrl(json.data.url);
          setFeedback({ type: "success", message: `New ${type} successfully uploaded and updated.` });
        } else {
          setFeedback({ type: "error", message: json.message || `Failed to upload ${type}.` });
        }
        if (type === "logo") setUploadingLogo(false);
        else setUploadingFavicon(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setFeedback({ type: "error", message: "Network error occurred while uploading asset." });
      if (type === "logo") setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  const handleRestoreDefault = async (type: "logo" | "favicon") => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/branding/upload?action=restore_default&type=${type}`), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (type === "logo") setLogoUrl(json.data.url);
        else setFaviconUrl(json.data.url);
        setFeedback({ type: "success", message: `Approved default ${type} restored.` });
      }
    } catch {
      setFeedback({ type: "error", message: `Failed to restore default ${type}.` });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/admin/settings"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          companyConfig: config,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: "Company profile & configuration saved successfully across the platform." });
      } else {
        setFeedback({ type: "error", message: json.message || "Failed to save company settings." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while saving company settings." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <AdminLayout
      pageTitle="Super Admin Company & Branding Control Centre"
      breadcrumbs={[{ label: "Super Admin" }, { label: "Company & Branding" }]}
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
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Section 1: Logo & Favicon Asset Control */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Authoritative Branding Assets</h3>
              <p className="text-xs text-body-color">
                Manage high-resolution brand logo, favicon, and visual marks. Protected by MIME and script-sanitizing guards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Logo Card */}
            <div className="p-5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-dark/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dark dark:text-white uppercase tracking-wider">Primary Brand Logo</h4>
                  <p className="text-[11px] text-body-color">Displayed in top navigation, invoices, and letterheads</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestoreDefault("logo")}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-primary bg-primary/10 hover:bg-primary/20 flex items-center gap-1 transition"
                  title="Restore default HambakTech logo"
                >
                  <RefreshCw className="w-3 h-3" /> Restore Approved
                </button>
              </div>

              <div className="h-28 flex items-center justify-center bg-white dark:bg-dark rounded-xl border border-dashed border-stroke dark:border-strokedark p-4">
                <div className="relative w-48 h-16">
                  <Image
                    src={logoUrl}
                    alt="Current Brand Logo"
                    fill
                    className="object-contain"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingLogo ? "Uploading & Sanitizing..." : "Upload / Replace Logo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => handleFileUpload(e, "logo")}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-body-color italic">
                * Max file size: 2MB. Permitted formats: PNG, JPG, WEBP, SVG. Strict SVG sanitization enforced.
              </p>
            </div>

            {/* Favicon Card */}
            <div className="p-5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-dark/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dark dark:text-white uppercase tracking-wider">Browser Favicon</h4>
                  <p className="text-[11px] text-body-color">Displayed in browser tabs and mobile bookmark bookmarks</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestoreDefault("favicon")}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-primary bg-primary/10 hover:bg-primary/20 flex items-center gap-1 transition"
                  title="Restore default favicon"
                >
                  <RefreshCw className="w-3 h-3" /> Restore Approved
                </button>
              </div>

              <div className="h-28 flex items-center justify-center bg-white dark:bg-dark rounded-xl border border-dashed border-stroke dark:border-strokedark p-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={faviconUrl}
                    alt="Current Favicon"
                    fill
                    className="object-contain"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingFavicon ? "Uploading..." : "Upload / Replace Favicon"}
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/x-icon"
                    onChange={(e) => handleFileUpload(e, "favicon")}
                    disabled={uploadingFavicon}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-body-color italic">
                * Max file size: 512KB. Recommended 32x32 SVG or PNG.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Core Identity & Business Registration */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Company Identity & Registration</h3>
              <p className="text-xs text-body-color">Legal name, corporate registration, and public business identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Official Brand Name</label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Legal Entity Name</label>
              <input
                type="text"
                value={config.legalName}
                onChange={(e) => setConfig({ ...config, legalName: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">CAC RC Registration Number</label>
              <input
                type="text"
                value={config.cacRcNumber}
                onChange={(e) => setConfig({ ...config, cacRcNumber: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Company Slogan / Tagline</label>
              <input
                type="text"
                value={config.slogan}
                onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Company Overview / Description</label>
              <textarea
                rows={3}
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Official Contact & Desk Lines */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Desk Numbers & Email Inboxes</h3>
              <p className="text-xs text-body-color">Publicly exposed support and operations channels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Official General Email</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Support Desk Email</label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">WhatsApp Desk Line</label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Primary Telephone</label>
              <input
                type="text"
                value={config.phonePrimary}
                onChange={(e) => setConfig({ ...config, phonePrimary: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Secondary Telephone</label>
              <input
                type="text"
                value={config.phoneSecondary}
                onChange={(e) => setConfig({ ...config, phoneSecondary: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Official Website URL</label>
              <input
                type="text"
                value={config.websiteUrl}
                onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Physical Hub Location & Hours */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Physical Hub & Operating Hours</h3>
              <p className="text-xs text-body-color">Ibeju-Lekki facility coordinates and official business hours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Street Address</label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Local Government Area (LGA)</label>
              <input
                type="text"
                value={config.locationLga}
                onChange={(e) => setConfig({ ...config, locationLga: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">State & Country</label>
              <input
                type="text"
                value={`${config.locationState}, ${config.country}`}
                onChange={(e) => {
                  const parts = e.target.value.split(",");
                  setConfig({
                    ...config,
                    locationState: parts[0]?.trim() || config.locationState,
                    country: parts[1]?.trim() || config.country,
                  });
                }}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Physical Hub Operating Hours</label>
              <input
                type="text"
                value={config.openingHours}
                onChange={(e) => setConfig({ ...config, openingHours: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Social Media & Public Footer */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Social Media & Footer Content</h3>
              <p className="text-xs text-body-color">Social handles and legal copyright text across the public site</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Facebook Page URL</label>
              <input
                type="text"
                value={config.socialFacebook}
                onChange={(e) => setConfig({ ...config, socialFacebook: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Twitter / X Handle URL</label>
              <input
                type="text"
                value={config.socialTwitter}
                onChange={(e) => setConfig({ ...config, socialTwitter: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Instagram Profile URL</label>
              <input
                type="text"
                value={config.socialInstagram}
                onChange={(e) => setConfig({ ...config, socialInstagram: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">LinkedIn Page URL</label>
              <input
                type="text"
                value={config.socialLinkedin}
                onChange={(e) => setConfig({ ...config, socialLinkedin: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Copyright Notice</label>
              <input
                type="text"
                value={config.copyright}
                onChange={(e) => setConfig({ ...config, copyright: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Footer Description Paragraph</label>
              <textarea
                rows={2}
                value={config.footerText}
                onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Company Configuration"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
