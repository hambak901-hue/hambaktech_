"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Lock,
  Smartphone,
  Mail,
  MapPin,
  CheckCircle2,
  Key,
  Copy,
  Save,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";

export default function DashboardProfilePage() {
  const currentUser = platformApi.getCurrentUser();
  const [activeTab, setActiveTab] = useState<"PROFILE" | "SECURITY">("PROFILE");

  // Profile State
  const [fullName, setFullName] = useState(currentUser?.name || "Hamzat Olalekan");
  const [email, setEmail] = useState(currentUser?.email || "customer@hambaktech.com.ng");
  const [phone, setPhone] = useState(currentUser?.phone || "08147837664");
  const [address, setAddress] = useState("Origanrigan Cele Area, Ibeju-Lekki, Lagos State");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [txPin, setTxPin] = useState("••••");
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);

  const [copiedReferral, setCopiedReferral] = useState(false);
  const referralCode = "HT-HAMZAT-90";

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setTimeout(() => {
      if (currentUser) {
        platformApi.updateUserProfile({
          name: fullName,
          email,
          phone,
        });
      }
      setProfileSaving(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }, 600);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setSecuritySaving(true);
    setTimeout(() => {
      setSecuritySaving(false);
      setSecuritySuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSecuritySuccess(false), 3000);
    }, 800);
  };

  return (
    <DashboardLayout
      pageTitle="Account Settings & Security"
      breadcrumbs={[{ label: "Profile & Security" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl border-2 border-primary/20">
              {fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-dark dark:text-white">{fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold tracking-wider uppercase border border-emerald-200 dark:border-emerald-800">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-body-color mt-0.5">{email} • {phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark">
            <div>
              <span className="text-[10px] uppercase font-bold text-body-color block">
                Referral Code
              </span>
              <span className="font-mono font-bold text-xs text-dark dark:text-white">
                {referralCode}
              </span>
            </div>
            <button
              onClick={handleCopyReferral}
              className="p-2 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark hover:border-primary text-primary transition"
              title="Copy referral code"
            >
              {copiedReferral ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stroke dark:border-strokedark">
          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "PROFILE"
                ? "border-primary text-primary"
                : "border-transparent text-body-color hover:text-dark dark:hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab("SECURITY")}
            className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "SECURITY"
                ? "border-primary text-primary"
                : "border-transparent text-body-color hover:text-dark dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & PIN</span>
          </button>
        </div>

        {/* Tab Content: Profile */}
        {activeTab === "PROFILE" && (
          <form
            onSubmit={handleSaveProfile}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-6 animate-in fade-in duration-200"
          >
            <h3 className="text-base font-bold text-dark dark:text-white">
              Personal Information
            </h3>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Primary Delivery / Pickup Hub
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stroke dark:border-strokedark flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
              >
                {profileSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab Content: Security */}
        {activeTab === "SECURITY" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Password Update Form */}
            <form
              onSubmit={handleSaveSecurity}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-5"
            >
              <h3 className="text-base font-bold text-dark dark:text-white">
                Password & Authentication
              </h3>

              {securitySuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Security settings and password updated!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stroke dark:border-strokedark flex justify-end">
                <button
                  type="submit"
                  disabled={securitySaving || !newPassword}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {securitySaving ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>

            {/* 2-Factor Authentication & Transaction PIN */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-dark dark:text-white">
                    Two-Factor Authentication (2FA)
                  </h4>
                  <p className="text-xs text-body-color mt-0.5">
                    Require OTP verification code sent via SMS / WhatsApp for sensitive wallet debits.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactorEnabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 border-t border-stroke dark:border-strokedark flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-dark dark:text-white">
                    Wallet Transaction PIN
                  </h4>
                  <p className="text-xs text-body-color mt-0.5">
                    A 4-digit code required to authorize instant airtime, data, and bill debits.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("PIN reset instruction sent to your registered phone number.")}
                  className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark hover:border-primary text-xs font-bold text-dark dark:text-white transition"
                >
                  Reset 4-Digit PIN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
