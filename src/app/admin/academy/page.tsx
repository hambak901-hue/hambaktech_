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
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { AcademyEnrollment } from "@/types/platform";

export default function AdminAcademyPage() {
  const [enrollments, setEnrollments] = useState<AcademyEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingEnrollment, setViewingEnrollment] = useState<AcademyEnrollment | null>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<AcademyEnrollment | null>(null);
  const [deletingEnrollment, setDeletingEnrollment] = useState<AcademyEnrollment | null>(null);

  // Form states
  const [formStudentName, setFormStudentName] = useState("");
  const [formStudentEmail, setFormStudentEmail] = useState("");
  const [formCourseTitle, setFormCourseTitle] = useState("Professional Web Development Bootcamp");
  const [formCohort, setFormCohort] = useState("Q4-2026");
  const [formProgress, setFormProgress] = useState(0);
  const [formStatus, setFormStatus] = useState<AcademyEnrollment["status"]>("ENROLLED");
  const [formCertIssued, setFormCertIssued] = useState(false);
  const [formCertNumber, setFormCertNumber] = useState("");

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

  const openCreateModal = () => {
    setFormStudentName("");
    setFormStudentEmail("");
    setFormCourseTitle("Professional Web Development Bootcamp");
    setFormCohort("Q4-2026");
    setFormProgress(0);
    setFormStatus("ENROLLED");
    setFormCertIssued(false);
    setFormCertNumber("");
    setShowCreateModal(true);
  };

  const openEditModal = (e: AcademyEnrollment) => {
    setEditingEnrollment(e);
    setFormStudentName(e.studentName);
    setFormStudentEmail(e.studentEmail);
    setFormCourseTitle(e.courseTitle);
    setFormCohort(e.cohort);
    setFormProgress(e.progressPercent);
    setFormStatus(e.status);
    setFormCertIssued(e.certificateIssued);
    setFormCertNumber(e.certificateNumber || "");
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentName.trim() || !formStudentEmail.trim()) return;

    try {
      platformApi.createAcademyEnrollment({
        studentName: formStudentName.trim(),
        studentEmail: formStudentEmail.trim(),
        courseTitle: formCourseTitle,
        cohort: formCohort,
        progressPercent: Number(formProgress),
        status: formStatus,
        certificateIssued: formCertIssued,
        certificateNumber: formCertIssued
          ? formCertNumber || `HT-CERT-${Date.now().toString().slice(-6)}`
          : undefined,
        certificateDate: formCertIssued ? new Date().toISOString() : undefined,
      });
      setShowCreateModal(false);
      setActionFeedback("Student enrollment recorded.");
      setTimeout(() => setActionFeedback(null), 3500);
      loadStudents();
    } catch (err: any) {
      alert(err.message || "Failed to create student enrollment");
    }
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnrollment) return;

    try {
      platformApi.updateAcademyEnrollment(editingEnrollment.id, {
        studentName: formStudentName.trim(),
        studentEmail: formStudentEmail.trim(),
        courseTitle: formCourseTitle,
        cohort: formCohort,
        progressPercent: Number(formProgress),
        status: formStatus,
        certificateIssued: formCertIssued,
        certificateNumber: formCertIssued
          ? formCertNumber || `HT-CERT-${Date.now().toString().slice(-6)}`
          : undefined,
        certificateDate: formCertIssued
          ? editingEnrollment.certificateDate || new Date().toISOString()
          : undefined,
      });
      setEditingEnrollment(null);
      setActionFeedback("Student enrollment updated.");
      setTimeout(() => setActionFeedback(null), 3500);
      loadStudents();
    } catch (err: any) {
      alert(err.message || "Failed to update enrollment");
    }
  };

  const handleDeleteStudent = () => {
    if (!deletingEnrollment) return;
    try {
      platformApi.deleteAcademyEnrollment(deletingEnrollment.id);
      setDeletingEnrollment(null);
      setActionFeedback(`Enrollment for ${deletingEnrollment.studentName} deleted.`);
      setTimeout(() => setActionFeedback(null), 3500);
      loadStudents();
    } catch (err: any) {
      alert(err.message || "Failed to delete enrollment");
    }
  };

  const handleToggleCert = (enrollment: AcademyEnrollment) => {
    const nextCert = !enrollment.certificateIssued;
    platformApi.updateAcademyEnrollment(enrollment.id, {
      certificateIssued: nextCert,
      certificateNumber: nextCert ? `HT-CERT-${Date.now().toString().slice(-6)}` : undefined,
      certificateDate: nextCert ? new Date().toISOString() : undefined,
    });
    loadStudents();
  };

  const handleQuickStatus = (enrollment: AcademyEnrollment, nextStatus: AcademyEnrollment["status"]) => {
    platformApi.updateAcademyEnrollment(enrollment.id, {
      status: nextStatus,
      progressPercent: nextStatus === "COMPLETED" ? 100 : enrollment.progressPercent,
      certificateIssued: nextStatus === "COMPLETED" ? true : enrollment.certificateIssued,
      certificateNumber:
        nextStatus === "COMPLETED" && !enrollment.certificateNumber
          ? `HT-CERT-${Date.now().toString().slice(-6)}`
          : enrollment.certificateNumber,
    });
    loadStudents();
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
          onClick={() => handleToggleCert(s)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition ${
            s.certificateIssued
              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
              : "bg-gray-100 text-body-color hover:bg-gray-200"
          }`}
          title="Click to toggle certificate"
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
          <button
            type="button"
            onClick={() => setViewingEnrollment(s)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-dark dark:hover:text-white transition"
            title="View Student"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openEditModal(s)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit Enrollment"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {s.status !== "COMPLETED" ? (
            <button
              type="button"
              onClick={() => handleQuickStatus(s, "COMPLETED")}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Graduate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleQuickStatus(s, "IN_PROGRESS")}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-body-color hover:bg-gray-200 transition"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setDeletingEnrollment(s)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Enrollment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
        {/* Top Header & New Student Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white">Academy Student Administration</h2>
            <p className="text-xs text-body-color">Manage cohorts, progress tracking, graduations, and certificates.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Student</span>
          </button>
        </div>

        {/* Action feedback */}
        {actionFeedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionFeedback}</span>
          </div>
        )}

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

        {/* View Student Modal */}
        {viewingEnrollment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">{viewingEnrollment.studentName}</h3>
                    <p className="text-xs text-body-color">{viewingEnrollment.studentEmail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingEnrollment(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs bg-gray-50 dark:bg-gray-dark p-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-body-color">Enrolled Course:</span>
                  <span className="font-bold text-dark dark:text-white text-right max-w-[200px]">{viewingEnrollment.courseTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-color">Cohort:</span>
                  <span className="font-mono font-bold text-primary">{viewingEnrollment.cohort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-color">Progress:</span>
                  <span className="font-bold text-dark dark:text-white">{viewingEnrollment.progressPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-color">Status:</span>
                  <span className="font-bold text-primary">{viewingEnrollment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-color">Certificate:</span>
                  <span className="font-bold text-purple-600">
                    {viewingEnrollment.certificateIssued ? viewingEnrollment.certificateNumber || "Issued" : "Not Issued"}
                  </span>
                </div>
                {viewingEnrollment.enrolledAt && (
                  <div className="flex justify-between">
                    <span className="text-body-color">Enrolled Date:</span>
                    <span className="text-body-color">{new Date(viewingEnrollment.enrolledAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const e = viewingEnrollment;
                    setViewingEnrollment(null);
                    openEditModal(e);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition"
                >
                  Edit Student
                </button>
                <button
                  type="button"
                  onClick={() => setViewingEnrollment(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Student Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Enroll New Student</h3>
                    <p className="text-xs text-body-color">Register a student into the Hambak Academy portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Okon"
                      value={formStudentName}
                      onChange={(e) => setFormStudentName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Student Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="samuel@gmail.com"
                      value={formStudentEmail}
                      onChange={(e) => setFormStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Course Title *</label>
                    <select
                      value={formCourseTitle}
                      onChange={(e) => setFormCourseTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="Professional Web Development Bootcamp">Professional Web Development Bootcamp</option>
                      <option value="Data Analytics & Python Masterclass">Data Analytics & Python Masterclass</option>
                      <option value="Computer Fundamentals & Office Productivity">Computer Fundamentals & Office Productivity</option>
                      <option value="Cybersecurity Essentials & Network Defense">Cybersecurity Essentials & Network Defense</option>
                      <option value="Graphic Design & UI/UX Essentials">Graphic Design & UI/UX Essentials</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Cohort Batch</label>
                    <input
                      type="text"
                      value={formCohort}
                      onChange={(e) => setFormCohort(e.target.value)}
                      placeholder="e.g. Q4-2026 or Batch-A"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Progress (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formProgress}
                      onChange={(e) => setFormProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="ENROLLED">ENROLLED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="DROPPED">DROPPED</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-dark rounded-xl space-y-2 border border-stroke dark:border-strokedark">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-dark dark:text-white cursor-pointer" htmlFor="certCheckbox">
                      Issue Academy Certificate
                    </label>
                    <input
                      id="certCheckbox"
                      type="checkbox"
                      checked={formCertIssued}
                      onChange={(e) => setFormCertIssued(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                  </div>
                  {formCertIssued && (
                    <div>
                      <input
                        type="text"
                        placeholder="Certificate No (leave blank to auto-generate)"
                        value={formCertNumber}
                        onChange={(e) => setFormCertNumber(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Enroll Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {editingEnrollment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit Student Enrollment</h3>
                    <p className="text-xs text-body-color">{editingEnrollment.studentName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingEnrollment(null)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateStudent} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formStudentName}
                      onChange={(e) => setFormStudentName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Student Email *</label>
                    <input
                      type="email"
                      required
                      value={formStudentEmail}
                      onChange={(e) => setFormStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Course Title</label>
                    <select
                      value={formCourseTitle}
                      onChange={(e) => setFormCourseTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="Professional Web Development Bootcamp">Professional Web Development Bootcamp</option>
                      <option value="Data Analytics & Python Masterclass">Data Analytics & Python Masterclass</option>
                      <option value="Computer Fundamentals & Office Productivity">Computer Fundamentals & Office Productivity</option>
                      <option value="Cybersecurity Essentials & Network Defense">Cybersecurity Essentials & Network Defense</option>
                      <option value="Graphic Design & UI/UX Essentials">Graphic Design & UI/UX Essentials</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Cohort Batch</label>
                    <input
                      type="text"
                      value={formCohort}
                      onChange={(e) => setFormCohort(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Progress (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formProgress}
                      onChange={(e) => setFormProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="ENROLLED">ENROLLED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="DROPPED">DROPPED</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-dark rounded-xl space-y-2 border border-stroke dark:border-strokedark">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-dark dark:text-white cursor-pointer" htmlFor="editCertCheckbox">
                      Certificate Issued
                    </label>
                    <input
                      id="editCertCheckbox"
                      type="checkbox"
                      checked={formCertIssued}
                      onChange={(e) => setFormCertIssued(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                  </div>
                  {formCertIssued && (
                    <div>
                      <input
                        type="text"
                        placeholder="Certificate Number"
                        value={formCertNumber}
                        onChange={(e) => setFormCertNumber(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingEnrollment(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
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

        {/* Delete Student Modal */}
        {deletingEnrollment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Enrollment</h3>
                  <p className="text-xs text-body-color">Permanently remove student from roster</p>
                </div>
              </div>

              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete <strong className="text-dark dark:text-white">{deletingEnrollment.studentName}</strong> from <span className="font-semibold text-dark dark:text-white">{deletingEnrollment.courseTitle}</span>? All module progress will be removed.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingEnrollment(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStudent}
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

