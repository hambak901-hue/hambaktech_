import {
  Clock,
  ShieldCheck,
  Cpu,
  HeartHandshake,
  Layers,
  SearchCheck,
} from "lucide-react";

const valuePillars = [
  {
    icon: Layers,
    title: "Multiple Services in One Place",
    description:
      "Save time by accessing business documentation, printing, government portal submissions, corporate CAC registration, and IT development under one roof.",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Human Support",
    description:
      "Unlike impersonal automated forms, our physical centre staff and online desk provide attentive guidance for every form, document, and technical challenge.",
  },
  {
    icon: Cpu,
    title: "Technology-Driven Execution",
    description:
      "We utilize modern high-speed printing equipment, secure digital submission channels, and clean software development practices for top quality.",
  },
  {
    icon: ShieldCheck,
    title: "Data Confidentiality & Care",
    description:
      "Your certificates, identity records, business documents, and credentials are handled with strict privacy protocols and discretion.",
  },
  {
    icon: Clock,
    title: "Convenient Walk-in & Remote Access",
    description:
      "Visit our comfortable Ibeju-Lekki business centre for instant clerical operations, or initiate consultations and corporate projects online.",
  },
  {
    icon: SearchCheck,
    title: "Transparent Service Process",
    description:
      "Clear turnaround estimates, honest requirement checklists, and straightforward pricing with zero unexpected fees.",
  },
];

export default function WhyHambakTech() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white dark:bg-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-3">
            The HambakTech Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
            Why Individuals & Businesses Choose HambakTech
          </h2>
          <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed">
            We bridge the gap between physical neighborhood accessibility and forward-thinking digital platforms, delivering dependable services built on accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valuePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark transition-all duration-300 hover:border-primary/50"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-dark dark:text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-body-color dark:text-body-color-dark leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
