import { Suspense } from "react";
import ChecklistClient from "./ChecklistClient";

export default function ChecklistPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading checklist…</div>}>
      <ChecklistClient />
    </Suspense>
  );
}
