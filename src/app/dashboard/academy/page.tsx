"use client";

import React, { useState, useEffect } from "react";
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
  FileText,
  Send,
  User,
  ShieldCheck,
  ExternalLink,
  CreditCard,
  AlertCircle,
  QrCode,
  School,
  Check,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import QRCodeView from "@/components/common/QRCodeView";
import platformApi from "@/lib/api-client";
import {
  CourseRecord,
  AcademyEnrollment,
  InstructorRecord,
  CourseAssignmentRecord,
  AssignmentSubmissionRecord,
  CertificateRecord,
  StudentIdCardRecord,
} from "@/types/platform";

export default function DashboardAcademyPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [enrollments, setEnrollments] = useState<AcademyEnrollment[]>([]);
  const [instructors, setInstructors] = useState<InstructorRecord[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignmentRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [idCards, setIdCards] = useState<StudentIdCardRecord[]>([]);
  
  const [activeEnrollmentId, setActiveEnrollmentId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"lessons" | "assignments" | "certificate" | "idcard">("lessons");

  // Assignment Submission Modal
  const [submittingAssignment, setSubmittingAssignment] = useState<CourseAssignmentRecord | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFileUrl, setSubmissionFileUrl] = useState("");
  const [submittingState, setSubmittingState] = useState(false);

  // Enroll in New Course Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [payWithWallet, setPayWithWallet] = useState(true);
  const [studentPhone, setStudentPhone] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);

  // Load all academy data
  const loadData = async () => {
    try {
      setLoading(true);
      const [cList, eList, iList, aList, certList, idList] = await Promise.all([
        platformApi.fetchCourses(),
        platformApi.fetchRemoteEnrollments(),
        platformApi.fetchInstructors(),
        platformApi.fetchAssignments(),
        platformApi.fetchCertificates(),
        platformApi.fetchIdCards(),
      ]);

      setCourses(cList);
      setEnrollments(eList);
      setInstructors(iList);
      setAssignments(aList);
      setCertificates(certList);
      setIdCards(idList);

      if (eList.length > 0 && !activeEnrollmentId) {
        setActiveEnrollmentId(eList[0].id);
      }
      if (cList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(cList[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load academy data:", err);
      setFeedback({ type: "error", message: "Failed to load latest academy data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeEnrollment =
    enrollments.find((e) => e.id === activeEnrollmentId) || enrollments[0];
  const activeCourse = courses.find((c) => c.id === activeEnrollment?.courseId) || courses[0];
  const activeInstructor = instructors.find((i) => i.id === activeCourse?.instructorId) || instructors[0];
  const activeCertificate = certificates.find(
    (c) => c.enrollmentId === activeEnrollment?.id || c.courseId === activeCourse?.id
  );
  const activeIdCard = idCards.find((id) => id.courseId === activeCourse?.id) || idCards[0];

  // Handle Mark Lesson as Complete
  const handleToggleLesson = async (lessonId: string, moduleOrder: number) => {
    if (!activeEnrollment) return;
    try {
      const updated = await platformApi.updateLessonProgress(activeEnrollment.id, lessonId, moduleOrder);
      setEnrollments((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setFeedback({ type: "success", message: "Lesson progress updated successfully!" });
      setTimeout(() => setFeedback(null), 3000);
      // Re-fetch certificates in case completed
      const certList = await platformApi.fetchCertificates();
      setCertificates(certList);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update lesson" });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Handle Assignment Submission
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !activeEnrollment) return;
    try {
      setSubmittingState(true);
      await platformApi.submitAssignmentRemote({
        assignmentId: submittingAssignment.id,
        enrollmentId: activeEnrollment.id,
        content: submissionContent,
        fileUrl: submissionFileUrl || undefined,
      });
      setFeedback({ type: "success", message: "Assignment submitted for instructor review!" });
      setSubmittingAssignment(null);
      setSubmissionContent("");
      setSubmissionFileUrl("");
      // Reload assignments
      const aList = await platformApi.fetchAssignments();
      setAssignments(aList);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Submission failed" });
    } finally {
      setSubmittingState(false);
    }
  };

  // Handle New Enrollment
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      setEnrollLoading(true);
      const res = await platformApi.enrollCourseRemote(selectedCourseId, {
        payWithWallet,
        studentPhone: studentPhone || undefined,
      });
      setFeedback({
        type: "success",
        message: `Successfully enrolled in ${res.courseTitle}! Your seat and ID card have been generated.`,
      });
      setShowEnrollModal(false);
      await loadData();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Enrollment failed" });
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <DashboardLayout
      pageTitle="Academy Student Portal & Lab Sessions"
      breadcrumbs={[{ label: "Academy" }]}
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

        {/* Top Active Enrollment Hero */}
        {activeEnrollment && activeCourse ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-white shadow-xl shadow-primary/15 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Cohort: {activeEnrollment.cohort}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                    Status: {activeEnrollment.status}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {activeCourse.title}
                </h2>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  {activeCourse.description}
                </p>

                {/* Progress Bar */}
                <div className="pt-2 max-w-md">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>Curriculum Completion</span>
                    <span>{activeEnrollment.progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/25 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, activeEnrollment.progressPercent)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Controls & Multi-course switcher */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 shrink-0">
                {enrollments.length > 1 && (
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 uppercase mb-1">
                      Switch Active Program
                    </label>
                    <select
                      value={activeEnrollmentId}
                      onChange={(e) => setActiveEnrollmentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/15 backdrop-blur-md text-white text-xs border border-white/20 font-semibold focus:outline-none"
                    >
                      {enrollments.map((enr) => (
                        <option key={enr.id} value={enr.id} className="text-dark">
                          {enr.courseTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => setShowEnrollModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-white text-primary font-bold text-xs hover:bg-white/90 transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll in Another Program</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-dark dark:text-white">You are not yet enrolled in any course</h2>
            <p className="text-xs text-body-color mt-1 mb-4">
              Explore our accredited ICT courses in Web Development, Graphic Design, Networking, and Computer Literacy.
            </p>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition"
            >
              Browse & Enroll in Course
            </button>
          </div>
        )}

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-body-color uppercase tracking-wider block">Lab Session</span>
                <h3 className="text-sm font-bold text-dark dark:text-white">
                  {activeCourse?.schedule || "Mon, Wed, Fri (10 AM - 1 PM)"}
                </h3>
              </div>
            </div>
            <p className="text-xs text-body-color mt-2">
              Workstation Lab A &bull; HambakTech Ibeju-Lekki Innovation Hub.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-body-color uppercase tracking-wider block">Lead Instructor</span>
                <h3 className="text-sm font-bold text-dark dark:text-white">
                  {activeInstructor?.fullName || "Senior Instructor"}
                </h3>
              </div>
            </div>
            <p className="text-xs text-body-color mt-2">
              {activeInstructor?.specialization || "Certified Computer Instructor"} &bull; {activeInstructor?.email || "academy@hambaktech.com.ng"}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-body-color uppercase tracking-wider block">Credential Status</span>
                <h3 className="text-sm font-bold text-dark dark:text-white">
                  {activeCertificate ? "Verified Certificate Issued" : `${activeEnrollment?.progressPercent || 0}% Progress`}
                </h3>
              </div>
            </div>
            <p className="text-xs text-body-color mt-2">
              {activeCertificate
                ? `Serial Number: ${activeCertificate.certificateNumber}`
                : "Complete all curriculum modules and assignments to unlock certificate."}
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stroke dark:border-strokedark pb-2">
          {[
            { id: "lessons", label: "Curriculum & Lessons", icon: BookOpen },
            { id: "assignments", label: "Assignments & Projects", icon: FileText },
            { id: "certificate", label: "Official Certificate", icon: Award },
            { id: "idcard", label: "Student ID Card", icon: QrCode },
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

        {/* TAB 1: CURRICULUM & LESSONS */}
        {activeTab === "lessons" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                  Course Modules & Interactive Checklist
                </h3>
                <p className="text-xs text-body-color">
                  Check off lessons as you complete hands-on practicals and lab exercises.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-primary">
                {activeCourse?.modules?.length || 0} Modules Total
              </span>
            </div>

            <div className="space-y-4">
              {activeCourse?.modules?.map((mod, modIdx) => {
                const isModuleCompleted = activeEnrollment?.completedModules?.includes(modIdx);

                return (
                  <div
                    key={mod.id || modIdx}
                    className="p-5 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50/60 dark:bg-gray-900/40"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isModuleCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-body-color"
                          }`}
                        >
                          {modIdx + 1}
                        </div>
                        <h4 className="text-sm font-bold text-dark dark:text-white">{mod.title}</h4>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isModuleCompleted
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-gray-200 dark:bg-gray-700 text-body-color"
                        }`}
                      >
                        {isModuleCompleted ? "Module Completed" : "In Progress"}
                      </span>
                    </div>

                    {/* Lessons list inside this module */}
                    <div className="space-y-2 mt-3 pl-2 sm:pl-10">
                      {mod.lessons?.map((lesson) => {
                        const isLessonDone = isModuleCompleted || false;

                        return (
                          <div
                            key={lesson.id}
                            className="p-3 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleLesson(lesson.id, modIdx)}
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                                  isLessonDone
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "border-stroke dark:border-strokedark hover:border-primary"
                                }`}
                              >
                                {isLessonDone && <Check className="w-3.5 h-3.5" />}
                              </button>
                              <span className={isLessonDone ? "line-through text-body-color" : "font-medium text-dark dark:text-white"}>
                                {lesson.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-body-color flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.durationMinutes} mins
                              </span>
                              <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-body-color">
                                {lesson.contentType}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNMENTS & TASKS */}
        {activeTab === "assignments" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                Continuous Assessments & Capstone Projects
              </h3>
              <p className="text-xs text-body-color">
                Complete and submit project milestones for grading and mentor feedback.
              </p>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment) => {
                const submission = assignment.submissions?.find(
                  (s) => s.enrollmentId === activeEnrollment?.id
                );

                return (
                  <div
                    key={assignment.id}
                    className="p-5 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-900/30 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-bold text-dark dark:text-white">{assignment.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          Max Score: {assignment.maxScore} pts
                        </span>
                        {submission?.graded ? (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Score: {submission.score} / {assignment.maxScore}
                          </span>
                        ) : submission ? (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            Under Instructor Review
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-body-color">
                            Not Submitted
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-body-color leading-relaxed">{assignment.description}</p>

                    {/* Submission Details or Action */}
                    {submission ? (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-dark dark:text-white">Your Submission:</span>
                          <span className="text-[11px] text-body-color">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-body-color">{submission.content}</p>
                        {submission.feedback && (
                          <div className="mt-2 pt-2 border-t border-stroke dark:border-strokedark text-primary font-medium">
                            <span className="font-bold">Mentor Feedback: </span>
                            {submission.feedback}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSubmittingAssignment(assignment);
                            setSubmissionContent("");
                            setSubmissionFileUrl("");
                          }}
                          className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Project Solution</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: OFFICIAL CERTIFICATE & VERIFICATION */}
        {activeTab === "certificate" && (
          <div className="space-y-6">
            {activeCertificate ? (
              <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-stroke dark:border-strokedark">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Academic Credential
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-dark dark:text-white">
                        {activeCertificate.courseTitle}
                      </h3>
                      <p className="text-xs text-body-color mt-0.5">
                        Issued to: <span className="font-bold text-dark dark:text-white">{activeCertificate.studentName}</span> &bull; Standing: {activeCertificate.grade}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-stroke dark:border-strokedark shrink-0">
                    <QRCodeView
                      value={`https://hambaktech.com.ng/verify/certificate/${activeCertificate.certificateNumber}`}
                      size={100}
                    />
                    <span className="text-[10px] font-mono text-body-color mt-1">
                      {activeCertificate.certificateNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-xs">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark">
                    <span className="text-body-color block mb-0.5">Certificate Number</span>
                    <span className="font-bold font-mono text-primary text-sm">
                      {activeCertificate.certificateNumber}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark">
                    <span className="text-body-color block mb-0.5">Issue Date</span>
                    <span className="font-bold text-dark dark:text-white text-sm">
                      {new Date(activeCertificate.issuedAt).toLocaleDateString("en-NG", { dateStyle: "long" })}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark">
                    <span className="text-body-color block mb-0.5">Verification URL</span>
                    <span className="font-mono text-[11px] text-body-color truncate block">
                      hambaktech.com.ng/verify/certificate/{activeCertificate.certificateNumber}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stroke dark:border-strokedark">
                  <Link
                    href={`/verify/certificate/${encodeURIComponent(activeCertificate.certificateNumber)}`}
                    target="_blank"
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Public Verification Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download / Print Credential</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center">
                <Award className="w-12 h-12 text-body-color/40 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-dark dark:text-white">Certificate Pending Completion</h3>
                <p className="text-xs text-body-color mt-1 max-w-md mx-auto">
                  Your official certificate with verification QR code will be generated once your course progress reaches 100% and assignments are graded.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold">
                  Current Progress: {activeEnrollment?.progressPercent || 0}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DIGITAL STUDENT ID CARD */}
        {activeTab === "idcard" && (
          <div className="space-y-6">
            {activeIdCard ? (
              <div className="max-w-md mx-auto bg-gradient-to-br from-[#0A1D37] via-[#0E2A47] to-[#0A1D37] rounded-3xl border-2 border-primary/40 p-6 text-white shadow-2xl relative overflow-hidden">
                {/* ID Header */}
                <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                      H
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-tight">HambakTech Institute</h4>
                      <span className="text-[10px] text-white/70 block">Official Student Identity Card</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20">
                    {activeIdCard.status}
                  </span>
                </div>

                {/* ID Body */}
                <div className="flex items-center gap-4 my-4">
                  <div className="w-20 h-24 rounded-2xl bg-white/15 border border-white/30 flex flex-col items-center justify-center text-center p-1 shrink-0">
                    <User className="w-10 h-10 text-white/70" />
                    <span className="text-[9px] text-white/70 mt-1 uppercase font-bold">Photo</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-[10px] text-white/60 block uppercase">Student Name</span>
                      <h5 className="font-bold text-sm text-white">{activeIdCard.studentName}</h5>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/60 block uppercase">Matric No.</span>
                      <span className="font-mono font-bold text-primary-light">{activeIdCard.cardNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/60 block uppercase">Enrolled Program</span>
                      <span className="font-medium text-white/90 truncate block max-w-[180px]">{activeIdCard.courseTitle}</span>
                    </div>
                  </div>
                </div>

                {/* ID Footer */}
                <div className="pt-4 border-t border-white/20 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="text-white/60 block">Cohort & Validity</span>
                    <span className="font-semibold">{activeIdCard.cohort} &bull; Valid {activeIdCard.validUntil}</span>
                  </div>

                  <div className="bg-white p-1 rounded-lg">
                    <QRCodeView value={`https://hambaktech.com.ng/verify/id/${activeIdCard.cardNumber}`} size={45} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center">
                <QrCode className="w-12 h-12 text-body-color/40 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-dark dark:text-white">ID Card in Production</h3>
                <p className="text-xs text-body-color mt-1">
                  Your physical PVC card and digital badge are prepared upon enrollment confirmation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal: Submit Assignment */}
        {submittingAssignment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <div>
                  <h4 className="text-base font-bold text-dark dark:text-white">
                    Submit Project: {submittingAssignment.title}
                  </h4>
                  <span className="text-xs text-body-color">Max points: {submittingAssignment.maxScore}</span>
                </div>
                <button
                  onClick={() => setSubmittingAssignment(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase mb-1.5">
                    Your Solution / Project Notes
                  </label>
                  <textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe your solution, implementation steps, and summary..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase mb-1.5">
                    GitHub / Google Drive / Figma Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={submissionFileUrl}
                    onChange={(e) => setSubmissionFileUrl(e.target.value)}
                    placeholder="https://github.com/... or https://figma.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setSubmittingAssignment(null)}
                    className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingState}
                    className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
                  >
                    {submittingState ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit for Review</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Enroll in Another Program */}
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <div>
                  <h4 className="text-base font-bold text-dark dark:text-white">Enroll in Academy Program</h4>
                  <span className="text-xs text-body-color">Reserve a workstation for upcoming cohort</span>
                </div>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase mb-1.5">
                    Select Program
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-semibold focus:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — ₦{c.price.toLocaleString()} ({c.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase mb-1.5">
                    Phone Number for SMS / WhatsApp Lab Notifications
                  </label>
                  <input
                    type="tel"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium focus:outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <div>
                      <span className="font-bold text-dark dark:text-white block">Settle via Student Wallet</span>
                      <span className="text-[11px] text-body-color">Automated receipt & admission clearance</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={payWithWallet}
                    onChange={(e) => setPayWithWallet(e.target.checked)}
                    className="w-4 h-4 rounded text-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                    className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={enrollLoading}
                    className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
                  >
                    {enrollLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Enrolling...</span>
                      </>
                    ) : (
                      <span>Confirm Enrollment</span>
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
