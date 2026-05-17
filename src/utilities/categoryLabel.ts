const knownCategories = new Set([
  'career',
  'relationship',
  'finance',
  'health',
  'lifestyle',
  'education',
  'family',
  'other',
]);

export function getCategoryLabel(
  category: string,
  t: (key: string) => string,
) {
  const key = category.toLowerCase().trim();
  if (knownCategories.has(key)) return t(key);
  return category;
}
