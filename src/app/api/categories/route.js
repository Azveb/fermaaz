import { prisma } from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth";
import { categoryCreateSchema } from "@/lib/validators";
import slugify from "slugify";

// GET /api/categories?locale=az — returns active category tree
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") || "az").toLowerCase();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameAz: "asc" }],
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
  });

  const localize = (cat) => ({
    id: cat.id,
    slug: cat.slug,
    name:
      locale === "en" ? cat.nameEn || cat.nameAz : locale === "ru" ? cat.nameRu || cat.nameAz : cat.nameAz,
    icon: cat.icon,
    parentId: cat.parentId,
  });

  const topLevel = categories
    .filter((c) => !c.parentId)
    .map((c) => ({
      ...localize(c),
      children: c.children.map(localize),
    }));

  return Response.json({ categories: topLevel });
}

// POST /api/categories — Admin/Super Admin only
export async function POST(request) {
  const authUser = getAuthUser(request);
  const denied = requireRole(authUser, ["ADMIN", "SUPER_ADMIN"]);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış JSON formatı" }, { status: 400 });
  }

  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validasiya xətası", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const baseSlug = slugify(data.nameAz, { lower: true, strict: true });

  // Ensure slug uniqueness
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const category = await prisma.category.create({
    data: { ...data, slug },
  });

  await prisma.auditLog.create({
    data: {
      userId: authUser.sub,
      action: "CATEGORY_CREATED",
      entity: "Category",
      entityId: category.id,
    },
  });

  return Response.json({ category }, { status: 201 });
}
