import RelatedPost from "@/components/Blog/RelatedPost";
import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import NewsLatterBox from "@/components/Contact/NewsLatterBox";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Article & Practical Tech Guides | HambakTech",
  description: "Read in-depth insights, digital transformation guides, and practical corporate advisory from the HambakTech team in Lagos.",
};

const BlogSidebarPage = () => {
  return (
    <>
      <section className="overflow-hidden pt-[180px] pb-[120px]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 lg:w-8/12">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Link href="/blog" className="hover:underline">Blog</Link>
                  <span>/</span>
                  <span>Digital Operations</span>
                </div>
                <h1 className="mb-8 text-3xl leading-tight font-bold text-black sm:text-4xl sm:leading-tight dark:text-white">
                  The Hybrid Service Centre: Bridging Walk-in Support with Digital Platforms
                </h1>
                <div className="border-body-color/10 mb-10 flex flex-wrap items-center justify-between border-b pb-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center">
                    <div className="mr-10 mb-5 flex items-center">
                      <div className="mr-4">
                        <div className="relative h-11 w-11 overflow-hidden rounded-full border border-stroke dark:border-strokedark">
                          <Image
                            src="/images/blog/author-03.png"
                            alt="HambakTech Insights"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="w-full">
                        <span className="text-body-color mb-1 block text-sm font-medium">
                          By <span className="font-semibold text-dark dark:text-white">HambakTech Insights</span>
                        </span>
                        <span className="text-xs text-body-color/70">Digital Solutions Unit</span>
                      </div>
                    </div>
                    <div className="mb-5 flex items-center">
                      <p className="text-body-color mr-5 flex items-center text-sm font-medium">
                        <span className="mr-2">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            className="fill-current"
                          >
                            <path d="M13.2637 3.3697H7.64754V2.58105C8.19721 2.43765 8.62738 1.91189 8.62738 1.31442C8.62738 0.597464 8.02992 0 7.28906 0C6.54821 0 5.95074 0.597464 5.95074 1.31442C5.95074 1.91189 6.35702 2.41376 6.93058 2.58105V3.3697H1.31442C0.597464 3.3697 0 3.96716 0 4.68412V13.2637C0 13.9807 0.597464 14.5781 1.31442 14.5781H13.2637C13.9807 14.5781 14.5781 13.9807 14.5781 13.2637V4.68412C14.5781 3.96716 13.9807 3.3697 13.2637 3.3697ZM6.6677 1.31442C6.6677 0.979841 6.93058 0.716957 7.28906 0.716957C7.62364 0.716957 7.91042 0.979841 7.91042 1.31442C7.91042 1.649 7.64754 1.91189 7.28906 1.91189C6.95448 1.91189 6.6677 1.6251 6.6677 1.31442ZM1.31442 4.08665H13.2637C13.5983 4.08665 13.8612 4.34954 13.8612 4.68412V6.45261H0.716957V4.68412C0.716957 4.34954 0.979841 4.08665 1.31442 4.08665ZM13.2637 13.8612H1.31442C0.979841 13.8612 0.716957 13.5983 0.716957 13.2637V7.16957H13.8612V13.2637C13.8612 13.5983 13.5983 13.8612 13.2637 13.8612Z" />
                          </svg>
                        </span>
                        2026 Edition
                      </p>
                      <p className="text-body-color flex items-center text-sm font-medium">
                        <span className="mr-2">
                          <svg
                            width="20"
                            height="12"
                            viewBox="0 0 20 12"
                            className="fill-current"
                          >
                            <path d="M10.2559 3.8125C9.03711 3.8125 8.06836 4.8125 8.06836 6C8.06836 7.1875 9.06836 8.1875 10.2559 8.1875C11.4434 8.1875 12.4434 7.1875 12.4434 6C12.4434 4.8125 11.4746 3.8125 10.2559 3.8125ZM10.2559 7.09375C9.66211 7.09375 9.16211 6.59375 9.16211 6C9.16211 5.40625 9.66211 4.90625 10.2559 4.90625C10.8496 4.90625 11.3496 5.40625 11.3496 6C11.3496 6.59375 10.8496 7.09375 10.2559 7.09375Z" />
                            <path d="M19.7559 5.625C17.6934 2.375 14.1309 0.4375 10.2559 0.4375C6.38086 0.4375 2.81836 2.375 0.755859 5.625C0.630859 5.84375 0.630859 6.125 0.755859 6.34375C2.81836 9.59375 6.38086 11.5312 10.2559 11.5312C14.1309 11.5312 17.6934 9.59375 19.7559 6.34375C19.9121 6.125 19.9121 5.84375 19.7559 5.625ZM10.2559 10.4375C6.84961 10.4375 3.69336 8.78125 1.81836 5.96875C3.69336 3.1875 6.84961 1.53125 10.2559 1.53125C13.6621 1.53125 16.8184 3.1875 18.6934 5.96875C16.8184 8.78125 13.6621 10.4375 10.2559 10.4375Z" />
                          </svg>
                        </span>
                        4 min read
                      </p>
                    </div>
                  </div>
                  <div className="mb-5">
                    <span className="bg-primary/10 text-primary inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold">
                      Digital Solutions
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-body-color mb-8 text-base leading-relaxed font-medium sm:text-lg sm:leading-relaxed">
                    Across commercial hubs in Lagos and rapidly developing business corridors like Ibeju-Lekki, the conventional concept of a cyber café or clerical shop has undergone a profound transformation into the modern <strong>Hybrid Service Centre</strong>.
                  </p>

                  <div className="mb-10 w-full overflow-hidden rounded-xl border border-stroke dark:border-strokedark">
                    <div className="relative aspect-97/60 w-full sm:aspect-97/44">
                      <Image
                        src="/images/blog/blog-details-02.jpg"
                        alt="Hybrid Service Centre Operations"
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                  </div>

                  <h2 className="mb-6 text-2xl font-bold text-black sm:text-3xl dark:text-white">
                    Why Walk-In Presence Still Matters in a Digital World
                  </h2>
                  <p className="text-body-color mb-6 text-base leading-relaxed font-medium">
                    While digital platforms offer 24/7 convenience, everyday businesses and individuals continually face barriers including biometric verification requirements (NIN/BVN), high-grade color printing specifications, notarization, and complex regulatory portals. A local physical centre bridges this trust gap by providing human expertise on demand.
                  </p>

                  <h2 className="mb-6 text-2xl font-bold text-black sm:text-3xl dark:text-white">
                    Core Pillars of the HambakTech Centre
                  </h2>
                  <ul className="text-body-color mb-8 list-inside list-disc space-y-2">
                    <li className="text-base font-medium">
                      <strong>Omnichannel Service Delivery:</strong> Customers can submit tasks online via WhatsApp or web portal, and collect physical prints or certified documents in person without queueing.
                    </li>
                    <li className="text-base font-medium">
                      <strong>Enterprise Clerical Hardware:</strong> Heavy-duty digital presses, high-speed thermal printers, and dedicated document finishing machines ensure corporate-standard presentation.
                    </li>
                    <li className="text-base font-medium">
                      <strong>ICT Talent Incubation:</strong> Physical computer labs provide focused environments for students and youth to learn practical computing, web development, and digital marketing skills.
                    </li>
                  </ul>

                  <div className="items-center justify-between border-t border-stroke dark:border-strokedark pt-8 sm:flex">
                    <div className="mb-5">
                      <h4 className="text-body-color mb-3 text-sm font-medium">
                        Tags:
                      </h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        <TagButton text="Technology" />
                        <TagButton text="Digital Solutions" />
                        <TagButton text="Business Centre" />
                        <TagButton text="Lagos" />
                      </div>
                    </div>
                    <div className="mb-5">
                      <h5 className="text-body-color mb-3 text-sm font-medium sm:text-right">
                        Share this post:
                      </h5>
                      <div className="flex items-center sm:justify-end">
                        <SharePost />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full px-4 lg:w-4/12">
              <div className="shadow-three dark:bg-gray-dark mb-10 rounded-2xl bg-white p-6 dark:shadow-none border border-stroke dark:border-strokedark">
                <h3 className="border-body-color/10 border-b pb-3 text-lg font-semibold text-black dark:border-white/10 dark:text-white mb-4">
                  Quick Service Navigation
                </h3>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <Link
                      href="/services"
                      className="text-body-color hover:text-primary transition flex items-center justify-between"
                    >
                      <span>Digital Portal Services</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Core</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/academy"
                      className="text-body-color hover:text-primary transition flex items-center justify-between"
                    >
                      <span>ICT Training Academy</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Cohorts</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-body-color hover:text-primary transition flex items-center justify-between"
                    >
                      <span>CAC Business Registration</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Advisory</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      className="text-body-color hover:text-primary transition flex items-center justify-between"
                    >
                      <span>Services Catalog</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Explore</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="shadow-three dark:bg-gray-dark mb-10 rounded-2xl bg-white p-6 dark:shadow-none border border-stroke dark:border-strokedark">
                <h3 className="border-body-color/10 border-b pb-3 text-lg font-semibold text-black dark:border-white/10 dark:text-white mb-4">
                  Related Guides
                </h3>
                <ul className="space-y-4">
                  <li className="border-b border-stroke dark:border-strokedark pb-4">
                    <RelatedPost
                      title="Essential Checklist for CAC Business Registration"
                      image="/images/blog/post-01.jpg"
                      slug="/blog-details"
                      date="Updated 2026"
                    />
                  </li>
                  <li className="border-b border-stroke dark:border-strokedark pb-4">
                    <RelatedPost
                      title="Why Hands-On Lab Training Beats Theory Courses"
                      image="/images/blog/post-02.jpg"
                      slug="/academy"
                      date="Education Desk"
                    />
                  </li>
                  <li>
                    <RelatedPost
                      title="Commercial Printing Standards for Lagos Enterprises"
                      image="/images/blog/post-03.jpg"
                      slug="/services"
                      date="Print Services"
                    />
                  </li>
                </ul>
              </div>

              <div className="shadow-three dark:bg-gray-dark mb-10 rounded-2xl bg-white p-6 dark:shadow-none border border-stroke dark:border-strokedark">
                <h3 className="border-body-color/10 border-b pb-3 text-lg font-semibold text-black dark:border-white/10 dark:text-white mb-4">
                  Popular Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  <TagButton text="CAC" />
                  <TagButton text="ICT Academy" />
                  <TagButton text="Printing" />
                  <TagButton text="Business Hub" />
                  <TagButton text="Lagos" />
                </div>
              </div>

              <NewsLatterBox />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogSidebarPage;
