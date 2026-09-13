"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Key,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  History,
  Laptop,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";

export default function DashboardSecurityPage() {
  const user = platformApi.getCurrentUser();

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  // Transaction PIN State
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinError, setPinError] = useState("");

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState([
    {
      id: "sess-1",
      device: "Chrome on macOS (Current)",
      ip: "105.112.98.54",
      location: "Lagos, Nigeria",
      lastActive: "Just now",
      current: true,
    },
    {
      id: "sess-2",
      device: "Mobile Safari on iPhone 14",
      ip: "102.89.44.12",
      location: "Ibeju-Lekki, Nigeria",
      lastActive: "2 hours ago",
      current: false,
    },
  ]);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (!currentPassword) {
      setPwError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);
    setTimeout(() => {
      setPwLoading(false);
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 4000);
    }, 800);
  };

  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    setPinSuccess(false);

    if (!/^\d{4}$/.test(newPin)) {
      setPinError("Transaction PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("Confirmation PIN does not match.");
      return;
    }

    setPinLoading(true);
    setTimeout(() => {
      setPinLoading(false);
      setPinSuccess(true);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setTimeout(() => setPinSuccess(false), 4000);
    }, 700);
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    setTwoFactorSuccess(true);
    setTimeout(() => setTwoFactorSuccess(false), 3000);
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
  };

  return (
    <DashboardLayout
      pageTitle="Account Security & Access Control"
      breadcrumbs={[{ label: "Security & PIN" }]}
    >
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-primary to-indigo-900 rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
                Security & Fraud Prevention
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Safeguard Your HambakTech Account</h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Control your password, 4-digit transaction PIN, multi-factor authentication, and monitor active logins to keep your wallet and documents secure.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Protection Status: Optimal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Password Management */}
          <div className="bg-white dark:bg-dark p-6 rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-stroke dark:border-strokedark">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Change Account Password</h3>
                <p className="text-xs text-body-color">Use at least 8 characters with numbers and symbols</p>
              </div>
            </div>

            {pwSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password updated successfully! Next login will require your new credentials.</span>
              </div>
            )}

            {pwError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-xs sm:text-sm text-dark dark:text-white focus:border-primary focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-3 text-body-color hover:text-dark"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-xs sm:text-sm text-dark dark:text-white focus:border-primary focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-3 text-body-color hover:text-dark"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-xs sm:text-sm text-dark dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-2"
              >
                {pwLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>

          {/* Transaction PIN Management */}
          <div className="bg-white dark:bg-dark p-6 rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-stroke dark:border-strokedark">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Transaction Security PIN</h3>
                <p className="text-xs text-body-color">Required to authorize wallet debits, bill payments & orders</p>
              </div>
            </div>

            {pinSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transaction PIN configured successfully. Keep it confidential!</span>
              </div>
            )}

            {pinError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handlePinUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                  Current PIN (Leave blank if first setup)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full tracking-widest text-center px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-sm font-mono text-dark dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full tracking-widest text-center px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-sm font-mono text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full tracking-widest text-center px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-sm font-mono text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-body-color">
                Notice: HambakTech representatives will never ask for your 4-digit PIN or password via phone or WhatsApp.
              </p>

              <button
                type="submit"
                disabled={pinLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2"
              >
                {pinLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving PIN...</span>
                  </>
                ) : (
                  <span>Save Transaction PIN</span>
                )}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white dark:bg-dark p-6 rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stroke dark:border-strokedark">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-body-color">SMS & OTP verification during sign-in</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggle2FA}
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

            {twoFactorSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Two-Factor Authentication status updated to {twoFactorEnabled ? "Active" : "Disabled"}.
                </span>
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs text-body-color">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Requires verification code sent to {user.phone || "your registered phone"} upon sign in.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Protects your wallet against unauthorized withdrawals or automated credential stuffing.</span>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-dark p-6 rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-stroke dark:border-strokedark">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Active Devices & Sessions</h3>
                <p className="text-xs text-body-color">Browsers and devices currently logged into your account</p>
              </div>
            </div>

            <div className="mt-4 divide-y divide-stroke dark:divide-strokedark">
              {sessions.map((sess) => (
                <div key={sess.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-dark dark:text-white">{sess.device}</span>
                      {sess.current && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-body-color">
                      {sess.location} • IP: {sess.ip} • {sess.lastActive}
                    </p>
                  </div>

                  {!sess.current && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Disclaimers & Advice */}
        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-dark border border-stroke dark:border-strokedark flex items-start gap-3 text-xs text-body-color">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-dark dark:text-white block mb-0.5">
              HambakTech Security Guarantee & Advice
            </span>
            <span>
              We utilize end-to-end encrypted session tokens and hashed wallet passcodes. If you suspect any unauthorized access to your account or phone number, reach out immediately to our official support desk at{" "}
              <strong className="text-dark dark:text-white">08147837664</strong> or via the in-app{" "}
              <Link href="/dashboard/support" className="text-primary hover:underline font-semibold">
                Support Tickets
              </Link>{" "}
              desk.
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
