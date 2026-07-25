import { prisma } from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "src/lib/adminStudioConfig.json");

export async function GET(request) {
  const authUser = getAuthUser(request);
  const denied = requireRole(authUser, ["ADMIN", "SUPER_ADMIN"]);
  if (denied) return denied;

  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return Response.json({ config: JSON.parse(raw) });
  } catch (error) {
    return Response.json({ error: "Konfigürasiya yüklənmədi" }, { status: 500 });
  }
}

export async function POST(request) {
  const authUser = getAuthUser(request);
  const denied = requireRole(authUser, ["ADMIN", "SUPER_ADMIN"]);
  if (denied) return denied;

  try {
    const body = await request.json();
    const raw = fs.readFileSync(configPath, "utf8");
    const current = JSON.parse(raw);
    const next = { ...current, ...body };
    fs.writeFileSync(configPath, JSON.stringify(next, null, 2));

    return Response.json({ success: true, config: next });
  } catch (error) {
    return Response.json({ error: "Konfigürasiya yenilənmədi" }, { status: 500 });
  }
}
