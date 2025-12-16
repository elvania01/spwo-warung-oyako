"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: ("owner" | "kasir")[];
}) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/autentikasi/login");
      return;
    }

    const { role } = JSON.parse(user);

    if (!allow.includes(role)) {
      router.replace("/dashboard"); // redirect aman
      return;
    }

    setOk(true);
  }, []);

  if (!ok) return null;

  return <>{children}</>;
}
