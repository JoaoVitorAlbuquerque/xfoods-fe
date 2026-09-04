import { cn } from "../../../../../../app/utils/cn";
import { getUploadUrl } from "../../../../../../app/utils/getUploadUrl";
import noImage from "../../../../../components/icons/no-image.svg";

interface ProductImageProps {
  imagePath: string | null;
  name: string;
  className?: string;
}

/** Produto sem foto é comum no cadastro — cai no placeholder em vez do ícone
 *  de imagem quebrada do navegador. */
export function ProductImage({ imagePath, name, className }: ProductImageProps) {
  const url = getUploadUrl(imagePath);

  return (
    <img
      src={url ?? noImage}
      alt={name}
      className={cn('shrink-0 rounded-lg object-cover', className)}
    />
  );
}
