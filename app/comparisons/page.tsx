import { SiloIndex, siloMetadata } from "@/components/SiloIndex";

export const metadata = siloMetadata("comparisons");

export default function SiloPage() {
  return <SiloIndex category="comparisons" />;
}
