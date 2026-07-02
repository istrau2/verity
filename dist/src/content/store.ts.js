export const records = /* @__PURE__ */ new Map();
export const page = { url: location.href, title: document.title };
export function emit(type, detail) {
  document.dispatchEvent(new CustomEvent(`verity:${type}`, { detail }));
}
export function on(type, cb) {
  const handler = (e) => cb(e.detail);
  document.addEventListener(`verity:${type}`, handler);
  return () => document.removeEventListener(`verity:${type}`, handler);
}
