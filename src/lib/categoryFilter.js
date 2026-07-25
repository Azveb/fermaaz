import { prisma } from "@/lib/prisma";

// The category dropdown only lists top-level (parent) categories, but every
// product is actually assigned to a leaf/child category (e.g. "Bal" under
// "Arıçılıq"). Filtering by the parent's slug directly (`category: { slug }`)
// therefore matched zero products even when matching items existed — this
// resolves a parent slug to itself + all its child slugs so the filter
// actually works. If the slug is already a child/leaf category (or has no
// children), it resolves to just that slug, unchanged.
export async function resolveCategorySlugs(slug) {
  if (!slug) return null;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: { select: { slug: true } } },
  });
  if (!category) return [slug]; // unknown slug — let the query return zero results as before
  if (category.children.length) {
    return [category.slug, ...category.children.map((c) => c.slug)];
  }
  return [category.slug];
}
