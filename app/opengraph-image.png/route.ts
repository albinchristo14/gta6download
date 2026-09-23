import { createElement } from "react";
import { ImageResponse } from "next/og";
import { OG_IMAGE_SIZE } from "@/lib/seo";
import { OgCard } from "./card";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(createElement(OgCard), OG_IMAGE_SIZE);
}
