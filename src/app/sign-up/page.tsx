"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignUpRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectParam = searchParams.get("redirect");
    const target = redirectParam
      ? `/signup?redirect=${encodeURIComponent(redirectParam)}`
      : "/signup";
    router.replace(target);
  }, [router, searchParams]);

  return null;
}

export default function SignUpAliasPage() {
  return (
    <Suspense fallback={null}>
      <SignUpRedirect />
    </Suspense>
  );
}
