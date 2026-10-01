import React from "react";
import CertificateVerificationClient from "./CertificateVerificationClient";

export function generateStaticParams() {
  return [
    { code: "HT-CERT-2025-001" },
    { code: "HT-CERT-2025-002" },
    { code: "default" },
  ];
}

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function CertificateVerificationPage({ params }: PageProps) {
  const { code } = await params;
  return <CertificateVerificationClient code={code} />;
}
