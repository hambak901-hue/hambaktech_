"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  ArrowRight,
  RefreshCw,
  Award,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { academyCourses } from "@/data/academyData";

export default function DashboardAcademyPage() {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("graphic-design");
  const [sessionTime, setSessionTime] = useState("MORNING");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(platformApi.getWallet());

  const activeCourse = academyCourses[0]; // Executive Computer Literacy
  const progressPercent = 65;

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowEnrollModal(false);
      alert("Enrollment application submitted! Our admissions desk will contact you with batch allocation details.");
    }, 1000);
  };

  return (
    <DashboardLayout
      pageTitle="Academy Student Portal & Lab Sessions"
      breadcrumbs={[{ label: "Academy" }]}
    >
      <div className="space-y-6">
        {/* Enrolled Course Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-primary/80 text-white shadow-xl shadow-primary/15 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Active Cohort: 2026 Batch B</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">{activeCourse.title}</h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
                {activeCourse.description}
              </p>

              {/* Progress Bar */}
              <div className="mt-5 max-w-md">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span>Course Progress</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setShowEnrollModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-primary font-bold text-xs hover:bg-white/90 transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll in Another Program</span>
              </button>
            </div>
          </div>
        </div>

        {/* Next Class Schedule Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-dark dark:text-white uppercase tracking-wider">
                Next Live Session
              </h3>
            </div>
            <p className="text-sm font-bold text-dark dark:text-white">
              Wednesday, 10:00 AM – 12:00 PM
            </p>
            <p className="text-xs text-body-color mt-1">
              Lab Room A, Workstation #04 • Instructor: Mr. Hammed
            </p>
            <div className="mt-3 pt-3 border-t border-stroke/60 dark:border-strokedark/60 text-xs font-semibold text-primary">
              Topic: Advanced Excel Formulas & Logical Functions
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-dark dark:text-white uppercase tracking-wider">
                Completed Modules
              </h3>
            </div>
            <p className="text-2xl font-bold text-dark dark:text-white">4 / 6</p>
            <p className="text-xs text-body-color mt-1">
              Windows OS, Keyboarding, Microsoft Word, and Excel Fundamentals verified.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-dark dark:text-white uppercase tracking-wider">
                Graduation Status
              </h3>
            </div>
            <p className="text-sm font-bold text-dark dark:text-white">
              Pending Capstone Project
            </p>
            <p className="text-xs text-body-color mt-1">
              2 weeks until cohort graduation and Certificate presentation.
            </p>
          </div>
        </div>

        {/* Modules Checklist */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <h3 className="text-base font-bold text-dark dark:text-white mb-4">
            Curriculum Checklist: {activeCourse.title}
          </h3>

          <div className="space-y-3">
            {activeCourse.modules.map((mod, idx) => {
              const isDone = idx < 4;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
                    isDone
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-dark dark:text-white"
                      : "bg-gray-50 dark:bg-gray-dark border-stroke dark:border-strokedark text-body-color"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-body-color"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className={isDone ? "font-semibold text-dark dark:text-white" : ""}>
                      {mod}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isDone
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-gray-200 dark:bg-gray-700 text-body-color"
                    }`}
                  >
                    {isDone ? "Completed" : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: Enroll in Another Program */}
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                    Enroll in Academy Course
                  </h3>
                  <p className="text-xs text-body-color">Reserve a workstation for upcoming cohort</p>
                </div>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEnroll} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                    Select Program
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-medium"
                  >
                    {academyCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                    Preferred Session Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "MORNING", label: "Morning (9am - 12pm)" },
                      { id: "AFTERNOON", label: "Afternoon (1pm - 4pm)" },
                      { id: "WEEKEND", label: "Weekend (Sat 10am - 3pm)" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSessionTime(s.id)}
                        className={`p-2 rounded-xl border text-center font-semibold transition ${
                          sessionTime === s.id
                            ? "bg-primary text-white border-primary"
                            : "border-stroke dark:border-strokedark text-body-color"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark text-xs text-body-color">
                  <span>
                    Admissions fee can be settled via wallet or flexible 2-part installment at our Ibeju-Lekki campus.
                  </span>
                </div>

                <div className="pt-3 border-t border-stroke dark:border-strokedark flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                    className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Reserving Workstation...</span>
                      </>
                    ) : (
                      <span>Submit Application</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
