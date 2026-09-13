import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Essential Checklist for Registering Your Business Name with CAC in Nigeria | HambakTech Blog",
  description: "A clear step-by-step breakdown of CAC business name requirements, documentation, and post-incorporation steps for Nigerian entrepreneurs.",
};

const BlogDetailsPage = () => {
  return (
    <>
      <section className="pt-[150px] pb-[120px]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-9/12">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Link href="/blog" className="hover:underline">Blog</Link>
                  <span>/</span>
                  <span>Corporate Services</span>
                </div>
                <h1 className="mb-8 text-3xl leading-tight font-bold text-black sm:text-4xl sm:leading-tight dark:text-white">
                  Essential Checklist for Registering Your Business Name with CAC in Nigeria
                </h1>
                <div className="border-body-color/10 mb-10 flex flex-wrap items-center justify-between border-b pb-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center">
                    <div className="mr-10 mb-5 flex items-center">
                      <div className="mr-4">
                        <div className="relative h-11 w-11 overflow-hidden rounded-full border border-stroke dark:border-strokedark">
                          <Image
                            src="/images/blog/author-01.png"
                            alt="HambakTech Editorial Desk"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="w-full">
                        <span className="text-body-color mb-1 block text-sm font-medium">
                          By <span className="font-semibold text-dark dark:text-white">HambakTech Editorial Desk</span>
                        </span>
                        <span className="text-xs text-body-color/70">Corporate Advisory & Services</span>
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
                        Updated 2026
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
                        5 min read
                      </p>
                    </div>
                  </div>
                  <div className="mb-5">
                    <span className="bg-primary/10 text-primary inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold">
                      CAC Registration
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-body-color mb-8 text-base leading-relaxed font-medium sm:text-lg sm:leading-relaxed">
                    Formalizing your enterprise with the Corporate Affairs Commission (CAC) is the foundational legal milestone for any Nigerian business. Beyond ensuring legal compliance under CAMA (Companies and Allied Matters Act), registration unlocks commercial bank accounts, government grant qualifications, investor confidence, and brand protection.
                  </p>

                  <div className="mb-10 w-full overflow-hidden rounded-xl border border-stroke dark:border-strokedark">
                    <div className="relative aspect-97/60 w-full sm:aspect-97/44">
                      <Image
                        src="/images/blog/blog-details-01.jpg"
                        alt="CAC Registration Checklist"
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                  </div>

                  <h2 className="mb-6 text-2xl font-bold text-black sm:text-3xl dark:text-white">
                    1. Choosing Between Business Name and Limited Liability Company
                  </h2>
                  <p className="text-body-color mb-6 text-base leading-relaxed font-medium">
                    The two most common structures registered by Nigerian micro, small, and medium enterprises are <strong>Business Names (Sole Proprietorship / Partnership)</strong> and <strong>Private Limited Companies (Ltd)</strong>:
                  </p>
                  <ul className="text-body-color mb-8 list-inside list-disc space-y-2">
                    <li className="text-base font-medium">
                      <strong>Business Name:</strong> Ideal for sole proprietors, freelancers, retailers, and boutique service providers. Offers simpler filing requirements and lower registration overheads.
                    </li>
                    <li className="text-base font-medium">
                      <strong>Limited Liability Company (Ltd):</strong> Creates an independent corporate entity that shields founders personal assets. Required for tech startups raising equity, government contracting, and international trade.
                    </li>
                  </ul>

                  <h2 className="mb-6 text-2xl font-bold text-black sm:text-3xl dark:text-white">
                    2. Mandatory Documents & Information Checklist
                  </h2>
                  <p className="text-body-color mb-6 text-base leading-relaxed font-medium">
                    Before beginning your application on the CAC Portal or visiting HambakTech&apos;s service desk, ensure you have the following items ready:
                  </p>
                  <ul className="text-body-color mb-10 list-inside list-disc space-y-3">
                    <li className="text-base font-medium">
                      <strong>Two Proposed Names:</strong> One primary choice and one alternative name in case of collision or rejection during name reservation.
                    </li>
                    <li className="text-base font-medium">
                      <strong>National Identification Number (NIN):</strong> Required for the proprietor, all partners, or company directors. The name spelling must match your government records.
                    </li>
                    <li className="text-base font-medium">
                      <strong>Valid Means of Identification:</strong> Scanned copy of National ID card, International Passport, Voters Card, or Drivers License.
                    </li>
                    <li className="text-base font-medium">
                      <strong>Registered Physical Business Address:</strong> A verified street address within Nigeria (P.O. Boxes are not permitted by CAC).
                    </li>
                    <li className="text-base font-medium">
                      <strong>Passport Photograph:</strong> Clear, neutral background passport image of each proprietor/director.
                    </li>
                    <li className="text-base font-medium">
                      <strong>Signature Specimen:</strong> Clean signature on plain white paper, photographed or scanned.
                    </li>
                  </ul>

                  <div className="bg-primary/5 border border-primary/20 relative z-10 mb-10 overflow-hidden rounded-xl p-8 md:p-10">
                    <h3 className="text-lg font-bold text-dark dark:text-white mb-2">
                      Need Guided CAC Registration in Lagos?
                    </h3>
                    <p className="text-body-color text-sm leading-relaxed mb-4">
                      HambakTech provides comprehensive corporate desk services. We conduct pre-reservation clearance, assemble all documents, resolve name queries, and deliver your official CAC Status Report and Certificate directly to your inbox or for physical pickup at our Ibeju-Lekki centre.
                    </p>
                    <Link
                      href="/contact?service=business-registration"
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90 transition"
                    >
                      Book CAC Assistance
                    </Link>
                  </div>

                  <h2 className="mb-6 text-2xl font-bold text-black sm:text-3xl dark:text-white">
                    3. Post-Registration Steps: Banking and Tax Identification
                  </h2>
                  <p className="text-body-color mb-6 text-base leading-relaxed font-medium">
                    Receiving your CAC Certificate is only the first step. To conduct lawful commerce, ensure you complete these post-registration requirements:
                  </p>
                  <ul className="text-body-color mb-10 list-inside list-disc space-y-2">
                    <li className="text-base font-medium">
                      <strong>Corporate Bank Account Opening:</strong> Take your official Status Report, TIN, and Certificate to your preferred commercial bank.
                    </li>
                    <li className="text-base font-medium">
                      <strong>Tax Identification Number (TIN):</strong> Automatically generated alongside modern CAC registrations through the Joint Tax Board (JTB) integration.
                    </li>
                    <li className="text-base font-medium">
                      <strong>Annual Returns Filing:</strong> Keep your business in good standing by filing annual returns at the statutory due dates to prevent deregistration.
                    </li>
                  </ul>

                  <div className="items-center justify-between border-t border-stroke dark:border-strokedark pt-8 sm:flex">
                    <div className="mb-5">
                      <h4 className="text-body-color mb-3 text-sm font-medium">
                        Tags:
                      </h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        <TagButton text="CAC Registration" />
                        <TagButton text="Business" />
                        <TagButton text="Compliance" />
                        <TagButton text="Nigeria" />
                      </div>
                    </div>
                    <div className="mb-5">
                      <h5 className="text-body-color mb-3 text-sm font-medium sm:text-right">
                        Share this guide:
                      </h5>
                      <div className="flex items-center sm:justify-end">
                        <SharePost />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetailsPage;
