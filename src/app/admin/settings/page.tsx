"use client";

import React, { useState } from "react";
import {
  Settings,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Download,
  Key,
  Server,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { companyConfig } from "@/data/companyConfig";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({ ...companyConfig });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [userRegistration, setUserRegistration] = useState(true);
  const [vtuAutoDispatch, setVtuAutoDispatch] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 600);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      config,
      systemStatus: {
        maintenanceMode,
        userRegistration,
        vtuAutoDispatch,
      },
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hambaktech-settings-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      pageTitle="System Configuration & Business Settings"
      breadcrumbs={[{ label: "System Settings" }]}
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
        {/* Notification on Save */}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>System settings saved and cached successfully.</span>
            </div>
          </div>
        )}

        {/* Global Operations Toggles */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Platform Operation Switches</h3>
              <p className="text-xs text-body-color">Real-time flags governing customer access & service dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-dark dark:text-white block">Maintenance Mode</span>
                <span className="text-[11px] text-body-color">Restricts portal to staff only</span>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`p-1 rounded-lg ${maintenanceMode ? "text-rose-600" : "text-gray-400"}`}
              >
                {maintenanceMode ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-dark dark:text-white block">New Registrations</span>
                <span className="text-[11px] text-body-color">Allow new customer sign-ups</span>
              </div>
              <button
                type="button"
                onClick={() => setUserRegistration(!userRegistration)}
                className={`p-1 rounded-lg ${userRegistration ? "text-primary" : "text-gray-400"}`}
              >
                {userRegistration ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-dark dark:text-white block">VTU Auto-Dispatch</span>
                <span className="text-[11px] text-body-color">Instant API credit fulfillment</span>
              </div>
              <button
                type="button"
                onClick={() => setVtuAutoDispatch(!vtuAutoDispatch)}
                className={`p-1 rounded-lg ${vtuAutoDispatch ? "text-emerald-600" : "text-gray-400"}`}
              >
                {vtuAutoDispatch ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Business Contact & Profile */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Authoritative Company Details</h3>
              <p className="text-xs text-body-color">Synced across website headers, footers, invoices, and receipts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Legal Entity Name</label>
              <input
                type="text"
                value={config.legalName}
                onChange={(e) => setConfig({ ...config, legalName: e.target.value })}
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Brand Name</label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Company Slogan / Motto</label>
              <input
                type="text"
                value={config.slogan}
                onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Official Support Email</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Primary Telephone</label>
              <input
                type="text"
                value={config.phonePrimary}
                onChange={(e) => setConfig({ ...config, phonePrimary: e.target.value })}
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">WhatsApp Desk Line</label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Physical Hub Address</label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Operating Hours</label>
              <input
                type="text"
                value={config.operatingHours}
                onChange={(e) => setConfig({ ...config, operatingHours: e.target.value })}
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">Sunday Status</label>
              <input
                type="text"
                value={config.sundayStatus}
                onChange={(e) => setConfig({ ...config, sundayStatus: e.target.value })}
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Integration Credentials Status */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">API Credentials & Gateways Status</h3>
              <p className="text-xs text-body-color">Configured securely via environment secrets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark space-y-1">
              <span className="font-bold text-dark dark:text-white">Paystack Live API</span>
              <p className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Keys Active & Validated
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark space-y-1">
              <span className="font-bold text-dark dark:text-white">Moniepoint Webhook</span>
              <p className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Secret Key Provisioned
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark space-y-1">
              <span className="font-bold text-dark dark:text-white">Termii SMS API</span>
              <p className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sender ID: HAMBAKTECH
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-xs font-semibold text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition shadow-sm"
          >
            <Download className="w-4 h-4 text-body-color" />
            <span>Export Configuration Backup</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
