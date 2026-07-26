const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
  {
    name: "Bitki Mühafizə Vasitələri",
    slug: "bitki-muhafize",
    icon: "bug",
    children: [
      {
        name: "Kimyəvi və Bioloji Qoruma",
        slug: "kimyevi-ve-bioloji-qoruma",
        children: [
          { name: "Herbisidlər (Otlara qarşı)", slug: "herbisidler" },
          { name: "Fungisidlər (Məngənə və göbələk)", slug: "fungisidler" },
          { name: "İnsektisidlər (Zərərvericilərə qarşı)", slug: "insektisidler" },
          { name: "Akarisidlər (Gənələrə qarşı)", slug: "akarisidler" },
          { name: "Nematosidlər (Qurd və nematodlara qarşı)", slug: "nematosidler" }
        ]
      },
      {
        name: "Köməkçi Maddələr",
        slug: "komekci-maddeler",
        children: [
          { name: "Yapışdırıcılar (Adjuvantlar)", slug: "yapisdiricilar" },
          { name: "Dezinfeksiya və Sanitayzerlər", slug: "dezinfeksiya" }
        ]
      }
    ]
  },
  {
    name: "Gübrələr və Bitki Qidalanması",
    slug: "gubreler",
    icon: "sprout",
    children: [
      {
        name: "Gübrə Növləri",
        slug: "gubre-novleri",
        children: [
          { name: "Maye gübrələr", slug: "maye-gubreler" },
          { name: "Qranul gübrələr", slug: "qranul-gubreler" },
          { name: "Yarpaq (Foliar) gübrələri", slug: "yarpaq-gubreleri" }
        ]
      },
      {
        name: "Üzvi və Bioloji gübrələr",
        slug: "uzvi-bioloji-gubreler",
        children: [
          { name: "Humik / Fulvik turşuları", slug: "humik-fulvik" },
          { name: "Dəniz yosunu məhsulları", slug: "deniz-yosunu" },
          { name: "Amin turşuları", slug: "amin-tursulari" },
          { name: "Mikroelement kompleksləri", slug: "mikroelement-kompleksleri" }
        ]
      },
      {
        name: "Makroelementlər",
        slug: "makroelementler",
        children: [
          { name: "Azot (N)", slug: "azot" },
          { name: "Fosfor (P)", slug: "fosfor" },
          { name: "Kalium (K)", slug: "kalium" },
          { name: "Kalsium (Ca)", slug: "kalsium" },
          { name: "Maqnezium (Mg)", slug: "maqnezium" }
        ]
      },
      {
        name: "Mikroelementlər",
        slug: "mikroelementler-2",
        children: [
          { name: "Bor (B)", slug: "bor" },
          { name: "Sink (Zn)", slug: "sink" },
          { name: "Dəmir (Fe)", slug: "demir" },
          { name: "Manqan (Mn)", slug: "manqan" },
          { name: "Mis (Cu)", slug: "mis" },
          { name: "Molibden (Mo)", slug: "molibden" }
        ]
      }
    ]
  },
  {
    name: "Toxumlar və Tinglər",
    slug: "toxum-ting",
    icon: "leaf",
    children: [
      { name: "Taxıl (Buğda, Arpa)", slug: "taxil" },
      { name: "Pambıq", slug: "pambiq" },
      { name: "Qarğıdalı", slug: "qargidali" },
      { name: "Yonca", slug: "yonca" },
      {
        name: "Tərəvəz və Meyvə",
        slug: "terevez-meyve",
        children: [
          { name: "Tərəvəz toxumları", slug: "terevez-toxumlari" },
          { name: "Meyvə tingləri", slug: "meyve-tingleri" }
        ]
      }
    ]
  },
  {
    name: "Aqrotexnika və Avadanlıqlar",
    slug: "aqrotexnika",
    icon: "tractor",
    children: [
      {
        name: "Səpin və Çiləmə Texnikası",
        slug: "sepin-cileme",
        children: [
          { name: "Çiləyicilər (Əl və Mexaniki)", slug: "cileyiciler" },
          { name: "Kənd Təsərrüfatı Dronları", slug: "dronlar" },
          { name: "Gübrəsəpənlər", slug: "gubresepenler" }
        ]
      },
      {
        name: "Suvarma və Mexanizasiya",
        slug: "suvarma-mexanizasiya",
        children: [
          { name: "Suvarma sistemləri (Damlama, Büzmə)", slug: "suvarma-sistemleri" },
          { name: "Traktor və avadanlıqları", slug: "traktorlar" },
          { name: "Aqreqatlar", slug: "aqreqatlar" }
        ]
      }
    ]
  }
];

async function main() {
  console.log("Wiping existing products, categories, and related tables...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bundleItem.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.category.deleteMany();

  console.log("Seeding new category tree...");

  for (let i = 0; i < categories.length; i++) {
    const root = categories[i];
    const rootRecord = await prisma.category.create({
      data: {
        nameAz: root.name,
        slug: root.slug,
        icon: root.icon,
        sortOrder: i + 1,
      }
    });

    if (root.children) {
      for (let j = 0; j < root.children.length; j++) {
        const sub = root.children[j];
        const subRecord = await prisma.category.create({
          data: {
            nameAz: sub.name,
            slug: sub.slug,
            parentId: rootRecord.id,
            sortOrder: j + 1
          }
        });

        if (sub.children) {
          for (let k = 0; k < sub.children.length; k++) {
            const subSub = sub.children[k];
            await prisma.category.create({
              data: {
                nameAz: subSub.name,
                slug: subSub.slug,
                parentId: subRecord.id,
                sortOrder: k + 1
              }
            });
          }
        }
      }
    }
  }

  console.log("Categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
