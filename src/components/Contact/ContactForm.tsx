"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2, MapPin, Mail, Clock, Phone } from "lucide-react";
import { companyConfig } from "@/data/companyConfig";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "general",
    message: "",
  });

  useEffect(() => {
    const serviceParam = searchParams.get("service");
    const courseParam = searchParams.get("course");

    if (serviceParam || courseParam) {
      setFormData((prev) => ({
        ...prev,
        service: serviceParam || prev.service,
        message: courseParam
          ? `I am interested in registering for the "${courseParam}" training cohort at HambakTech Academy. Please provide admission and schedule details.`
          : prev.message,
      }));
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Professional client submission handling
    setSubmitted(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
      {/* Contact Form Column */}
      <div className="lg:col-span-7">
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          {submitted ? (
            <div className="text-center py-10">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-dark dark:text-white mb-2">
                Thank You for Contacting HambakTech
              </h3>
              <p className="text-sm text-body-color dark:text-body-color-dark max-w-md mx-auto mb-6 leading-relaxed">
                Your message regarding <strong>{formData.service}</strong> has been received by our helpdesk. A representative will contact you via email or phone shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    service: "general",
                    message: "",
                  });
                }}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-dark dark:text-white mb-2">
                  Send a Service Inquiry
                </h3>
                <p className="text-sm text-body-color dark:text-body-color-dark">
                  Fill in your details below and our operations team will respond promptly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-bold uppercase tracking-wider text-dark dark:text-white mb-2"
                  >
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    id="name"
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Adebayo Johnson"
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-1 dark:bg-gray-dark text-dark dark:text-white text-sm focus:border-primary focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-wider text-dark dark:text-white mb-2"
                  >
                    Email Address <span className="text-primary">*</span>
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. adebayo@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-1 dark:bg-gray-dark text-dark dark:text-white text-sm focus:border-primary focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-bold uppercase tracking-wider text-dark dark:text-white mb-2"
                  >
                    Phone / WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 0801 234 5678"
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-1 dark:bg-gray-dark text-dark dark:text-white text-sm focus:border-primary focus:outline-hidden transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="service"
                    className="block text-xs font-bold uppercase tracking-wider text-dark dark:text-white mb-2"
                  >
                    Service of Interest
                  </label>
                  <select
                    id="service"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-1 dark:bg-gray-dark text-dark dark:text-white text-sm focus:border-primary focus:outline-hidden transition"
                  >
                    <option value="general">General Inquiries</option>
                    <option value="digital-services">Digital Services & Portals</option>
                    <option value="business-centre">Business Centre Clerical / Copying</option>
                    <option value="printing">Commercial Printing & Collaterals</option>
                    <option value="nin-centre">NIN Support Desk</option>
                    <option value="vtu">VTU Airtime & Bill Payments</option>
                    <option value="business-registration">CAC Business Registration</option>
                    <option value="web-software">Web & Custom Software</option>
                    <option value="graphics-branding">Graphics & Corporate Branding</option>
                    <option value="academy">HambakTech Academy Training</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-bold uppercase tracking-wider text-dark dark:text-white mb-2"
                >
                  Message & Specific Requirements <span className="text-primary">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide details of your request or questions..."
                  className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-1 dark:bg-gray-dark text-dark dark:text-white text-sm focus:border-primary focus:outline-hidden transition"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition duration-200"
              >
                <Send className="w-4 h-4" />
                <span>Submit Service Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Physical Centre Info Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-4">
            Visit Our Centre
          </span>
          <h3 className="text-xl font-bold text-dark dark:text-white mb-6">
            Physical Office & Desk
          </h3>

          <div className="space-y-6 text-sm text-body-color dark:text-body-color-dark">
            <div className="flex items-start gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-dark dark:text-white block mb-0.5">Physical Location:</strong>
                <span>{companyConfig.address}</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-dark dark:text-white block mb-0.5">Working Hours:</strong>
                <span>{companyConfig.operatingHours}</span>
                <span className="block text-xs text-body-color/70 dark:text-body-color-dark/70">{companyConfig.sundayStatus}</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-dark dark:text-white block mb-0.5">Telephone / Desk:</strong>
                <span>{companyConfig.phonePrimary} / {companyConfig.phoneSecondary}</span>
                <span className="block text-xs text-body-color/70 dark:text-body-color-dark/70">WhatsApp: {companyConfig.whatsapp}</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-dark dark:text-white block mb-0.5">Official Inquiries:</strong>
                <a
                  href={`mailto:${companyConfig.email}`}
                  className="hover:text-primary transition"
                >
                  {companyConfig.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Assurance Box */}
        <div className="p-6 rounded-2xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark">
          <h4 className="text-sm font-bold text-dark dark:text-white mb-2">
            Confidentiality Notice
          </h4>
          <p className="text-xs text-body-color dark:text-body-color-dark leading-relaxed">
            All submitted personal identification, company documentation, and project briefs are treated with strict confidentiality under our data handling protocols.
          </p>
        </div>
      </div>
    </div>
  );
}
