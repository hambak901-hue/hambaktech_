import Link from "next/link";
import { GraduationCap, BookOpen, Award, Laptop, ArrowRight } from "lucide-react";
import { academyCourses } from "@/data/academyData";

export default function AcademyPreview() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gray-1 dark:bg-gray-dark/40 border-t border-stroke dark:border-strokedark">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-3">
              Practical ICT Education
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
              HambakTech Computer Institute & Skills Academy
            </h2>
            <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed">
              Equipping students, job seekers, and executives with job-ready digital capabilities. From foundational computer literacy to practical web engineering and graphic design.
            </p>
          </div>
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition duration-200 shrink-0"
          >
            <span>Explore All Academy Programs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {academyCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-2xl bg-white dark:bg-dark p-6 border border-stroke dark:border-strokedark shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-primary/10 text-primary">
                    {course.level}
                  </span>
                  <span className="text-xs text-body-color dark:text-body-color-dark font-medium">
                    {course.duration.split("(")[0]}
                  </span>
                </div>
                <h3 className="text-base font-bold text-dark dark:text-white mb-3 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-body-color dark:text-body-color-dark mb-4 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stroke/50 dark:border-strokedark/50 flex items-center justify-between">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Cert. Included</span>
                </span>
                <Link
                  href="/academy"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Syllabus →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-dark dark:text-white mb-1">
                Equipped Practical Lab
              </h4>
              <p className="text-xs text-body-color dark:text-body-color-dark">
                Hands-on practice stations with uninterrupted power and internet access.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-dark dark:text-white mb-1">
                Real-World Curriculum
              </h4>
              <p className="text-xs text-body-color dark:text-body-color-dark">
                Structured modules emphasizing marketable skills and business productivity.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-dark dark:text-white mb-1">
                Recognized Certification
              </h4>
              <p className="text-xs text-body-color dark:text-body-color-dark">
                Official HambakTech Certificate awarded upon successful assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
