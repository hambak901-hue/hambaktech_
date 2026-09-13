"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  User,
  Mail,
  FileCheck,
  Percent,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { AcademyEnrollment } from "@/types/platform";

export default function AdminAcademyPage() {
  const [enrollments, setEnrollments] = useState<AcademyEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = () => {
    try {
      setLoading(true);
      const list = platformApi.getAcademyEnrollments();
      setEnrollments([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load student enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleToggleCert = (enrollmentId: string) => {
    setEnrollments(
      enrollments.map((e) =>
        e.id === enrollmentId
          ? {
              ...e,
              certificateIssued: !e.certificateIssued,
              certificateNumber: !e.certificateIssued ? `HT-CERT-${Date.now().toString().slice(-6)}` : undefined,
            }
          : e
      )
    );
  };

  const handleUpdateStatus = (enrollmentId: string, nextStatus: AcademyEnrollment["status"]) => {
    setEnrollments(
      enrollments.map((e) =>
        e.id === enrollmentId
          ? {
              ...e,
              status: nextStatus,
              progressPercent: nextStatus === "COMPLETED" ? 100 : e.progressPercent,
              certificateIssued: nextStatus === "COMPLETED" ? true : e.certificateIssued,
            }
          : e
      )
    );
  };

  const columns: Column<AcademyEnrollment>[] = [
    {
      key: "studentName",
      header: "Student Information",
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-bold text-dark dark:text-white text-xs block">{s.studentName}</span>
          <span className="text-[11px] text-body-color">{s.studentEmail}</span>
        </div>
      ),
    },
    {
      key: "courseTitle",
      header: "Course & Cohort",
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-bold text-dark dark:text-white text-xs block">{s.courseTitle}</span>
          <span className="text-[11px] font-mono text-primary font-semibold">{s.cohort}</span>
        </div>
      ),
    },
    {
      key: "progressPercent",
      header: "Curriculum Progress",
      sortable: true,
      render: (s) => (
        <div className="w-28 space-y-1">
          <div className="flex justify-between text-[10px] text-body-color font-semibold">
            <span>{s.progressPercent}%</span>
            <span>{s.status}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                s.progressPercent >= 100
                  ? "bg-emerald-500"
                  : s.progressPercent > 50
                  ? "bg-primary"
                  : "bg-amber-500"
              }`}
              style={{ width: `${s.progressPercent}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Enrollment Status",
      sortable: true,
      render: (s) => {
        const styles: Record<string, string> = {
          COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          ENROLLED: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
          DROPPED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${styles[s.status] || styles.ENROLLED}`}>
            {s.status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "certificateIssued",
      header: "Certificate",
      sortable: true,
      render: (s) => (
        <button
          type="button"
          onClick={() => handleToggleCert(s.id)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition ${
            s.certificateIssued
              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
              : "bg-gray-100 text-body-color hover:bg-gray-200"
          }`}
        >
          <Award className="w-3 h-3" />
          <span>{s.certificateIssued ? s.certificateNumber || "Issued" : "Pending"}</span>
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          {s.status !== "COMPLETED" ? (
            <button
              type="button"
              onClick={() => handleUpdateStatus(s.id, "COMPLETED")}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Graduate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleUpdateStatus(s.id, "IN_PROGRESS")}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-body-color hover:bg-gray-200 transition"
            >
              Reset
            </button>
          )}
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Enrolled", value: "ENROLLED" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Dropped", value: "DROPPED" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="Computer Training Academy Student Records"
      breadcrumbs={[{ label: "Academy Students" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Enrolled Students</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{enrollments.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">In Active Training</span>
            <p className="text-xl font-bold text-primary mt-1">
              {enrollments.filter((e) => e.status === "IN_PROGRESS" || e.status === "ENROLLED").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Graduated Alumni</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {enrollments.filter((e) => e.status === "COMPLETED").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Certificates Issued</span>
            <p className="text-xl font-bold text-purple-600 mt-1">
              {enrollments.filter((e) => e.certificateIssued).length} Verified
            </p>
          </div>
        </div>

        {/* Enrollments Table */}
        <AdminDataTable
          columns={columns}
          data={enrollments}
          loading={loading}
          error={error}
          onRetry={loadStudents}
          searchPlaceholder="Search student name, email, or course..."
          searchKeys={["studentName", "studentEmail", "courseTitle", "cohort"]}
          filters={filters}
          emptyTitle="No student records found"
          emptyDescription="Enrollments from the online academy portal will be listed here."
        />
      </div>
    </AdminLayout>
  );
}
