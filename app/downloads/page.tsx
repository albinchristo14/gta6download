import { SiloIndex, siloMetadata } from "@/components/SiloIndex";

export const metadata = siloMetadata("downloads");

export default function SiloPage() {
  return <SiloIndex category="downloads" />;
}
