import { ServiceCategory } from "@/types/service";
import ServiceCard from "./ServiceCard";

interface ServiceGridProps {
  services: ServiceCategory[];
  columns?: 2 | 3;
}

export default function ServiceGrid({ services, columns = 3 }: ServiceGridProps) {
  const colClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-6 sm:gap-8 ${colClass}`}>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
