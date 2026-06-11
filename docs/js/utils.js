export const qs = (selector, element = document) => element.querySelector(selector);
export const qsa = (selector, element = document) => Array.from(element.querySelectorAll(selector));

export async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.status}`);
  return response.json();
}
