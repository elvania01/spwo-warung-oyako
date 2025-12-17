import { Suspense } from "react";
import DetailLaporanClient from "./detail3";

export default function DetailLaporanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading laporan...</div>}>
      <DetailLaporanClient />
    </Suspense>
  );
}
