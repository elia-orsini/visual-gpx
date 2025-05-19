export const fetchOptions = { next: { revalidate: 120 } }; // 2 minutes

export const allTemplates: Record<string, string> = {
  template1: "/api/template-1",
  template2: "/api/template-2",
};
