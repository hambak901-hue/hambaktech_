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
  Wallet,
  Receipt,
  Printer,
  Building2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Laptop,
  CheckCircle,
  HelpCircle,
  Copy,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import QRCodeView from "@/components/common/QRCodeView";
import platformApi from "@/lib/api-client";
import {
  CourseRecord,
  AcademyEnrollment,
  InstructorRecord,
  CourseAssignmentRecord,
  CertificateRecord,
  StudentIdCardRecord,
} from "@/types/platform";

interface AcademyInvoice {
  id: string;
  reference: string;
  courseTitle: string;
  courseId: string;
  studentName: string;
  studentPhone: string;
  regNumber: string;
  tuitionFee: number;
  materialsFee: number;
  labFee: number;
  totalAmount: number;
  status: "PAID" | "PENDING";
  paymentMethod: string;
  cohort: string;
  schedule: string;
  studyMode: string;
  createdAt: string;
}

export default function DashboardAcademyPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [enrollments, setEnrollments] = useState<AcademyEnrollment[]>([]);
  const [instructors, setInstructors] = useState<InstructorRecord[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignmentRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [idCards, setIdCards] = useState<StudentIdCardRecord[]>([]);
  const [invoices, setInvoices] = useState<AcademyInvoice[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(25000);

  const [activeEnrollmentId, setActiveEnrollmentId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "lessons" | "courses" | "invoices" | "assignments" | "certificate" | "idcard"
  >("lessons");

  // Assignment Submission Modal
  const [submittingAssignment, setSubmittingAssignment] = useState<CourseAssignmentRecord | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFileUrl, setSubmissionFileUrl] = useState("");
  const [submittingState, setSubmittingState] = useState(false);

  // Enroll in New Course Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollStep, setEnrollStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [payMethod, setPayMethod] = useState<"wallet" | "card" | "bank">("wallet");
  
  // Registration Form Fields
  const [studentFullName, setStudentFullName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [studentState, setStudentState] = useState("Lagos");
  const [studentGender, setStudentGender] = useState("Male");
  const [studentDob, setStudentDob] = useState("");
  const [highestEducation, setHighestEducation] = useState("High School / O Level");
  const [priorExperience, setPriorExperience] = useState("Beginner");
  const [cohortSchedule, setCohortSchedule] = useState("Morning (9:00 AM - 12:00 PM)");
  const [studyMode, setStudyMode] = useState<"In-Person Lab" | "Virtual / Online">("In-Person Lab");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [completedEnrollmentData, setCompletedEnrollmentData] = useState<any>(null);

  // Quick Fund Wallet Modal
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState<number>(50000);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Selected Invoice for Receipt View
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<AcademyInvoice | null>(null);

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

      // Populate initial invoices based on enrollments
      if (eList.length > 0) {
        const generatedInvoices: AcademyInvoice[] = eList.map((e, idx) => ({
          id: `inv-${e.id}`,
          reference: `HT-INV-ACAD-${202600 + idx}`,
          courseTitle: e.courseTitle || "Professional Academy Course",
          courseId: e.courseId,
          studentName: "Enrolled Student",
          studentPhone: "08147837664",
          regNumber: e.studentRegNumber || e.enrollmentNumber || e.id || "HT-STD-2026-001",
          tuitionFee: 50000,
          materialsFee: 5000,
          labFee: 5000,
          totalAmount: 60000,
          status: (e.paymentStatus as any) || "PAID",
          paymentMethod: "Digital Wallet",
          cohort: e.cohort || "Q4 2026",
          schedule: "Morning (9:00 AM - 12:00 PM)",
          studyMode: "In-Person Lab",
          createdAt: e.createdAt || new Date().toISOString(),
        }));
        setInvoices(generatedInvoices);
      }

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
  const activeCourse =
    courses.find((c) => c.id === activeEnrollment?.courseId) || courses[0];
  const activeInstructor =
    instructors.find((i) => i.id === activeCourse?.instructorId) || instructors[0];
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
      const aList = await platformApi.fetchAssignments();
      setAssignments(aList);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Submission failed" });
    } finally {
      setSubmittingState(false);
    }
  };

  // Handle Course Registration & Payment
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    const targetCourse = courses.find((c) => c.id === selectedCourseId);
    const tuition = targetCourse?.price ?? targetCourse?.tuitionFee ?? 50000;

    if (payMethod === "wallet" && walletBalance < tuition) {
      setFeedback({
        type: "error",
        message: `Insufficient wallet balance (₦${walletBalance.toLocaleString()}). Required: ₦${tuition.toLocaleString()}. Please fund your wallet.`,
      });
      setShowFundModal(true);
      return;
    }

    try {
      setEnrollLoading(true);
      const payload = {
        courseId: selectedCourseId,
        courseTitle: targetCourse?.title,
        tuitionFee: tuition,
        payWithWallet: payMethod === "wallet",
        studentName: studentFullName || "Registered Student",
        studentPhone: studentPhone || "08147837664",
        studentEmail: studentEmail,
        address: studentAddress,
        state: studentState,
        gender: studentGender,
        dob: studentDob,
        highestEducation,
        priorExperience,
        cohort: "Q4 2026",
        schedulePreference: cohortSchedule,
        studyMode,
        guardianName,
        guardianPhone,
      };

      const res = await platformApi.enrollCourseRemote(selectedCourseId, payload);

      // Debit local wallet if wallet was used
      if (payMethod === "wallet") {
        setWalletBalance((prev) => Math.max(0, prev - tuition));
      }

      // Record invoice
      const newInvoice: AcademyInvoice = {
        id: `inv-${Date.now()}`,
        reference: res.invoiceRef || `HT-INV-ACAD-${Math.floor(100000 + Math.random() * 900000)}`,
        courseTitle: targetCourse?.title || "Professional Program",
        courseId: selectedCourseId,
        studentName: studentFullName || "Registered Student",
        studentPhone: studentPhone || "08147837664",
        regNumber: res.studentRegNumber || "HT-STD-2026-NEW",
        tuitionFee: tuition,
        materialsFee: 5000,
        labFee: 5000,
        totalAmount: tuition + 10000,
        status: payMethod === "wallet" ? "PAID" : "PENDING",
        paymentMethod: payMethod === "wallet" ? "Digital Wallet" : payMethod === "card" ? "Paystack / Card" : "Bank Transfer",
        cohort: "Q4 2026",
        schedule: cohortSchedule,
        studyMode,
        createdAt: new Date().toISOString(),
      };

      setInvoices((prev) => [newInvoice, ...prev]);
      setCompletedEnrollmentData({ ...res, invoice: newInvoice, course: targetCourse });
      setEnrollStep(4);

      setFeedback({
        type: "success",
        message: `Successfully enrolled in ${targetCourse?.title}! Your workstation reservation and admission slip are ready.`,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Enrollment failed" });
    } finally {
      setEnrollLoading(false);
    }
  };

  // Quick Wallet Fund Handler
  const handleQuickFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fundAmount <= 0) return;
    setFundingLoading(true);
    setTimeout(() => {
      setWalletBalance((prev) => prev + Number(fundAmount));
      setFeedback({
        type: "success",
        message: `Wallet credited with ₦${Number(fundAmount).toLocaleString()} successfully!`,
      });
      setFundingLoading(false);
      setShowFundModal(false);
      setTimeout(() => setFeedback(null), 4000);
    }, 1000);
  };

  const copyBankDetails = () => {
    navigator.clipboard?.writeText("6428172910");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
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

        {/* Top Student Overview & Quick Wallet Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Student Status */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <School className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-body-color uppercase tracking-wider block">
                  Student Registration ID
                </span>
                <span className="text-sm font-extrabold text-dark dark:text-white font-mono">
                  {activeEnrollment?.studentRegNumber || "HT-STD-2026-0042"}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
              Active Cohort
            </span>
          </div>

          {/* Card 2: Student Digital Wallet */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-body-color uppercase tracking-wider block">
                  Student Tuition Wallet
                </span>
                <span className="text-lg font-black text-dark dark:text-white">
                  ₦{walletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowFundModal(true)}
              className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Fund Wallet</span>
            </button>
          </div>

          {/* Card 3: Quick Registration CTA */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary block">Ready for Next Program?</span>
              <span className="text-xs text-body-color">Register, pick cohort & generate invoice</span>
            </div>
            <button
              onClick={() => {
                setEnrollStep(1);
                setShowEnrollModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-md shadow-primary/20 flex items-center gap-1.5 shrink-0"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Register Course</span>
            </button>
          </div>
        </div>

        {/* Top Active Enrollment Hero */}
        {activeEnrollment && activeCourse && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-white shadow-xl shadow-primary/15 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Cohort: {activeEnrollment.cohort || "Q4 2026"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                    Workstation Seat: Assigned
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                    Schedule: {activeEnrollment.schedulePreference || "Morning (9am - 12pm)"}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {activeCourse.title}
                </h2>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  {activeCourse.description || "Hands-on computer training in our state-of-the-art Ibeju-Lekki lab."}
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
                  <select
                    value={activeEnrollmentId}
                    onChange={(e) => setActiveEnrollmentId(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs border border-white/20 focus:outline-none cursor-pointer"
                  >
                    {enrollments.map((enr) => (
                      <option key={enr.id} value={enr.id} className="text-dark">
                        {enr.courseTitle || enr.id}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => {
                    setEnrollStep(1);
                    setShowEnrollModal(true);
                  }}
                  className="px-5 py-3 rounded-2xl bg-white text-primary font-bold text-xs hover:bg-white/90 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Another Course</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex overflow-x-auto gap-2 border-b border-stroke dark:border-strokedark pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === "lessons"
                ? "bg-primary text-white shadow-sm"
                : "text-body-color hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Classroom & Curriculum</span>
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === "courses"
                ? "bg-primary text-white shadow-sm"
                : "text-body-color hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Course Catalog & Enroll</span>
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === "invoices"
                ? "bg-primary text-white shadow-sm"
                : "text-body-color hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Tuition Invoices & Receipts</span>
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === "assignments"
                ? "bg-primary text-white shadow-sm"
                : "text-body-color hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Projects & Assignments</span>
          </button>

          <button
            onClick={() => setActiveTab("idcard")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === "idcard"
                ? "bg-primary text-white shadow-sm"
                : "text-body-color hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Student ID Card</span>
          </button>

          <button
            onClick={() => setActiveTab("certificate")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === "certificate"
                ? "bg-primary text-white shadow-sm"
                : "text-body-color hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Graduation Certificate</span>
          </button>
        </div>

        {/* TAB 1: CLASSROOM & LESSONS */}
        {activeTab === "lessons" && activeCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm">
                <h3 className="text-base font-bold text-dark dark:text-white mb-1">
                  Curriculum Modules & Practical Lab Exercises
                </h3>
                <p className="text-xs text-body-color mb-6">
                  Complete each practical workstation exercise. Ticking items updates your progress in real-time.
                </p>

                <div className="space-y-3">
                  {(activeCourse.modules && activeCourse.modules.length > 0
                    ? activeCourse.modules
                    : [
                        { id: "mod-1", title: "Module 1: Orientation & Workstation Configuration", duration: "Week 1" },
                        { id: "mod-2", title: "Module 2: Practical Core Lab Principles & Standards", duration: "Week 2" },
                        { id: "mod-3", title: "Module 3: Hands-on Project Implementation & Testing", duration: "Week 3" },
                        { id: "mod-4", title: "Module 4: Professional Capstone Assessment & Defense", duration: "Week 4" },
                      ]
                  ).map((mod: any, index: number) => {
                    const isCompleted = index < Math.floor(((activeEnrollment?.progressPercent || 0) / 100) * 4);
                    return (
                      <div
                        key={mod.id}
                        className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                          isCompleted
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                            : "bg-gray-50 dark:bg-gray-900 border-stroke dark:border-strokedark"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleLesson(mod.id, index + 1)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                              isCompleted
                                ? "bg-emerald-500 text-white"
                                : "border border-stroke dark:border-strokedark bg-white dark:bg-dark text-transparent hover:border-primary"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <div>
                            <span className="text-xs font-bold text-dark dark:text-white block">
                              {mod.title}
                            </span>
                            <span className="text-[11px] text-body-color">Duration: {mod.duration || "1 Week"}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            isCompleted
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-gray-200 dark:bg-gray-800 text-body-color"
                          }`}
                        >
                          {isCompleted ? "Completed" : "In Progress"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar: Instructor & Lab Information */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-body-color uppercase tracking-wider">
                  Lead Instructor / Mentor
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20">
                    {(activeInstructor?.name || "IH").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-dark dark:text-white">
                      {activeInstructor?.name || "Engr. Ibrahim Hambak"}
                    </h5>
                    <span className="text-xs text-primary font-semibold block">
                      {activeInstructor?.specialization || "Full-Stack & Systems Engineering"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-body-color leading-relaxed">
                  {activeInstructor?.bio || "Senior Systems Engineer with over 10 years experience in enterprise IT and cloud deployments."}
                </p>
                <div className="pt-3 border-t border-stroke dark:border-strokedark flex items-center justify-between text-xs font-semibold text-body-color">
                  <span>Lab Office:</span>
                  <span className="text-dark dark:text-white">Ibeju-Lekki Hub</span>
                </div>
              </div>

              <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-body-color uppercase tracking-wider">
                  Physical Lab Location
                </h4>
                <div className="flex items-start gap-2.5 text-xs text-body-color">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Beside Ibeju-Lekki LCDA Council, Origanrigan Cele Area, Ibeju-Lekki, Lagos State.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-body-color">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>Lab Hours: Monday – Saturday (8:00 AM – 7:30 PM)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSE CATALOG & ENROLLMENT */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-dark dark:text-white">
                  Available Academy Courses & Professional Training
                </h3>
                <p className="text-xs text-body-color">
                  Choose a course, fill your student registration profile, and secure your lab workstation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isAlreadyEnrolled = enrollments.some((e) => e.courseId === course.id);
                const tuition = course.price ?? course.tuitionFee ?? 35000;
                return (
                  <div
                    key={course.id}
                    className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {course.category || "Professional Tech"}
                        </span>
                        <span className="text-xs font-bold text-body-color">
                          {course.duration || `${course.durationWeeks || 4} Weeks`}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-dark dark:text-white">
                        {course.title}
                      </h4>
                      <p className="text-xs text-body-color line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>

                      <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark flex items-center justify-between">
                        <span className="text-xs font-semibold text-body-color">Tuition Fee:</span>
                        <span className="text-sm font-black text-dark dark:text-white">
                          ₦{tuition.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-stroke dark:border-strokedark">
                      {isAlreadyEnrolled ? (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Enrolled & Workstation Reserved</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setEnrollStep(1);
                            setShowEnrollModal(true);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>Register & Generate Invoice</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TUITION INVOICES & RECEIPTS */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-dark dark:text-white">
                  Tuition Invoices & Official Payment Receipts
                </h3>
                <p className="text-xs text-body-color">
                  View your fee breakdowns, print formal admission slips, and verify transactions.
                </p>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark">
                <Receipt className="w-12 h-12 text-body-color/40 mx-auto mb-3" />
                <h4 className="text-base font-bold text-dark dark:text-white mb-1">No Invoices Generated Yet</h4>
                <p className="text-xs text-body-color max-w-sm mx-auto mb-4">
                  Enroll in a course to generate your tuition invoice, workstation reservation, and admission letter.
                </p>
                <button
                  onClick={() => {
                    setEnrollStep(1);
                    setShowEnrollModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-sm hover:bg-primary/90 transition"
                >
                  Enroll in a Course Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-6 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-primary">{inv.reference}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            inv.status === "PAID"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-dark dark:text-white">{inv.courseTitle}</h4>
                      <div className="text-xs text-body-color flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                        <span>Cohort: <strong>{inv.cohort}</strong></span>
                        <span>Schedule: <strong>{inv.schedule}</strong></span>
                        <span>Method: <strong>{inv.paymentMethod}</strong></span>
                        <span>Date: <strong>{new Date(inv.createdAt).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] text-body-color block">Total Amount</span>
                        <span className="text-lg font-black text-dark dark:text-white">
                          ₦{inv.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedInvoiceForReceipt(inv)}
                        className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white font-bold text-xs text-dark dark:text-white transition flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        <span>View / Print Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ASSIGNMENTS & LAB PROJECTS */}
        {activeTab === "assignments" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-dark dark:text-white">Practical Lab Projects & Assessment</h3>
                <p className="text-xs text-body-color">
                  Submit capstone assignments and review mentor evaluations and scored points.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment) => {
                const submission = assignment.submissions?.find(
                  (s) => s.enrollmentId === activeEnrollment?.id
                );
                return (
                  <div
                    key={assignment.id}
                    className="p-6 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-4"
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
                          className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition flex items-center gap-1.5 cursor-pointer"
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

        {/* TAB 5: STUDENT ID CARD */}
        {activeTab === "idcard" && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-dark dark:text-white">Official Digital Student ID Card</h3>
              <p className="text-xs text-body-color">
                Valid for lab access, workstation reservation, and physical facility clearance.
              </p>
            </div>

            {/* Front of ID Card */}
            <div className="rounded-3xl bg-gradient-to-br from-primary via-[#0B2545] to-[#0A1D37] text-white p-6 shadow-2xl border border-white/20 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-emerald-400" />
                  <div>
                    <span className="text-[11px] font-black tracking-widest uppercase block">HAMBAKTECH ACADEMY</span>
                    <span className="text-[9px] text-white/70 block">INSTITUTE OF TECHNOLOGY & DESIGN</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  STUDENT ID
                </span>
              </div>

              <div className="py-6 flex items-center gap-6">
                <div className="w-24 h-28 rounded-2xl bg-white/10 border border-white/25 flex flex-col items-center justify-center shrink-0">
                  <User className="w-12 h-12 text-white/60" />
                  <span className="text-[9px] text-white/70 font-semibold mt-1">VERIFIED</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-white/70 uppercase tracking-wider block">Student Name</span>
                    <h4 className="text-lg font-black">{activeIdCard?.studentName || "Abubakar Ibrahim"}</h4>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 uppercase tracking-wider block">Program of Study</span>
                    <span className="text-xs font-semibold block text-emerald-300">
                      {activeCourse?.title || "Full-Stack Web & Software"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-white/70 block font-sans">MATRIC / REG NO</span>
                      <span className="font-bold">{activeEnrollment?.studentRegNumber || "HT-STD-2026-0042"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/70 block font-sans">COHORT</span>
                      <span className="font-bold">{activeEnrollment?.cohort || "Q4 2026"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                <span className="text-[9px] text-white/60">Ibeju-Lekki Hub &bull; business.hambaktech.com.ng</span>
                <div className="p-1 bg-white rounded-lg">
                  <QRCodeView
                    value={`https://business.hambaktech.com.ng/verify/student/${activeEnrollment?.studentRegNumber || "HT-STD-2026-0042"}`}
                    size={48}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GRADUATION CERTIFICATE */}
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
                        Issued to: <span className="font-bold text-dark dark:text-white">{activeCertificate.studentName || activeCertificate.recipientName}</span> &bull; Standing: {activeCertificate.grade}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-stroke dark:border-strokedark shrink-0">
                    <QRCodeView
                      value={`https://business.hambaktech.com.ng/verify/certificate/${activeCertificate.certificateNumber}`}
                      size={100}
                    />
                    <span className="text-[10px] font-mono text-body-color mt-1">
                      {activeCertificate.certificateNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-xs">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark">
                    <span className="text-body-color block mb-1">Issue Date:</span>
                    <span className="font-bold text-dark dark:text-white">{activeCertificate.issueDate}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark">
                    <span className="text-body-color block mb-1">Issuer:</span>
                    <span className="font-bold text-dark dark:text-white">HambakTech Institute & Services</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark">
                    <span className="text-body-color block mb-1">Verification Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Authoritative Active</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
                  <Link
                    href={`/verify/certificate/${activeCertificate.certificateNumber}`}
                    className="px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-xs font-bold text-dark dark:text-white hover:border-primary transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Public Verification Page</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark">
                <Award className="w-12 h-12 text-body-color/40 mx-auto mb-3" />
                <h4 className="text-base font-bold text-dark dark:text-white mb-1">Certificate in Progress</h4>
                <p className="text-xs text-body-color max-w-sm mx-auto">
                  Complete 100% of your course curriculum modules and pass your capstone lab project to unlock your official HambakTech Certificate of Completion.
                </p>
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: COURSE REGISTRATION & ENROLLMENT MULTI-STEP */}
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl my-8 space-y-5 animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-4">
                <div>
                  <h3 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <span>Academy Course Enrollment & Registration</span>
                  </h3>
                  <span className="text-xs text-body-color">
                    Step {enrollStep} of 4:{" "}
                    {enrollStep === 1
                      ? "Select Program"
                      : enrollStep === 2
                      ? "Student Profile Details"
                      : enrollStep === 3
                      ? "Payment & Workstation Clearance"
                      : "Admission Confirmation"}
                  </span>
                </div>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-body-color"
                >
                  ✕
                </button>
              </div>

              {/* STEP 1: SELECT PROGRAM */}
              {enrollStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase mb-2 text-xs">
                      Select Desired Course
                    </label>
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {courses.map((c) => {
                        const fee = c.price ?? c.tuitionFee ?? 35000;
                        const isSelected = selectedCourseId === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCourseId(c.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                              isSelected
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-gray-50 dark:bg-gray-900 border-stroke dark:border-strokedark hover:border-primary/50 text-dark dark:text-white"
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="font-bold text-sm block">{c.title}</span>
                              <span className="text-xs text-body-color">
                                Duration: {c.duration || `${c.durationWeeks || 4} Weeks`} &bull; Level: {c.level || "All Levels"}
                              </span>
                            </div>
                            <span className="text-sm font-black shrink-0">
                              ₦{fee.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-stroke dark:border-strokedark">
                    <button
                      type="button"
                      disabled={!selectedCourseId}
                      onClick={() => setEnrollStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
                    >
                      <span>Continue to Student Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: STUDENT PROFILE FORM */}
              {enrollStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        value={studentFullName}
                        onChange={(e) => setStudentFullName(e.target.value)}
                        placeholder="e.g. Abubakar Ibrahim"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                        Phone Number (SMS & WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="08147837664"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                        Residential Address & State
                      </label>
                      <input
                        type="text"
                        value={studentAddress}
                        onChange={(e) => setStudentAddress(e.target.value)}
                        placeholder="Ibeju-Lekki, Lagos"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                        Cohort Schedule Preference *
                      </label>
                      <select
                        value={cohortSchedule}
                        onChange={(e) => setCohortSchedule(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-semibold focus:outline-none"
                      >
                        <option value="Morning (9:00 AM - 12:00 PM)">Morning Batch (9:00 AM – 12:00 PM)</option>
                        <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon Batch (1:00 PM – 4:00 PM)</option>
                        <option value="Weekend (Saturdays 9:00 AM - 4:00 PM)">Weekend Batch (Saturdays)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                        Learning Mode *
                      </label>
                      <select
                        value={studyMode}
                        onChange={(e) => setStudyMode(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-semibold focus:outline-none"
                      >
                        <option value="In-Person Lab">Physical Lab (Ibeju-Lekki Hub Workstation)</option>
                        <option value="Virtual / Online">Virtual / Online (Live Zoom & Labs)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                        Highest Qualification
                      </label>
                      <select
                        value={highestEducation}
                        onChange={(e) => setHighestEducation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-semibold focus:outline-none"
                      >
                        <option value="High School / O Level">Secondary / O-Level</option>
                        <option value="OND / HND">OND / HND</option>
                        <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                        <option value="Postgraduate">Postgraduate</option>
                        <option value="Other">Other / Self-Taught</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                        Prior Tech Experience
                      </label>
                      <select
                        value={priorExperience}
                        onChange={(e) => setPriorExperience(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-semibold focus:outline-none"
                      >
                        <option value="Beginner">Absolute Beginner (Starting Fresh)</option>
                        <option value="Intermediate">Intermediate (Some Prior Coding/Design)</option>
                        <option value="Advanced">Advanced (Upskilling)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-stroke dark:border-strokedark">
                    <button
                      type="button"
                      onClick={() => setEnrollStep(1)}
                      className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnrollStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
                    >
                      <span>Proceed to Payment Generation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT GENERATION & SETTLEMENT */}
              {enrollStep === 3 && (
                <div className="space-y-4 text-xs">
                  {/* Itemized Fee Breakdown Card */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark space-y-2.5">
                    <span className="font-bold text-dark dark:text-white uppercase text-[11px] block border-b border-stroke dark:border-strokedark pb-1.5">
                      Fee Breakdown & Workstation Invoice
                    </span>
                    <div className="flex justify-between">
                      <span className="text-body-color">Course Tuition Fee:</span>
                      <span className="font-bold text-dark dark:text-white">
                        ₦{(courses.find((c) => c.id === selectedCourseId)?.price || 50000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-color">Practical Lab Workstation Reservation:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Included (Free)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-color">Digital Student ID & Syllabus Materials:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Included (Free)</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-stroke dark:border-strokedark text-sm">
                      <span className="font-extrabold text-dark dark:text-white">Total Amount Due:</span>
                      <span className="font-black text-primary">
                        ₦{(courses.find((c) => c.id === selectedCourseId)?.price || 50000).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase mb-2">
                      Choose Payment Method
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPayMethod("wallet")}
                        className={`p-3 rounded-2xl border text-left transition ${
                          payMethod === "wallet"
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-gray-50 dark:bg-gray-900 border-stroke dark:border-strokedark text-dark dark:text-white"
                        }`}
                      >
                        <Wallet className="w-5 h-5 mb-1.5" />
                        <span className="font-bold block text-xs">Digital Wallet</span>
                        <span className="text-[10px] text-body-color">
                          Bal: ₦{walletBalance.toLocaleString()}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayMethod("card")}
                        className={`p-3 rounded-2xl border text-left transition ${
                          payMethod === "card"
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-gray-50 dark:bg-gray-900 border-stroke dark:border-strokedark text-dark dark:text-white"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 mb-1.5" />
                        <span className="font-bold block text-xs">Card / USSD</span>
                        <span className="text-[10px] text-body-color">Paystack Instant</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayMethod("bank")}
                        className={`p-3 rounded-2xl border text-left transition ${
                          payMethod === "bank"
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-gray-50 dark:bg-gray-900 border-stroke dark:border-strokedark text-dark dark:text-white"
                        }`}
                      >
                        <Building2 className="w-5 h-5 mb-1.5" />
                        <span className="font-bold block text-xs">Bank Transfer</span>
                        <span className="text-[10px] text-body-color">Direct Deposit</span>
                      </button>
                    </div>
                  </div>

                  {/* Bank Transfer Details Display if Bank selected */}
                  {payMethod === "bank" && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block text-[11px]">
                        HambakTech Official Bank Accounts:
                      </span>
                      <div className="space-y-1 font-mono text-[11px] text-amber-900 dark:text-amber-200">
                        <div>&bull; Moniepoint MFB: <strong>6428172910</strong> (HambakTech & Services)</div>
                        <div>&bull; First Bank: <strong>3128910245</strong> (HambakTech & Services)</div>
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block">
                        Your admission invoice will be issued as PENDING and automatically confirmed upon transfer matching.
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-stroke dark:border-strokedark">
                    <button
                      type="button"
                      onClick={() => setEnrollStep(2)}
                      className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleEnrollSubmit}
                      disabled={enrollLoading}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      {enrollLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing Admission...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Complete Registration</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: ADMISSION CONFIRMATION & RECEIPT */}
              {enrollStep === 4 && completedEnrollmentData && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-dark dark:text-white">
                      Admission Confirmed & Registered!
                    </h4>
                    <p className="text-xs text-body-color mt-1">
                      Welcome to HambakTech Academy. Your student profile and lab seat have been allocated.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-body-color">Student Reg Number:</span>
                      <span className="font-mono font-bold text-primary">{completedEnrollmentData.studentRegNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-color">Invoice Reference:</span>
                      <span className="font-mono font-bold text-dark dark:text-white">{completedEnrollmentData.invoiceRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-color">Cohort:</span>
                      <span className="font-bold text-dark dark:text-white">{completedEnrollmentData.cohort || "Q4 2026"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-color">Payment Status:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {completedEnrollmentData.paymentStatus || "PAID"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInvoiceForReceipt(completedEnrollmentData.invoice);
                        setShowEnrollModal(false);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-primary text-primary font-bold text-xs hover:bg-primary/10 transition flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Admission Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEnrollModal(false);
                        setActiveTab("lessons");
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm"
                    >
                      Enter Classroom
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL 2: QUICK FUND WALLET MODAL */}
        {showFundModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <h4 className="text-base font-bold text-dark dark:text-white">Fund Student Tuition Wallet</h4>
                </div>
                <button
                  onClick={() => setShowFundModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleQuickFund} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase mb-1.5">
                    Funding Amount (₦)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(Number(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white text-base font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[25000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFundAmount(amt)}
                      className={`py-2 rounded-xl border text-xs font-bold transition ${
                        fundAmount === amt
                          ? "bg-primary text-white border-primary"
                          : "border-stroke dark:border-strokedark hover:border-primary"
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Direct Bank Transfer option */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-dark dark:text-white">Dedicated Virtual Account:</span>
                    <button
                      type="button"
                      onClick={copyBankDetails}
                      className="text-primary font-bold flex items-center gap-1 hover:underline text-[11px]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedBank ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs">
                    <div>Bank: <strong>Moniepoint MFB</strong></div>
                    <div>Account: <strong>6428172910</strong></div>
                    <div>Name: <strong>HambakTech & Services</strong></div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setShowFundModal(false)}
                    className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={fundingLoading}
                    className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    {fundingLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Crediting...</span>
                      </>
                    ) : (
                      <span>Complete Deposit</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: INVOICE / RECEIPT PRINT VIEW */}
        {selectedInvoiceForReceipt && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-primary" />
                  <h4 className="text-base font-bold text-dark dark:text-white">Official Tuition Receipt & Admission</h4>
                </div>
                <button
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              {/* Printable Slip Body */}
              <div className="p-6 rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-gray-900 text-xs space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                  <div>
                    <h5 className="font-extrabold text-sm text-dark dark:text-white">HAMBAKTECH ACADEMY</h5>
                    <span className="text-[10px] text-body-color">Ibeju-Lekki Institute of Technology</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{selectedInvoiceForReceipt.reference}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-body-color block text-[10px]">Student Name:</span>
                    <strong className="text-dark dark:text-white">{selectedInvoiceForReceipt.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-body-color block text-[10px]">Student Reg No:</span>
                    <strong className="font-mono text-dark dark:text-white">{selectedInvoiceForReceipt.regNumber}</strong>
                  </div>
                  <div>
                    <span className="text-body-color block text-[10px]">Enrolled Course:</span>
                    <strong className="text-dark dark:text-white">{selectedInvoiceForReceipt.courseTitle}</strong>
                  </div>
                  <div>
                    <span className="text-body-color block text-[10px]">Cohort / Schedule:</span>
                    <strong className="text-dark dark:text-white">{selectedInvoiceForReceipt.cohort} ({selectedInvoiceForReceipt.schedule.split(" ")[0]})</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-1.5 border border-stroke dark:border-strokedark">
                  <div className="flex justify-between">
                    <span>Tuition Fee:</span>
                    <strong>₦{selectedInvoiceForReceipt.tuitionFee.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lab Workstation Fee:</span>
                    <strong className="text-emerald-500">Free (Clearance granted)</strong>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-stroke dark:border-strokedark font-bold">
                    <span>Total Paid:</span>
                    <span className="text-primary font-black">₦{selectedInvoiceForReceipt.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-body-color block">Status: <strong>{selectedInvoiceForReceipt.status}</strong></span>
                    <span className="text-[10px] text-body-color block">Method: {selectedInvoiceForReceipt.paymentMethod}</span>
                  </div>
                  <QRCodeView
                    value={`https://business.hambaktech.com.ng/verify/invoice/${selectedInvoiceForReceipt.reference}`}
                    size={60}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: SUBMIT PROJECT ASSIGNMENT */}
        {submittingAssignment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <div>
                  <h4 className="text-base font-bold text-dark dark:text-white">Submit Assignment Solution</h4>
                  <span className="text-xs text-body-color">{submittingAssignment.title}</span>
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
                    Solution Summary & Implementation Notes *
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
                    className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-2 cursor-pointer"
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
      </div>
    </DashboardLayout>
  );
}
