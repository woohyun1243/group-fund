import type { ReactNode } from "react";

interface SectionCardProps {
  step: number;
  title: string;
  description: string;
  children?: ReactNode;
}

export default function SectionCard({
  step,
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="card">
      <div className="card-step">STEP {step}</div>
      <h2 className="card-title">{title}</h2>
      <p className="card-desc">{description}</p>
      {children}
    </section>
  );
}