"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export default function QRCodeView({
  value,
  size = 140,
  className = "",
  darkColor = "#0A1D37",
  lightColor = "#FFFFFF",
}: QRCodeViewProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [value, size, darkColor, lightColor]);

  if (!dataUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] text-gray-400">Loading QR...</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={`QR code for ${value}`}
      width={size}
      height={size}
      className={`rounded shadow-sm ${className}`}
    />
  );
}
