import { SiloIndex, siloMetadata } from "@/components/SiloIndex";

export const metadata = siloMetadata("guides");

export default function SiloPage() {
  return <SiloIndex category="guides" />;
}
