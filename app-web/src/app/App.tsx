import { ConverterPage } from "@/features/converter";
import { Analytics } from "@vercel/analytics/react";

export function App() {
  return (
    <>
      <ConverterPage />
      <Analytics />
    </>
  );
}
