import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/wallet — own wallet balance + recent transactions
export async function GET(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const wallet = await prisma.wallet.findUnique({
    where: { userId: authUser.sub },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!wallet) {
    return Response.json({ wallet: { balance: 0, currency: "AZN", transactions: [] } });
  }

  return Response.json({ wallet });
}
