"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectParam = searchParams.get("redirect");
    const target = redirectParam
      ? `/signin?redirect=${encodeURIComponent(redirectParam)}`
      : "/signin";
    router.replace(target);
  }, [router, searchParams]);

  return null;
}

export default function SignInAliasPage() {
  return (
    <Suspense fallback={null}>
      <SignInRedirect />
    </Suspense>
  );
}
