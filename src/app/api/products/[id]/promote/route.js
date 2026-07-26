import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request, { params }) {
  const authUser = getAuthUser(request);
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { listing: true }
  });

  if (!product || product.sellerId !== authUser.sub) {
    return Response.json({ error: "Not found or not yours" }, { status: 404 });
  }

  let body = {};
  try {
     body = await request.json();
  } catch(e) {}

  const tier = body.tier || "PREMIUM";
  const days = body.days || 30;

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  await prisma.listing.upsert({
    where: { productId: id },
    update: { tier, endDate },
    create: {
      productId: id,
      tier,
      endDate
    }
  });

  return Response.json({ success: true });
}
