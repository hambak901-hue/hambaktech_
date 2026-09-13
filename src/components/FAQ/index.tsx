"use client";
import { useState } from "react";
import { faqData } from "@/data/faqData";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-16 md:py-20 lg:py-24 bg-white dark:bg-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed">
            Essential facts regarding our services, physical centre operations, and upcoming digital platform.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-stroke dark:border-strokedark bg-gray-1/40 dark:bg-gray-dark/40 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={isOpen}
                  className="flex items-center justify-between w-full p-6 text-left focus:outline-hidden"
                >
                  <span className="text-base sm:text-lg font-bold text-dark dark:text-white pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-dark border border-stroke dark:border-strokedark text-dark dark:text-white shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary border-primary" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-sm sm:text-base leading-relaxed text-body-color dark:text-body-color-dark border-t border-stroke/40 dark:border-strokedark/40 mt-2 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
