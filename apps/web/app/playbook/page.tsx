import { Suspense } from "react";
import PlaybookClient from "./PlaybookClient";

export default function PlaybookPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading playbook…</div>}>
      <PlaybookClient />
    </Suspense>
  );
}
