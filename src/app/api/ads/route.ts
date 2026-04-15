import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const dynamic = "force-dynamic";

interface RawAd {
  id: string;
  name: string;
  advertiser: string;
  imageUrl: string;
  targetUrl: string;
  bannerSize: string;
  startsAt: string | null;
  endsAt: string | null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const position   = searchParams.get("position");
  const bannerSize = searchParams.get("bannerSize");

  let url =
    `https://${PROJECT}.supabase.co/rest/v1/advertisements` +
    `?active=eq.true` +
    `&select=id,name,advertiser,imageUrl,targetUrl,bannerSize,startsAt,endsAt`;

  if (position)   url += `&position=eq.${encodeURIComponent(position)}`;
  if (bannerSize) url += `&bannerSize=eq.${encodeURIComponent(bannerSize)}`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE,
        Authorization: `Bearer ${SERVICE}`,
      },
      cache: "no-store",
    });

    const data: RawAd[] = await res.json();
    if (!Array.isArray(data)) return NextResponse.json([]);

    // Filtra por período de veiculação
    const now = new Date();
    const valid = data.filter((ad) => {
      if (ad.startsAt && new Date(ad.startsAt) > now) return false;
      if (ad.endsAt   && new Date(ad.endsAt)   < now) return false;
      return true;
    });

    return NextResponse.json(valid);
  } catch {
    return NextResponse.json([]);
  }
}
