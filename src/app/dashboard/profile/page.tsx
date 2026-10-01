"use client";

import React, { useState, useEffect, useId } from "react";
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
  AlertCircle,
  Fingerprint,
  Laptop,
  Activity,
  LogOut,
  Clock,
  ShieldAlert,
  ArrowRight,
  FileText,
  BadgeCheck,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

type TabKey = "PROFILE" | "SECURITY" | "EMAIL" | "KYC" | "SESSIONS";

interface SessionItem {
  id: string;
  device?: string;
  ip_address?: string;
  ipAddress?: string;
  userAgent?: string;
  user_agent?: string;
  created_at?: string;
  createdAt?: string;
  last_active_at?: string;
  lastActiveAt?: string;
  is_current?: boolean;
  isCurrent?: boolean;
}

interface ActivityItem {
  id: string;
  action: string;
  ip_address?: string;
  ipAddress?: string;
  created_at?: string;
  createdAt?: string;
  details?: Record<string, unknown>;
}

export default function DashboardProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("PROFILE");

  // Profile State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [stateName, setStateName] = useState("Lagos State");
  const [lga, setLga] = useState("Ibeju-Lekki");
  const [customerTier, setCustomerTier] = useState("STANDARD");
  const [kycStatus, setKycStatus] = useState("UNVERIFIED");
  const [kycTier, setKycTier] = useState(1);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Change Email State
  const [newEmail, setNewEmail] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // KYC Submission State
  const [bvnLast4, setBvnLast4] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [idType, setIdType] = useState("NIN");
  const [kycSaving, setKycSaving] = useState(false);
  const [kycSuccess, setKycSuccess] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  // Sessions & Activity State
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsFeedback, setSessionsFeedback] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [copiedReferral, setCopiedReferral] = useState(false);
  const [referralCode, setReferralCode] = useState("HT-CLIENT");

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Hambak Customer";

  // Form Field IDs
  const firstNameInputId = useId();
  const lastNameInputId = useId();
  const emailInputId = useId();
  const phoneInputId = useId();
  const stateInputId = useId();
  const lgaInputId = useId();
  const addressInputId = useId();
  const curPwInputId = useId();
  const newPwInputId = useId();
  const confPwInputId = useId();
  const newEmailInputId = useId();
  const emailPwInputId = useId();
  const idTypeInputId = useId();
  const ninInputId = useId();
  const bvnInputId = useId();

  // Load profile data on mount
  useEffect(() => {
    async function loadLiveProfile() {
      try {
        const res = await fetch(getApiUrl("/api/profile"), {
          headers: getAuthHeaders(),
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const p = json.data;
            if (p.first_name || p.firstName) setFirstName(p.first_name || p.firstName);
            if (p.last_name || p.lastName) setLastName(p.last_name || p.lastName);
            if (p.email) {
              setEmail(p.email);
              const prefix = p.email.split("@")[0].toUpperCase();
              setReferralCode(`HT-${prefix}`);
            }
            if (p.email_verified !== undefined || p.emailVerified !== undefined) {
              setEmailVerified(Boolean(p.email_verified ?? p.emailVerified));
            }
            if (p.phone) setPhone(p.phone);
            if (p.address) setAddress(p.address);
            if (p.state) setStateName(p.state);
            if (p.lga) setLga(p.lga);
            if (p.customer_tier || p.customerTier) {
              setCustomerTier(p.customer_tier || p.customerTier);
            }
            if (p.kyc_status || p.kycStatus) {
              setKycStatus(p.kyc_status || p.kycStatus);
            }
            if (p.kyc_tier || p.kycTier) {
              setKycTier(Number(p.kyc_tier || p.kycTier));
            }
          }
        }
      } catch (err) {
        console.warn("[ProfilePage] Failed to fetch live profile:", err);
      }
    }
    loadLiveProfile();
  }, []);

  // Fetch sessions when SESSIONS tab is opened
  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await fetch(getApiUrl("/api/profile/sessions"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.sessions || []);
        setSessions(list);
      }
    } catch (err) {
      console.warn("[ProfilePage] Failed to load sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Fetch customer activity trail
  const loadActivities = async () => {
    try {
      setActivityLoading(true);
      const res = await fetch(getApiUrl("/api/profile/activity"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.activities || []);
        setActivities(list);
      }
    } catch (err) {
      console.warn("[ProfilePage] Failed to load activity logs:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "SESSIONS") {
      loadSessions();
      loadActivities();
    }
  }, [activeTab]);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  // Profile update handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    setProfileError(null);

    try {
      const res = await fetch(getApiUrl("/api/profile"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          state: stateName.trim(),
          lga: lga.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update profile.");
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Profile update failed.";
      setProfileError(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  // Password update handler
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(false);

    if (newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match!");
      return;
    }

    setSecuritySaving(true);
    try {
      const res = await fetch(getApiUrl("/api/profile/password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Password update failed.");
      }

      setSecuritySuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSecuritySuccess(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password change failed.";
      setSecurityError(msg);
    } finally {
      setSecuritySaving(false);
    }
  };

  // Email update handler
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);

    if (!newEmail.trim()) {
      setEmailError("Please enter a valid new email address.");
      return;
    }
    if (!emailChangePassword) {
      setEmailError("Current password is required to verify email modification.");
      return;
    }

    setEmailSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/profile/email"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          newEmail: newEmail.trim(),
          password: emailChangePassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to initiate email change.");
      }

      setEmailSuccess(true);
      setEmail(newEmail.trim());
      setNewEmail("");
      setEmailChangePassword("");
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Email change failed.";
      setEmailError(msg);
    } finally {
      setEmailSaving(false);
    }
  };

  // KYC submission handler
  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycError(null);
    setKycSuccess(false);

    if (!ninNumber.trim() && !bvnLast4.trim()) {
      setKycError("Please provide your NIN or BVN last 4 digits for identity verification.");
      return;
    }

    setKycSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/profile/kyc"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          nin: ninNumber.trim() || undefined,
          bvnLast4: bvnLast4.trim() || undefined,
          idType,
          idNumber: ninNumber.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit KYC verification documents.");
      }

      setKycSuccess(true);
      setKycStatus("PENDING");
      setTimeout(() => setKycSuccess(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "KYC submission failed.";
      setKycError(msg);
    } finally {
      setKycSaving(false);
    }
  };

  // Revoke single session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/profile/sessions/${sessionId}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        setSessionsFeedback("Session terminated successfully.");
        setTimeout(() => setSessionsFeedback(null), 3000);
        loadSessions();
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.message || "Failed to revoke session");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Revocation failed";
      alert(msg);
    }
  };

  // Revoke all other sessions
  const handleRevokeAllOtherSessions = async () => {
    if (!confirm("Are you sure you want to terminate all other active sessions across your mobile and desktop devices?")) {
      return;
    }
    try {
      const res = await fetch(getApiUrl("/api/profile/sessions/revoke-others"), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        setSessionsFeedback("All other active device sessions have been revoked.");
        setTimeout(() => setSessionsFeedback(null), 4000);
        loadSessions();
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.message || "Failed to revoke other sessions");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Revocation failed";
      alert(msg);
    }
  };

  return (
    <DashboardLayout
      pageTitle="Account Settings & Customer Management"
      breadcrumbs={[{ label: "Customer Profile" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl border-2 border-primary/20">
              {fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-dark dark:text-white">{fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold tracking-wider uppercase border border-emerald-200 dark:border-emerald-800">
                  {customerTier} Tier
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                  kycStatus === "VERIFIED"
                    ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200"
                    : kycStatus === "PENDING"
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200"
                }`}>
                  KYC: {kycStatus}
                </span>
              </div>
              <p className="text-xs text-body-color mt-1">{email} • {phone || "Phone not set"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark">
            <div>
              <span className="text-[10px] uppercase font-bold text-body-color block">
                Partner Code
              </span>
              <span className="font-mono font-bold text-xs text-dark dark:text-white">
                {referralCode}
              </span>
            </div>
            <button
              id="btn-copy-referral"
              onClick={handleCopyReferral}
              className="p-2 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark hover:border-primary text-primary transition"
              title="Copy partner code"
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
        <div className="flex border-b border-stroke dark:border-strokedark overflow-x-auto gap-2">
          <button
            id="tab-btn-profile"
            onClick={() => setActiveTab("PROFILE")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "PROFILE"
                ? "border-primary text-primary"
                : "border-transparent text-body-color hover:text-dark dark:hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            id="tab-btn-email"
            onClick={() => setActiveTab("EMAIL")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "EMAIL"
                ? "border-primary text-primary"
                : "border-transparent text-body-color hover:text-dark dark:hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Address</span>
          </button>
          <button
            id="tab-btn-security"
            onClick={() => setActiveTab("SECURITY")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "SECURITY"
                ? "border-primary text-primary"
                : "border-transparent text-body-color hover:text-dark dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
          <button
            id="tab-btn-kyc"
            onClick={() => setActiveTab("KYC")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "KYC"
                ? "border-primary text-primary"
                : "border-transparent text-body-color hover:text-dark dark:hover:text-white"
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Identity & KYC</span>
          </button>
          <button
            id="tab-btn-sessions"
            onClick={() => setActiveTab("SESSIONS")}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "SESSIONS"
                ? "border-primary text-primary"
                : "border-transparent text-body-color hover:text-dark dark:hover:text-white"
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Sessions & Audit</span>
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === "PROFILE" && (
          <form
            id="form-customer-profile"
            onSubmit={handleSaveProfile}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-6 animate-in fade-in duration-200"
          >
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">
                Personal Information & Hub Delivery Location
              </h3>
              <p className="text-xs text-body-color mt-0.5">
                Keep your contact details up to date for physical order deliveries and official dispatch.
              </p>
            </div>

            {profileSuccess && (
              <div id="profile-success-msg" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Profile details updated and recorded in the audit trail!</span>
              </div>
            )}

            {profileError && (
              <div id="profile-error-msg" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label htmlFor={firstNameInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  id={firstNameInputId}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="First name"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label htmlFor={lastNameInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  id={lastNameInputId}
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Last name"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label htmlFor={emailInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  id={emailInputId}
                  type="email"
                  value={email}
                  disabled
                  title="To change email address, please use the Email Address tab."
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-100 dark:bg-gray-800 text-dark/70 dark:text-white/70 focus:outline-none font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor={phoneInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <input
                  id={phoneInputId}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="08012345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label htmlFor={stateInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  State of Residence
                </label>
                <input
                  id={stateInputId}
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Lagos State"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label htmlFor={lgaInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Local Government Area (LGA)
                </label>
                <input
                  id={lgaInputId}
                  type="text"
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  placeholder="e.g. Ibeju-Lekki"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={addressInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Primary Delivery / Pickup Address
                </label>
                <input
                  id={addressInputId}
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Suite 4, Hambak Hub, Eleko Junction, Ibeju-Lekki"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stroke dark:border-strokedark flex justify-end">
              <button
                id="btn-save-profile"
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
              >
                {profileSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Profile...</span>
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

        {/* Tab 2: Email Management */}
        {activeTab === "EMAIL" && (
          <form
            id="form-customer-email"
            onSubmit={handleSaveEmail}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-6 animate-in fade-in duration-200"
          >
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">
                Email Address & Account Identity
              </h3>
              <p className="text-xs text-body-color mt-0.5">
                Your email is authoritative for account recovery, OTP tokens, and transaction receipts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-body-color block">Current Registered Email</span>
                <span className="text-sm font-bold text-dark dark:text-white">{email}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                emailVerified
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {emailVerified ? "Verified" : "Pending Verification"}
              </span>
            </div>

            {emailSuccess && (
              <div id="email-success-msg" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Email address updated successfully! Audit trail has recorded this credential modification.</span>
              </div>
            )}

            {emailError && (
              <div id="email-error-msg" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{emailError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label htmlFor={newEmailInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  New Email Address
                </label>
                <input
                  id={newEmailInputId}
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new.email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label htmlFor={emailPwInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                  Verify Current Password
                </label>
                <input
                  id={emailPwInputId}
                  type="password"
                  required
                  value={emailChangePassword}
                  onChange={(e) => setEmailChangePassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                For your security, updating your authoritative email address will trigger an audit alert and an email verification notice.
              </span>
            </div>

            <div className="pt-4 border-t border-stroke dark:border-strokedark flex justify-end">
              <button
                id="btn-update-email"
                type="submit"
                disabled={emailSaving || !newEmail || !emailChangePassword}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {emailSaving ? "Updating Email..." : "Update Email Address"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === "SECURITY" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <form
              id="form-customer-password"
              onSubmit={handleSaveSecurity}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-5"
            >
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">
                  Change Account Password
                </h3>
                <p className="text-xs text-body-color mt-0.5">
                  Ensure your password is at least 8 characters with letters, numbers, and symbols.
                </p>
              </div>

              {securitySuccess && (
                <div id="pw-success-msg" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Password successfully updated! All other active device sessions have been revoked.</span>
                </div>
              )}

              {securityError && (
                <div id="pw-error-msg" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{securityError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label htmlFor={curPwInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    id={curPwInputId}
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor={newPwInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    id={newPwInputId}
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor={confPwInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id={confPwInputId}
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Security Guarantee: Once you change your password, our server automatically invalidates any other active session tokens to secure your account.
                </span>
              </div>

              <div className="pt-3 border-t border-stroke dark:border-strokedark flex justify-end">
                <button
                  id="btn-update-password"
                  type="submit"
                  disabled={securitySaving || !newPassword}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {securitySaving ? "Updating Password..." : "Change Password"}
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
                  id="btn-toggle-2fa"
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
                  id="btn-reset-pin"
                  type="button"
                  onClick={() => alert("PIN reset verification code has been dispatched to your registered phone number.")}
                  className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark hover:border-primary text-xs font-bold text-dark dark:text-white transition"
                >
                  Reset 4-Digit PIN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Identity & KYC Verification */}
        {activeTab === "KYC" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Status & Limits Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-body-color uppercase tracking-wider block">
                    Current Verification Level
                  </span>
                  <h3 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2 mt-0.5">
                    Tier {kycTier} Account ({customerTier})
                    {kycStatus === "VERIFIED" && (
                      <BadgeCheck className="w-5 h-5 text-blue-600" />
                    )}
                  </h3>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark">
                  <span className="text-[11px] font-bold uppercase text-body-color block">Daily Transaction Limit</span>
                  <span className="text-base font-extrabold text-primary">
                    {kycTier >= 3 ? "Unlimited Daily" : kycTier === 2 ? "₦500,000 / day" : "₦50,000 / day"}
                  </span>
                </div>
              </div>

              {/* Tier Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stroke dark:border-strokedark text-xs">
                <div className={`p-3 rounded-xl border ${kycTier === 1 ? "border-primary bg-primary/5" : "border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark"}`}>
                  <span className="font-bold text-dark dark:text-white block">Tier 1: Starter</span>
                  <span className="text-body-color text-[11px]">Phone & Email verified. ₦50,000 max debit daily.</span>
                </div>
                <div className={`p-3 rounded-xl border ${kycTier === 2 ? "border-primary bg-primary/5" : "border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark"}`}>
                  <span className="font-bold text-dark dark:text-white block">Tier 2: Verified (Recommended)</span>
                  <span className="text-body-color text-[11px]">NIN / BVN verified. ₦500,000 daily limit + Agent pricing.</span>
                </div>
                <div className={`p-3 rounded-xl border ${kycTier === 3 ? "border-primary bg-primary/5" : "border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark"}`}>
                  <span className="font-bold text-dark dark:text-white block">Tier 3: Corporate Partner</span>
                  <span className="text-body-color text-[11px]">CAC Certificate verified. Unlimited wallet balance & API keys.</span>
                </div>
              </div>
            </div>

            {/* KYC Submission Form */}
            <form
              id="form-customer-kyc"
              onSubmit={handleSubmitKYC}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-5"
            >
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">
                  Submit Identity Verification Documents
                </h3>
                <p className="text-xs text-body-color mt-0.5">
                  In accordance with CBN and NIMC regulatory standards, your sensitive numbers are encrypted with salted hashes.
                </p>
              </div>

              {kycSuccess && (
                <div id="kyc-success-msg" className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>KYC documents submitted successfully! Our compliance desk will review your details shortly.</span>
                </div>
              )}

              {kycError && (
                <div id="kyc-error-msg" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{kycError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label htmlFor={idTypeInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Identity Document Type
                  </label>
                  <select
                    id={idTypeInputId}
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="NIN">National Identity Number (NIN Slip)</option>
                    <option value="VOTERS_CARD">INEC Voter&apos;s Card (VIN)</option>
                    <option value="DRIVERS_LICENSE">FRSC Driver&apos;s License</option>
                    <option value="PASSPORT">Nigerian International Passport</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={ninInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Document Number (e.g. 11-Digit NIN)
                  </label>
                  <input
                    id={ninInputId}
                    type="text"
                    value={ninNumber}
                    onChange={(e) => setNinNumber(e.target.value)}
                    placeholder="Enter document number"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div>
                  <label htmlFor={bvnInputId} className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    BVN Verification (Last 4 Digits)
                  </label>
                  <input
                    id={bvnInputId}
                    type="text"
                    maxLength={4}
                    value={bvnLast4}
                    onChange={(e) => setBvnLast4(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark text-[11px] text-body-color flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Your identification data is strictly processed via certified NIMC and NIBSS lookup APIs for customer verification.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stroke dark:border-strokedark flex justify-end">
                <button
                  id="btn-submit-kyc"
                  type="submit"
                  disabled={kycSaving || (!ninNumber && !bvnLast4)}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {kycSaving ? "Submitting Documents..." : "Submit Verification Documents"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Active Sessions & Audit Trail */}
        {activeTab === "SESSIONS" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Active Sessions */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-primary" />
                    Active Device Sessions
                  </h3>
                  <p className="text-xs text-body-color mt-0.5">
                    Devices and browser sessions currently authenticated to your account.
                  </p>
                </div>
                <button
                  id="btn-revoke-other-sessions"
                  type="button"
                  onClick={handleRevokeAllOtherSessions}
                  className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold border border-rose-200 dark:border-rose-800 transition"
                >
                  Revoke All Other Sessions
                </button>
              </div>

              {sessionsFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{sessionsFeedback}</span>
                </div>
              )}

              {sessionsLoading ? (
                <div className="py-8 text-center text-xs text-body-color">Loading active sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark text-xs text-body-color text-center">
                  Only your current browser session is actively authenticated.
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((sess, idx) => {
                    const isCur = sess.is_current || sess.isCurrent || idx === 0;
                    return (
                      <div
                        key={sess.id || idx}
                        className="p-4 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Laptop className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-dark dark:text-white">
                                {sess.device || sess.userAgent || sess.user_agent || "Web Browser"}
                              </span>
                              {isCur && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-body-color font-mono block">
                              IP: {sess.ip_address || sess.ipAddress || "Authorized"} • Active: {sess.last_active_at || sess.lastActiveAt || "Recent"}
                            </span>
                          </div>
                        </div>

                        {!isCur && (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(sess.id)}
                            className="px-3 py-1.5 rounded-lg border border-stroke dark:border-strokedark text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          >
                            Terminate
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Account Activity Audit Log */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Account Security Activity Trail
                </h3>
                <p className="text-xs text-body-color mt-0.5">
                  Chronological log of logins, profile modifications, and password resets on your account.
                </p>
              </div>

              {activityLoading ? (
                <div className="py-6 text-center text-xs text-body-color">Loading activity history...</div>
              ) : activities.length === 0 ? (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark text-xs text-body-color text-center">
                  No security events recorded in the current session window.
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.map((act, idx) => (
                    <div
                      key={act.id || idx}
                      className="p-3 rounded-xl border border-stroke dark:border-strokedark text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-dark dark:text-white uppercase tracking-wider block">
                          {act.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-body-color font-mono">
                          IP: {act.ip_address || act.ipAddress || "Verified"}
                        </span>
                      </div>
                      <span className="text-[11px] text-body-color">
                        {new Date(act.created_at || act.createdAt || Date.now()).toLocaleDateString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
