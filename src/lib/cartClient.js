"use client";

const CART_KEY = "fmk_cart";

export function getCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("fmk-cart-changed"));
}

function getMinOrderQty(item) {
  const minOrderQty = Number(item?.minOrderQty);
  return item?.isCorporate && Number.isInteger(minOrderQty) && minOrderQty > 0 ? minOrderQty : 1;
}

export function addToCart(product, quantity = 1) {
  const items = getCart();
  const existing = items.find((i) => i.productId === product.id);

  const minQty = getMinOrderQty(product);
  const requestedQty = Number.isFinite(Number(quantity)) ? Math.max(1, Math.floor(Number(quantity))) : 1;

  if (existing) {
    const currentQty = Number.isFinite(Number(existing.quantity)) ? Number(existing.quantity) : 0;
    existing.quantity = Math.max(currentQty + requestedQty, minQty);
    existing.isCorporate = !!product.isCorporate;
    existing.minOrderQty = product.isCorporate ? minQty : 1;
  } else {
    items.push({
      productId: product.id,
      title: product.title || product.titleAz,
      price: Number(product.price),
      coverImage: product.coverImage || product.images?.[0]?.url || null,
      quantity: Math.max(requestedQty, minQty),
      isCorporate: !!product.isCorporate,
      minOrderQty: minQty,
    });
  }
  saveCart(items);
  return { items, minQty };
}

export function updateQuantity(productId, quantity) {
  let items = getCart();
  const item = items.find((i) => i.productId === productId);

  if (quantity <= 0) {
    items = items.filter((i) => i.productId !== productId);
  } else if (item) {
    item.quantity = Math.max(Math.floor(Number(quantity)) || 1, getMinOrderQty(item));
  }
  saveCart(items);
  return items;
}

export function removeFromCart(productId) {
  const items = getCart().filter((i) => i.productId !== productId);
  saveCart(items);
  return items;
}

export function clearCart() {
  saveCart([]);
}

export function cartTotal(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
