import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { hashPassword, signAccessToken, signRefreshToken, refreshTokenExpiryDate } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function POST(request) {
  // Apply requested rate limiting: 3 attempts / hour (60 * 60_000 ms)
  const rl = rateLimit(request, { limit: 3, windowMs: 60 * 60_000, keyPrefix: "register" });
  if (rl) return rl;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış JSON formatı" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validasiya xətası", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, password, fullName, phone, role, locale } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Bu e-poçt artıq qeydiyyatdan keçib" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone,
      role,
      locale,
      status: "PENDING_VERIFICATION",
    },
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiryDate(),
    },
  });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_REGISTERED",
      entity: "User",
      entityId: user.id,
      metadata: { details: `Registered from IP: ${ip}` },
    },
  });

  // Fire-and-forget welcome email
  sendWelcomeEmail({ to: user.email, fullName: user.fullName });

  return Response.json(
    {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        locale: user.locale,
        status: user.status,
      },
      accessToken,
      refreshToken,
    },
    { status: 201 }
  );
}
