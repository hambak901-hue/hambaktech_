"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Award,
  ArrowRight,
  Laptop,
  Sparkles,
  Calendar,
} from "lucide-react";
import { academyCourses } from "@/data/academyData";
import companyConfig from "@/data/companyConfig";

const COURSE_FEES: Record<string, number> = {
  "comp-literacy": 35000,
  "graphic-design": 45000,
  "web-development": 60000,
  "data-analysis": 50000,
};

export default function AcademyPublicPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("comp-literacy");

  return (
    <div className="pt-28 pb-20 bg-[#FCFCFC] dark:bg-black text-dark dark:text-white">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-body-color">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-dark dark:text-white font-medium">HambakTech Academy</span>
        </div>

        {/* Hero Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold mb-3">
              <GraduationCap className="w-4 h-4" />
              <span>Practical Digital & ICT Skills Training Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-dark dark:text-white">
              Launch Your Tech Career in Ibeju-Lekki
            </h1>
            <p className="mt-4 text-sm sm:text-base text-body-color dark:text-body-color-dark leading-relaxed">
              Equipping students, job-seekers, and business professionals with market-relevant digital skills. Dedicated computer workstations, structured curriculum, hands-on capstone projects, and verified Certificates of Completion.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard/academy"
                className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-md shadow-primary/25 inline-flex items-center gap-2"
              >
                <span>Student Portal & Enrollment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#courses"
                className="px-6 py-3 rounded-2xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-dark transition inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Explore Courses</span>
              </a>
            </div>
          </div>
        </div>

        {/* Why Learn at HambakTech Academy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-dark dark:text-white">Dedicated Workstations</h3>
            <p className="text-xs text-body-color mt-1">
              Every student has access to an air-conditioned workstation with dual monitors, high-speed fiber internet, and unbroken solar/inverter power backup.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-dark dark:text-white">Small Cohorts</h3>
            <p className="text-xs text-body-color mt-1">
              Class sizes are capped at 12 students per session to guarantee personalized 1-on-1 instructor attention and thorough feedback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-dark dark:text-white">Flexible Schedules</h3>
            <p className="text-xs text-body-color mt-1">
              Choose from Morning (9:00 AM – 12:00 PM), Afternoon (1:00 PM – 4:00 PM), or Weekend classes (Saturdays 10:00 AM – 3:00 PM) for working professionals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-dark dark:text-white">Verified Certification</h3>
            <p className="text-xs text-body-color mt-1">
              Graduate with an official HambakTech Certificate of Completion, complete with verifiable QR authentication and capstone portfolio piece.
            </p>
          </div>
        </div>

        {/* Courses Section */}
        <div id="courses" className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Curriculum & Programs
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white mt-1">
              Hands-On ICT Courses for Practical Mastery
            </h2>
            <p className="text-xs sm:text-sm text-body-color mt-2">
              All courses combine structured lectures with extensive laboratory exercises. Installment payment plans available.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {academyCourses.map((course) => {
              const fee = COURSE_FEES[course.id] || 40000;
              return (
                <div
                  key={course.id}
                  className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col justify-between hover:border-primary/60 transition"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                        {course.level} • {course.mode}
                      </span>
                      <span className="text-lg font-extrabold text-primary">
                        ₦{fee.toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-dark dark:text-white">
                      {course.title}
                    </h3>
                    <p className="text-xs text-body-color mt-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-5 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-dark dark:text-white">
                        Syllabus Modules:
                      </h4>
                      <ul className="space-y-1.5 text-xs text-body-color">
                        {course.modules.slice(0, 4).map((mod, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{mod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-stroke/60 dark:border-strokedark/60 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-body-color">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{course.duration}</span>
                    </span>

                    <Link
                      href="/dashboard/academy"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm"
                    >
                      <span>Enroll in Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location & Lab Tour CTA */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gray-100 dark:bg-gray-dark flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Physical Campus & Computer Lab
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-dark dark:text-white mt-1">
              Visit HambakTech Academy Lab in Person
            </h3>
            <p className="text-xs sm:text-sm text-body-color mt-1">
              {companyConfig.address} • Schedule a campus tour or speak with an instructor
            </p>
          </div>
          <a
            href={`https://wa.me/234${companyConfig.whatsapp.slice(1)}?text=Hello%20HambakTech,%20I%20would%20like%20to%20inquire%20about%20Academy%20admission`}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shrink-0"
          >
            Chat with Admissions on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
