import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Düzgün e-poçt daxil edin"),
  password: z
    .string()
    .min(8, "Şifrə ən azı 8 simvol olmalıdır")
    .regex(/[A-Z]/, "Şifrədə ən azı bir böyük hərf olmalıdır")
    .regex(/[0-9]/, "Şifrədə ən azı bir rəqəm olmalıdır"),
  fullName: z.string().min(2, "Ad Soyad tələb olunur"),
  phone: z.string().optional(),
  role: z
    .enum(["FARMER", "STORE", "AGRONOMIST", "BUYER", "DELIVERY_PARTNER"])
    .default("BUYER"),
  locale: z.enum(["AZ", "EN", "RU"]).default("AZ"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Şifrə tələb olunur"),
});

export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Sifarişdə ən azı 1 məhsul olmalıdır"),
  couponCode: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingRegion: z.string().optional(),
  shippingCity: z.string().optional(),
});

export const couponCreateSchema = z.object({
  code: z.string().min(3).max(30),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const couponUpdateSchema = z.object({
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().positive().optional(),
  minOrderValue: z.number().positive().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1),
  orderSubtotal: z.number().positive(),
});

export const listingUpsertSchema = z.object({
  productId: z.string().cuid(),
  tier: z.enum(["STANDARD", "FEATURED", "PREMIUM", "VIP"]),
  endDate: z.string().datetime().optional().nullable(),
  autoRenew: z.boolean().optional(),
});

export const campaignCreateSchema = z
  .object({
    title: z.string().min(3),
    type: z.enum([
      "HOMEPAGE_BANNER",
      "CATEGORY_BANNER",
      "STORE_PROMOTION",
      "FLASH_SALE",
      "DAILY_DEAL",
      "SPONSORED_PRODUCT",
      "REGIONAL",
    ]),
    bannerUrl: z.string().url().optional(),
    targetUrl: z.string().url().optional(),
    storeId: z.string().cuid().optional().nullable(),
    categoryId: z.string().cuid().optional().nullable(),
    region: z.string().optional(),
    startDate: z.string().min(8),
    endDate: z.string().min(8),
    budget: z.number().positive().optional(),
    costPerClick: z.number().positive().optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "Bitmə tarixi başlanğıc tarixindən sonra olmalıdır",
    path: ["endDate"],
  });

export const campaignUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "EXPIRED", "ENDED"]).optional(),
  bannerUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  targetUrl: z.string().url().optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  costPerClick: z.number().positive().optional(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(10),
  newPassword: z
    .string()
    .min(8, "Şifrə ən azı 8 simvol olmalıdır")
    .regex(/[A-Z]/, "Şifrədə ən azı bir böyük hərf olmalıdır")
    .regex(/[0-9]/, "Şifrədə ən azı bir rəqəm olmalıdır"),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  locale: z.enum(["AZ", "EN", "RU"]).optional(),
});

export const adminUserUpdateSchema = z.object({
  role: z
    .enum(["SUPER_ADMIN", "ADMIN", "MODERATOR", "FARMER", "STORE", "AGRONOMIST", "BUYER", "DELIVERY_PARTNER"])
    .optional(),
  status: z.enum(["ACTIVE", "PENDING_VERIFICATION", "SUSPENDED", "BANNED"]).optional(),
  isBanned: z.boolean().optional(),
});

export const categoryCreateSchema = z.object({
  nameAz: z.string().min(2),
  nameEn: z.string().optional(),
  nameRu: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const productCreateSchema = z.object({
  titleAz: z.string().min(3),
  titleEn: z.string().optional(),
  titleRu: z.string().optional(),
  descriptionAz: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionRu: z.string().optional(),
  price: z.number().positive("Qiymət müsbət olmalıdır"),
  currency: z.string().default("AZN"),
  stock: z.number().int().nonnegative().default(1),
  categoryId: z.string().cuid(),
  storeId: z.string().cuid().optional().nullable(),
  region: z.string().optional(),
  city: z.string().optional(),
  // Dynamic fields from form builder
  attributes: z.any().optional(),
  // Guest classified listing (no account) — required only when posting without login.
  guestName: z.string().min(2, "Ad tələb olunur").optional(),
  guestPhone: z
    .string()
    .regex(/^[+0-9][0-9\s-]{6,14}$/, "Düzgün telefon nömrəsi daxil edin")
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        altText: z.string().optional(),
      })
    )
    .optional(),
  isCorporate: z.boolean().default(false),
  minOrderQty: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

export const productUpdateSchema = productCreateSchema
  .partial()
  .extend({
    status: z.enum(["DRAFT", "PENDING_REVIEW", "ACTIVE", "SOLD", "EXPIRED", "REJECTED"]).optional(),
  });

export const storeCreateSchema = z.object({
  name: z.string().min(2, "Mağaza adı ən azı 2 simvol olmalıdır"),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  address: z.string().optional(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().nullable(),
});

export const storeUpdateSchema = storeCreateSchema.partial();

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1, "Reytinq 1-5 arası olmalıdır").max(5, "Reytinq 1-5 arası olmalıdır"),
  comment: z.string().max(2000).optional(),
});

// ---------- Phase 6: Wallet, Bundles, Blog, Messaging, Push ----------

export const walletWithdrawSchema = z.object({
  amount: z.number().positive("Məbləğ müsbət olmalıdır"),
  note: z.string().max(500).optional(),
});

export const bundleCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  storeId: z.string().cuid().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  productIds: z.array(z.string().cuid()).min(2, "Bağlamada ən azı 2 məhsul olmalıdır"),
});

export const bundleUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  productIds: z.array(z.string().cuid()).min(2).optional(),
});

export const blogCreateSchema = z.object({
  titleAz: z.string().min(3),
  titleEn: z.string().optional(),
  titleRu: z.string().optional(),
  contentAz: z.string().min(10),
  contentEn: z.string().optional(),
  contentRu: z.string().optional(),
  coverUrl: z.string().url().optional().nullable(),
  category: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const blogUpdateSchema = blogCreateSchema.partial();

export const messageCreateSchema = z.object({
  sellerId: z.string().cuid().optional(),
  buyerId: z.string().cuid().optional(),
  productId: z.string().cuid().optional().nullable(),
  content: z.string().min(1).max(3000),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});
