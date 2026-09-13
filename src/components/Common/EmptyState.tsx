import { LucideIcon, Inbox } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  actionHref,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-stroke dark:border-strokedark bg-white dark:bg-dark ${className}`}
    >
      <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-primary/10 text-primary">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-dark dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-body-color dark:text-body-color-dark max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition duration-200"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
