export const itemId = 'desk-pot';
export const unitPrice = 12500;

export const colors = {
  gray: { en: 'Slate gray', ar: 'رمادي داكن' },
  ivory: { en: 'Ivory', ar: 'عاجي' },
};

function resolveLegacyColor(label) {
  const normalized = label.trim().toLowerCase();
  const matchingIds = Object.keys(colors).filter((id) =>
    Object.values(colors[id]).some((name) => name.toLowerCase() === normalized),
  );
  return matchingIds.length === 1 ? matchingIds[0] : null;
}

export function readCart(serialized) {
  let stored;
  try {
    stored = JSON.parse(serialized ?? 'null');
  } catch {
    return [];
  }
  const items = Array.isArray(stored) ? stored : stored?.items;
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    if (item?.productId !== itemId || !Number.isSafeInteger(item.quantity) || item.quantity < 1 ||
        !Number.isSafeInteger(item.unitPrice) || item.unitPrice < 0) return [];

    const legacyLabel = typeof item.colorLabel === 'string' ? item.colorLabel : '';
    const variantId = Object.hasOwn(colors, item.variantId) ? item.variantId : resolveLegacyColor(legacyLabel);
    return [{ productId: itemId, variantId, colorLabel: variantId ? '' : legacyLabel,
      quantity: item.quantity, unitPrice: item.unitPrice }];
  });
}

export function variantLabel(line, locale) {
  return colors[line.variantId]?.[locale] || line.colorLabel;
}

export function addVariant(cart, variantId) {
  if (!Object.hasOwn(colors, variantId)) return;
  const match = cart.find((line) => line.productId === itemId && line.variantId === variantId &&
    line.unitPrice === unitPrice);
  if (match) {
    match.quantity += 1;
  } else {
    cart.push({ productId: itemId, variantId, quantity: 1, unitPrice });
  }
}
