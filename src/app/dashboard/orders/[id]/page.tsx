import React from "react";
import OrderDetailsClient from "./OrderDetailsClient";

export function generateStaticParams() {
  return [
    { id: "HT-ORD-1001" },
    { id: "HT-ORD-1002" },
    { id: "default" },
  ];
}

export default function OrderDetailsReceiptPage() {
  return <OrderDetailsClient />;
}
