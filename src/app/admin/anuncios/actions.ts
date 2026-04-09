"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

type AdPosition =
  | "HOME_TOP"
  | "HOME_SIDEBAR"
  | "ARTICLE_INLINE"
  | "ARTICLE_SIDEBAR"
  | "EDITIONS_TOP";

export async function createAd(_: unknown, formData: FormData) {
  try {
    await prisma.advertisement.create({
      data: {
        name: formData.get("name") as string,
        advertiser: formData.get("advertiser") as string,
        imageUrl: formData.get("imageUrl") as string,
        targetUrl: formData.get("targetUrl") as string,
        position: formData.get("position") as AdPosition,
        active: formData.get("active") === "on",
        startsAt: formData.get("startsAt")
          ? new Date(formData.get("startsAt") as string)
          : null,
        endsAt: formData.get("endsAt")
          ? new Date(formData.get("endsAt") as string)
          : null,
        maxImpressions: formData.get("maxImpressions")
          ? Number(formData.get("maxImpressions"))
          : null,
      },
    });
    revalidatePath("/admin/anuncios");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao criar anúncio." };
  }
}

export async function updateAd(_: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  try {
    await prisma.advertisement.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        advertiser: formData.get("advertiser") as string,
        imageUrl: formData.get("imageUrl") as string,
        targetUrl: formData.get("targetUrl") as string,
        position: formData.get("position") as AdPosition,
        active: formData.get("active") === "on",
        startsAt: formData.get("startsAt")
          ? new Date(formData.get("startsAt") as string)
          : null,
        endsAt: formData.get("endsAt")
          ? new Date(formData.get("endsAt") as string)
          : null,
      },
    });
    revalidatePath("/admin/anuncios");
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message || "Erro ao atualizar anúncio." };
  }
}
