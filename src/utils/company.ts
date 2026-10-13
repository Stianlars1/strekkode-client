export const COMPANY = {
  name: "Larsen Utvikling",
  url: "https://www.larsenutvikling.no/",
  email: "stian@larsenutvikling.no",
} as const;

export const CONTACT_HREF = `mailto:${COMPANY.email}?subject=${encodeURIComponent(
  "Hjelp med strekkoder – strek-kode.no"
)}`;
