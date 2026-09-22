import { SiloIndex, siloMetadata } from "@/components/SiloIndex";

export const metadata = siloMetadata("requirements");

export default function SiloPage() {
  return <SiloIndex category="requirements" />;
}
