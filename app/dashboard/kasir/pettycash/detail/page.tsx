import { Suspense } from "react";
import DetailPettyCashClient from "./detail";

export default function DetailPettyCashPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading detail...</div>}>
      <DetailPettyCashClient />
    </Suspense>
  );
}
