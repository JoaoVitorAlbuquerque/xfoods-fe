import { useSearchParams } from "react-router-dom";

import { RecipeType } from "../../../../../types/Recipe";
import { RecipeForm } from ".";

export function NewRecipe() {
  const [searchParams] = useSearchParams();

  const recipeType: RecipeType = searchParams.get('type') === 'SUB' ? 'SUB' : 'PRODUCT';
  const presetProductId = searchParams.get('productId') ?? undefined;

  return (
    <RecipeForm
      mode="create"
      recipeType={recipeType}
      presetProductId={presetProductId}
      backTo={recipeType === 'SUB' ? '/menu/sub-recipes' : '/menu/recipes'}
    />
  );
}
