/**
 * As imagens de produto são servidas pela própria API em `/uploads`. Montar a
 * URL a partir do `VITE_API_URL` evita o `http://localhost:3000` fixo que já
 * existe em algumas telas antigas e que quebra fora da máquina do dev.
 */
export function getUploadUrl(imagePath?: string | null) {
  if (!imagePath) {
    return null;
  }

  return `${import.meta.env.VITE_API_URL}/uploads/${imagePath}`;
}
