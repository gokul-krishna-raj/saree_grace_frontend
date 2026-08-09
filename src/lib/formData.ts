// Backend admin endpoints (products/variants/reviews) accept multipart/form-data with a
// fixed `images` file field, plus scalar fields as strings and object/array fields as JSON
// strings (see BACKEND_CONTRACT.md — `attributes`, `removeImagePublicIds`).
export function buildFormData(fields: Record<string, unknown>, images?: File[]): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  for (const file of images ?? []) {
    formData.append("images", file);
  }

  return formData;
}
