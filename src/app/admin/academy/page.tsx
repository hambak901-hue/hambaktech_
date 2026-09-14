"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  User,
  Mail,
  FileCheck,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  FileText,
  ShieldCheck,
  QrCode,
  Search,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Phone,
  Calendar,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import QRCodeView from "@/components/common/QRCodeView";
import platformApi from "@/lib/api-client";
import {
  CourseRecord,
  InstructorRecord,
  AcademyEnrollment,
  CourseAssignmentRecord,
  CertificateRecord,
  StudentIdCardRecord,
} from "@/types/platform";

export default function AdminAcademyPage() {
  const [activeTab, setActiveTab] = useState<
    "courses" | "instructors" | "enrollments" | "assignments" | "certificates" | "idcards"
  >("courses");

  // State collections
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [instructors, setInstructors] = useState<InstructorRecord[]>([]);
  const [enrollments, setEnrollments] = useState<AcademyEnrollment[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignmentRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [idCards, setIdCards] = useState<StudentIdCardRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    code: "",
    description: "",
    duration: "8 Weeks",
    price: 35000,
    schedule: "Mon, Wed, Fri (10 AM - 1 PM)",
    instructorId: "",
  });

  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [instructorForm, setInstructorForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "Web Engineering & Software",
    bio: "",
  });

  // Grading modal
  const [gradingSubmission, setGradingSubmission] = useState<{
    assignmentId: string;
    submissionId: string;
    studentName: string;
    content: string;
    maxScore: number;
    score: number;
    feedback: string;
  } | null>(null);

  // Load all admin academy collections
  const loadData = async () => {
    try {
      setLoading(true);
      const [cList, iList, eList, aList, certList, idList] = await Promise.all([
        platformApi.fetchCourses(),
        platformApi.fetchInstructors(),
        platformApi.fetchRemoteEnrollments(),
        platformApi.fetchAssignments(),
        platformApi.fetchCertificates(),
        platformApi.fetchIdCards(),
      ]);

      setCourses(cList);
      setInstructors(iList);
      setEnrollments(eList);
      setAssignments(aList);
      setCertificates(certList);
      setIdCards(idList);

      if (iList.length > 0 && !courseForm.instructorId) {
        setCourseForm((prev) => ({ ...prev, instructorId: iList[0].id }));
      }
    } catch (err: any) {
      console.error("Admin academy data load error:", err);
      setFeedback({ type: "error", message: "Failed to load academy administrative records" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Course Creation
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/academy/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create course");

      setFeedback({ type: "success", message: `Course "${json.data.title}" published to catalog!` });
      setShowCourseModal(false);
      setCourseForm({
        title: "",
        code: "",
        description: "",
        duration: "8 Weeks",
        price: 35000,
        schedule: "Mon, Wed, Fri (10 AM - 1 PM)",
        instructorId: instructors[0]?.id || "",
      });
      await loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  // Handle Instructor Creation
  const handleSaveInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/academy/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instructorForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create instructor");

      setFeedback({ type: "success", message: `Instructor ${json.data.fullName} registered successfully!` });
      setShowInstructorModal(false);
      setInstructorForm({
        fullName: "",
        email: "",
        phone: "",
        specialization: "Web Engineering & Software",
        bio: "",
      });
      await loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  // Handle Grade Submission
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    try {
      const res = await fetch(`/api/academy/assignments/${gradingSubmission.assignmentId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: gradingSubmission.submissionId,
          score: Number(gradingSubmission.score),
          feedback: gradingSubmission.feedback,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to submit grade");

      setFeedback({ type: "success", message: "Assignment grade and evaluation feedback saved!" });
      setGradingSubmission(null);
      await loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  return (
    <AdminLayout
      pageTitle="Academy Administration & Academic Registry"
      breadcrumbs={[{ label: "Operations" }, { label: "Academy" }]}
      actionButton={
        activeTab === "courses" ? (
          <button
            onClick={() => setShowCourseModal(true)}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        ) : activeTab === "instructors" ? (
          <button
            onClick={() => setShowInstructorModal(true)}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Instructor</span>
          </button>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-xs opacity-75 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">Courses</span>
            <span className="text-xl font-bold text-dark dark:text-white mt-1 block">{courses.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">Instructors</span>
            <span className="text-xl font-bold text-dark dark:text-white mt-1 block">{instructors.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">Enrollments</span>
            <span className="text-xl font-bold text-dark dark:text-white mt-1 block">{enrollments.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">Assignments</span>
            <span className="text-xl font-bold text-dark dark:text-white mt-1 block">{assignments.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">Certificates</span>
            <span className="text-xl font-bold text-dark dark:text-white mt-1 block">{certificates.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">ID Cards</span>
            <span className="text-xl font-bold text-dark dark:text-white mt-1 block">{idCards.length}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stroke dark:border-strokedark pb-2">
          {[
            { id: "courses", label: "Courses & Curriculum", icon: BookOpen },
            { id: "instructors", label: "Instructors", icon: User },
            { id: "enrollments", label: "Students & Enrollments", icon: GraduationCap },
            { id: "assignments", label: "Grading Desk", icon: FileText },
            { id: "certificates", label: "Certificates & Verification", icon: Award },
            { id: "idcards", label: "Student ID Cards", icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                  isCurrent
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white dark:bg-dark text-body-color hover:text-dark dark:hover:text-white border border-stroke dark:border-strokedark"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: COURSES & CURRICULUM */}
        {activeTab === "courses" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Active Academic Programs</h3>
                <p className="text-xs text-body-color">Manage accredited course offerings, pricing, and curriculum modules.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-5 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-900/30 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {course.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        ₦{(course.price ?? course.tuitionFee ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-dark dark:text-white">{course.title}</h4>
                    <p className="text-xs text-body-color line-clamp-2">{course.description || course.shortDescription || ""}</p>

                    <div className="pt-2 border-t border-stroke dark:border-strokedark text-xs text-body-color space-y-1">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-semibold text-dark dark:text-white">{course.duration || `${course.durationWeeks || 0} Weeks`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Curriculum Modules:</span>
                        <span className="font-semibold text-dark dark:text-white">{course.modules?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Schedule:</span>
                        <span className="font-semibold text-dark dark:text-white truncate max-w-[150px]">{course.schedule || "Flexible Sessions"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: INSTRUCTORS */}
        {activeTab === "instructors" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Instructors & Mentors</h3>
                <p className="text-xs text-body-color">Manage faculty credentials and assigned training disciplines.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {instructors.map((inst) => (
                <div
                  key={inst.id}
                  className="p-5 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-900/30 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {(inst.fullName || inst.name || "I").charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-dark dark:text-white">{inst.fullName || inst.name}</h4>
                      <span className="text-[11px] text-body-color block">{inst.specialization}</span>
                    </div>
                  </div>

                  <p className="text-xs text-body-color line-clamp-2">{inst.bio}</p>

                  <div className="pt-2 border-t border-stroke dark:border-strokedark text-xs text-body-color space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span>{inst.email}</span>
                    </div>
                    {inst.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span>{inst.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS & ENROLLMENTS */}
        {activeTab === "enrollments" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Active Student Enrollments</h3>
                <p className="text-xs text-body-color">Live cohort registry, completion tracking, and student status.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark text-body-color uppercase font-bold text-[11px]">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Program</th>
                    <th className="pb-3">Cohort</th>
                    <th className="pb-3">Progress</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke/60 dark:divide-strokedark/60">
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                      <td className="py-3.5">
                        <span className="font-bold text-dark dark:text-white block">{enr.studentName}</span>
                        <span className="text-[11px] text-body-color">{enr.studentEmail}</span>
                      </td>
                      <td className="py-3.5 font-medium">{enr.courseTitle}</td>
                      <td className="py-3.5">{enr.cohort}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${enr.progressPercent}%` }} />
                          </div>
                          <span className="font-bold">{enr.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                          {enr.status}
                        </span>
                      </td>
                      <td className="py-3.5">
                        {enr.certificateIssued ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Issued
                          </span>
                        ) : (
                          <span className="text-body-color">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ASSIGNMENTS & GRADING DESK */}
        {activeTab === "assignments" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Assignment & Project Grading Desk</h3>
                <p className="text-xs text-body-color">Review student submissions and assign official continuous assessment grades.</p>
              </div>
            </div>

            <div className="space-y-6">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-5 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-900/30 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-dark dark:text-white">{assignment.title}</h4>
                      <p className="text-xs text-body-color">{assignment.description}</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                      Max: {assignment.maxScore} pts
                    </span>
                  </div>

                  {/* Submissions List */}
                  <div className="space-y-2 pt-2 border-t border-stroke dark:border-strokedark">
                    <h5 className="text-xs font-bold text-body-color uppercase">Student Submissions</h5>
                    {assignment.submissions && assignment.submissions.length > 0 ? (
                      assignment.submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-dark dark:text-white block">{sub.studentName}</span>
                            <span className="text-body-color text-[11px] line-clamp-1">{sub.content}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {sub.graded ? (
                              <span className="font-bold text-emerald-600">
                                {sub.score} / {assignment.maxScore} pts
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  setGradingSubmission({
                                    assignmentId: assignment.id,
                                    submissionId: sub.id,
                                    studentName: sub.studentName || "Student",
                                    content: sub.content,
                                    maxScore: assignment.maxScore,
                                    score: assignment.maxScore,
                                    feedback: "Excellent practical implementation.",
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary/90 transition"
                              >
                                Grade Submission
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-body-color italic">No student submissions yet for this task.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CERTIFICATES & VERIFICATION */}
        {activeTab === "certificates" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Academic Certificates Registry</h3>
                <p className="text-xs text-body-color">All issued credentials linked to public verification URLs and QR codes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {certificates.map((cert) => {
                const verifyUrl = `https://hambaktech.com.ng/verify/certificate/${cert.certificateNumber}`;

                return (
                  <div
                    key={cert.id}
                    className="p-5 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50/60 dark:bg-gray-900/40 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="font-mono font-bold text-xs text-primary">{cert.certificateNumber}</span>
                      </div>
                      <h4 className="font-bold text-sm text-dark dark:text-white">{cert.studentName}</h4>
                      <p className="text-xs text-body-color">{cert.courseTitle} &bull; {cert.grade}</p>
                      <span className="text-[11px] text-body-color block">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/verify/certificate/${cert.certificateNumber}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1"
                      >
                        <span>Test Public Verification</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-stroke shrink-0">
                      <QRCodeView value={verifyUrl} size={70} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: STUDENT ID CARDS */}
        {activeTab === "idcards" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Student Identification Cards</h3>
                <p className="text-xs text-body-color">Active matriculation cards for lab access and biometric attendance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {idCards.map((card) => (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-900/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{card.cardNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {card.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-dark dark:text-white">{card.studentName}</h4>
                    <span className="text-xs text-body-color">{card.courseTitle}</span>
                  </div>

                  <div className="text-[11px] text-body-color pt-2 border-t border-stroke dark:border-strokedark flex justify-between">
                    <span>Cohort: {card.cohort}</span>
                    <span>Valid: {card.validUntil || card.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Create Course */}
        {showCourseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <h4 className="text-base font-bold text-dark dark:text-white">Create New Course Offering</h4>
                <button onClick={() => setShowCourseModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">✕</button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g. Cybersecurity Fundamentals"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">Course Code</label>
                    <input
                      type="text"
                      required
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      placeholder="e.g. HT-CRS-SEC"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Tuition Fee (₦)</label>
                    <input
                      type="number"
                      required
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Comprehensive program curriculum outline..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">Duration</label>
                    <input
                      type="text"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Lead Instructor</label>
                    <select
                      value={courseForm.instructorId}
                      onChange={(e) => setCourseForm({ ...courseForm, instructorId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    >
                      {instructors.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button type="button" onClick={() => setShowCourseModal(false)} className="px-4 py-2 rounded-xl border border-stroke font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition">
                    Publish Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Instructor */}
        {showInstructorModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <h4 className="text-base font-bold text-dark dark:text-white">Add Faculty Instructor</h4>
                <button onClick={() => setShowInstructorModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">✕</button>
              </div>

              <form onSubmit={handleSaveInstructor} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={instructorForm.fullName}
                    onChange={(e) => setInstructorForm({ ...instructorForm, fullName: e.target.value })}
                    placeholder="e.g. Engr. Babatunde Lawal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={instructorForm.email}
                      onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                      placeholder="instructor@hambaktech.com.ng"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Phone</label>
                    <input
                      type="tel"
                      value={instructorForm.phone}
                      onChange={(e) => setInstructorForm({ ...instructorForm, phone: e.target.value })}
                      placeholder="08033221100"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    value={instructorForm.specialization}
                    onChange={(e) => setInstructorForm({ ...instructorForm, specialization: e.target.value })}
                    placeholder="e.g. Full-Stack Web & Mobile Architecture"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Biography</label>
                  <textarea
                    rows={3}
                    value={instructorForm.bio}
                    onChange={(e) => setInstructorForm({ ...instructorForm, bio: e.target.value })}
                    placeholder="Instructor background and industry credentials..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button type="button" onClick={() => setShowInstructorModal(false)} className="px-4 py-2 rounded-xl border border-stroke font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition">
                    Register Instructor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Grading Submission */}
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <h4 className="text-base font-bold text-dark dark:text-white">
                  Grade Student Submission: {gradingSubmission.studentName}
                </h4>
                <button onClick={() => setGradingSubmission(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">✕</button>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark text-xs">
                <span className="font-bold text-dark dark:text-white block mb-1">Student Answer:</span>
                <p className="text-body-color">{gradingSubmission.content}</p>
              </div>

              <form onSubmit={handleSaveGrade} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">
                    Score (out of {gradingSubmission.maxScore})
                  </label>
                  <input
                    type="number"
                    max={gradingSubmission.maxScore}
                    min={0}
                    required
                    value={gradingSubmission.score}
                    onChange={(e) => setGradingSubmission({ ...gradingSubmission, score: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Instructor Feedback</label>
                  <textarea
                    rows={3}
                    required
                    value={gradingSubmission.feedback}
                    onChange={(e) => setGradingSubmission({ ...gradingSubmission, feedback: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button type="button" onClick={() => setGradingSubmission(null)} className="px-4 py-2 rounded-xl border border-stroke font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition">
                    Save Grade & Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
