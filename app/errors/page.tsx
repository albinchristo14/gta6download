import { SiloIndex, siloMetadata } from "@/components/SiloIndex";

export const metadata = siloMetadata("errors");

export default function SiloPage() {
  return <SiloIndex category="errors" />;
}
