"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  X,
  Send,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  Building2,
  GraduationCap,
  MapPin,
  Clock,
} from "lucide-react";
import companyConfig from "@/data/companyConfig";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  actions?: Array<{ label: string; href: string }>;
}

const QUICK_SUGGESTIONS = [
  "How to register business with CAC?",
  "NIN slip retrieval & plastic card",
  "Buy Data or Airtime instant",
  "Pay Electricity token",
  "Academy courses & fees",
  "Where is HambakTech located?",
];

export default function HambakTechAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      sender: "assistant",
      text: `Hello! Welcome to HambakTech Smart Digital Assistant. I can help you discover our digital services, check NIN and CAC requirements, guide your utility bill payments, or tell you about our Academy in Ibeju-Lekki. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actions: [
        { label: "View All Services", href: "/services" },
        { label: "Customer Dashboard", href: "/dashboard" },
      ],
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Intelligent answer engine based on keywords
    setTimeout(() => {
      const q = userText.toLowerCase();
      let reply = "";
      let actions: Array<{ label: string; href: string }> | undefined;

      if (q.includes("cac") || q.includes("business registration") || q.includes("company") || q.includes("enterprise")) {
        reply = `HambakTech provides complete corporate assistance for Business Name (Enterprise), Private Limited Liability Company (Ltd), and Incorporated Trustees/NGOs through the CAC portal.\n\nRequirements include: 2 proposed names, valid government ID of proprietor/directors, passport photo, signature specimen, and business address.\n\nOur service includes name reservation, filing, and retrieval of your official Certificate and Status Report with TIN.`;
        actions = [
          { label: "Start CAC Application", href: "/services/business-registration" },
          { label: "Track Existing CAC Order", href: "/dashboard/orders" },
        ];
      } else if (q.includes("nin") || q.includes("identity") || q.includes("plastic card") || q.includes("modification") || q.includes("slip")) {
        reply = `At our NIN Centre desk in Ibeju-Lekki, we assist with:\n1. Pre-enrollment document checklist\n2. NIN slip retrieval & reprint\n3. High-grade plastic PVC ID card printing\n4. Data modification guidance (Name, DOB, Phone)\n5. BVN-NIN harmonization pre-checks.\n\n*Important:* HambakTech is an independent business centre and technical assistance desk, not NIMC.`;
        actions = [
          { label: "NIN Centre & Requirements", href: "/services/nin-centre" },
          { label: "Track NIN Application", href: "/services/nin-centre#tracker" },
        ];
      } else if (q.includes("data") || q.includes("airtime") || q.includes("recharge") || q.includes("vtu")) {
        reply = `We provide automated instant VTU top-ups for MTN, Airtel, Glo, and 9mobile at discounted corporate rates.\n\nSME and direct data bundles are delivered immediately to your recipient's line with real-time delivery logs.`;
        actions = [
          { label: "Buy Airtime & Data", href: "/dashboard/services/airtime" },
          { label: "Fund Wallet", href: "/dashboard/wallet/fund" },
        ];
      } else if (q.includes("electricity") || q.includes("disco") || q.includes("meter") || q.includes("power") || q.includes("token")) {
        reply = `You can purchase prepaid electricity tokens or settle postpaid bills for all DISCOs across Nigeria (including Ikeja Electric, Eko Electric, Abuja AEDC, Ibadan IBEDC, and more).\n\nOur system verifies the meter owner's name before you pay and displays the 20-digit token immediately on screen.`;
        actions = [
          { label: "Pay Electricity Token", href: "/dashboard/services/electricity" },
        ];
      } else if (q.includes("academy") || q.includes("course") || q.includes("training") || q.includes("learn") || q.includes("excel")) {
        reply = `HambakTech Academy offers cohort-based practical ICT programs at our Ibeju-Lekki hub:\n- Executive Computer Literacy (6 weeks)\n- Graphic Design & Brand Communication (8 weeks)\n- Web Development Foundations (10 weeks)\n- Data Analysis with Advanced Excel (6 weeks)\n\nStudents enjoy hands-on computer lab workstations, real-world capstone projects, and an official Certificate of Completion.`;
        actions = [
          { label: "Explore Academy Courses", href: "/academy" },
          { label: "Student Dashboard", href: "/dashboard/academy" },
        ];
      } else if (q.includes("location") || q.includes("address") || q.includes("where") || q.includes("office") || q.includes("phone") || q.includes("contact")) {
        reply = `📍 Physical Office Address:\n${companyConfig.address}\n\n📞 Phone: ${companyConfig.phonePrimary}\n💬 WhatsApp: ${companyConfig.whatsapp}\n✉️ Email: ${companyConfig.email}\n⏰ Hours: ${companyConfig.operatingHours}`;
        actions = [
          { label: "Contact Us & Directions", href: "/contact" },
        ];
      } else if (q.includes("printing") || q.includes("photocopy") || q.includes("typing") || q.includes("binding") || q.includes("lamination")) {
        reply = `Our physical Business Centre handles high-speed commercial printing, typing, photocopying, thermal lamination (up to A3), and spiral wire binding.\n\nWalk-ins are welcomed Monday through Saturday, 8:00 AM to 6:00 PM!`;
        actions = [
          { label: "Business Centre Services", href: "/services/business-centre" },
        ];
      } else {
        reply = `Thank you for reaching out! HambakTech is an integrated digital technology and business centre providing VTU & utility bill payments, NIN assistance, CAC business registrations, commercial printing, and ICT Academy training.\n\nYou can also launch our Customer Dashboard or chat with our desk staff via WhatsApp at ${companyConfig.whatsapp}.`;
        actions = [
          { label: "Open Customer Dashboard", href: "/dashboard" },
          { label: "Talk on WhatsApp", href: `https://wa.me/234${companyConfig.whatsapp.slice(1)}` },
        ];
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            id="open-assistant-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Open HambakTech Assistant"
            className="flex items-center gap-2.5 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-full shadow-xl shadow-primary/30 transition-all transform hover:scale-105"
          >
            <div className="relative">
              <Bot className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
            </div>
            <span className="font-semibold text-sm hidden sm:inline">HambakTech AI Assistant</span>
          </button>
        )}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          id="assistant-chat-panel"
          className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[420px] max-h-[620px] h-[85vh] bg-white dark:bg-dark border border-stroke dark:border-strokedark rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-primary text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  HambakTech Assistant
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </h3>
                <p className="text-xs text-white/80">Digital Services, NIN, CAC & Bills</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-dark/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white dark:bg-gray-dark text-dark dark:text-white border border-stroke dark:border-strokedark rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-body-color/70 mt-1 px-1">{msg.timestamp}</span>

                {/* Optional Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.actions.map((act, i) => (
                      <Link
                        key={i}
                        href={act.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary rounded-lg transition"
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-body-color italic p-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>HambakTech Assistant is searching knowledge base...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 border-t border-stroke dark:border-strokedark bg-white dark:bg-dark overflow-x-auto whitespace-nowrap">
            <div className="flex gap-1.5">
              {QUICK_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-stroke dark:border-strokedark hover:border-primary text-body-color hover:text-primary dark:text-gray-300 transition shrink-0"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white dark:bg-dark border-t border-stroke dark:border-strokedark flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about CAC, NIN, VTU, Academy, location..."
              className="flex-1 bg-gray-100 dark:bg-gray-dark border border-stroke dark:border-strokedark rounded-xl px-3.5 py-2 text-xs sm:text-sm text-dark dark:text-white focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              className="w-9 h-9 rounded-xl bg-primary disabled:opacity-50 text-white flex items-center justify-center shrink-0 hover:bg-primary/90 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
