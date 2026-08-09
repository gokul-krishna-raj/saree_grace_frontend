function appendFields(formData: FormData, fields: Record<string, unknown>) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }
}

// Backend admin endpoints (products/variants/reviews) accept multipart/form-data with a
// fixed `images` file field, plus scalar fields as strings and object/array fields as JSON
// strings (see BACKEND_CONTRACT.md — `attributes`, `removeImagePublicIds`).
export function buildFormData(fields: Record<string, unknown>, images?: File[]): FormData {
  const formData = new FormData();
  appendFields(formData, fields);
  for (const file of images ?? []) {
    formData.append("images", file);
  }
  return formData;
}

// Categories accept a single `image` file field (singular) rather than the `images` array
// used by products — see category.routes.ts's `uploadImages.single('image')`.
export function buildFormDataWithFile(
  fields: Record<string, unknown>,
  file: File | undefined,
  fileFieldName: string,
): FormData {
  const formData = new FormData();
  appendFields(formData, fields);
  if (file) formData.append(fileFieldName, file);
  return formData;
}
