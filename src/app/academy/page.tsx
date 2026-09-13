import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { academyCourses } from "@/data/academyData";
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  Laptop,
  ArrowRight,
  Send,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HambakTech Academy | Practical ICT Training & Computer Institute",
  description:
    "Empowering youth, students, and professionals with hands-on digital skills: Computer Literacy, Graphic Design, Web Development, and Advanced Excel Data Analysis in Ibeju-Lekki, Lagos.",
  openGraph: {
    title: "HambakTech Academy | Practical ICT Training & Computer Institute",
    description:
      "Empowering youth, students, and professionals with hands-on digital skills: Computer Literacy, Graphic Design, Web Development, and Advanced Excel Data Analysis in Ibeju-Lekki, Lagos.",
    url: "https://hambaktech.com.ng/academy",
  },
};

export default function AcademyPage() {
  return (
    <>
      <Breadcrumb
        pageName="HambakTech Academy"
        description="Practical, lab-based computer training and digital literacy programs designed for the modern economy."
      />

      <section className="pb-16 pt-8 md:pb-20 lg:pb-28">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Institute Mission & Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-dark dark:text-white mb-2">
                100% Hands-On Practical Lab
              </h3>
              <p className="text-xs sm:text-sm text-body-color dark:text-body-color-dark leading-relaxed">
                Dedicated workstations with continuous power supply, high-speed internet, and modern developer & design software suites.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-dark dark:text-white mb-2">
                Structured Modular Syllabus
              </h3>
              <p className="text-xs sm:text-sm text-body-color dark:text-body-color-dark leading-relaxed">
                Step-by-step curriculum engineered for total beginners, career-switchers, and working professionals seeking advancement.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-dark dark:text-white mb-2">
                Practical Skills Assessment
              </h3>
              <p className="text-xs sm:text-sm text-body-color dark:text-body-color-dark leading-relaxed">
                Hands-on capstone projects and practical evaluation leading to a Certificate of Completion upon graduation.
              </p>
            </div>
          </div>

          {/* Course Catalog Title */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-3">
              Curriculum & Programs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
              Featured Academy Programs
            </h2>
            <p className="text-sm sm:text-base text-body-color dark:text-body-color-dark leading-relaxed">
              Browse current cohort offerings. Each program combines lectures, practical exercises, and individual mentoring.
            </p>
          </div>

          {/* Courses List */}
          <div className="space-y-8 mb-16">
            {academyCourses.map((course) => (
              <div
                key={course.id}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm transition-all hover:border-primary/40"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stroke/60 dark:border-strokedark/60 mb-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                        {course.level}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-body-color dark:text-body-color-dark">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{course.duration}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-body-color dark:text-body-color-dark">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{course.mode}</span>
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {course.title}
                    </h3>
                  </div>

                  <Link
                    href={`/contact?service=academy&course=${encodeURIComponent(course.title)}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition shrink-0"
                  >
                    <span>Register for Cohort</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <p className="text-sm leading-relaxed text-body-color dark:text-body-color-dark mb-6">
                  {course.description}
                </p>

                {/* Modules Outline */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-dark dark:text-white mb-3">
                    Course Modules & Syllabus Outline:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {course.modules.map((mod, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-body-color dark:text-body-color-dark p-2.5 rounded-lg bg-gray-1 dark:bg-gray-dark"
                      >
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs border-t border-stroke/40 dark:border-strokedark/40 text-body-color dark:text-body-color-dark">
                  <div>
                    <strong className="text-dark dark:text-white">Prerequisites:</strong>{" "}
                    {course.prerequisites}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Award className="w-4 h-4" />
                    <span>Award: {course.certification}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Admission & Registration Card */}
          <div className="rounded-2xl p-8 bg-gradient-to-r from-primary to-indigo-800 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white mb-3">
                Admissions Desk
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Enroll in the Next Training Cohort
              </h3>
              <p className="text-white/85 text-sm leading-relaxed">
                Classes are held at our Ibeju-Lekki centre with weekday and weekend schedule options. Visit our admissions desk in person or submit an online inquiry to reserve your seat.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/contact?service=academy"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary font-bold text-sm shadow-md hover:bg-gray-100 transition duration-200"
              >
                <Send className="w-4 h-4" />
                <span>Submit Admission Inquiry</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/40 text-white font-medium text-sm hover:bg-white/10 transition duration-200"
              >
                <MapPin className="w-4 h-4" />
                <span>Visit Lab in Person</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
