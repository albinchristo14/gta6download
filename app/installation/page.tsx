import { SiloIndex, siloMetadata } from "@/components/SiloIndex";

export const metadata = siloMetadata("installation");

export default function SiloPage() {
  return <SiloIndex category="installation" />;
}
