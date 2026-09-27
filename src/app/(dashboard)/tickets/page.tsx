import { Suspense } from "react";
import { Tickets } from "@/components/tickets";
import { Loading } from "@/components/shared";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Tickets />
    </Suspense>
  );
}
