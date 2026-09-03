import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { recipesService } from "../../../../../app/services/recipesService";
import { recipesQueryKey } from "../../../../../app/hooks/useRecipeQueries";
import { ListFeedback } from "../../../../components/ListFeedback";
import { RecipeForm } from ".";

export function EditRecipe() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode') === 'new-version' ? 'new-version' : 'edit';

  const { data: recipe, isFetching, isError, refetch } = useQuery({
    queryKey: [...recipesQueryKey, 'detail', recipeId],
    queryFn: () => recipesService.getById(recipeId!),
    enabled: Boolean(recipeId),
  });

  return (
    <ListFeedback
      isLoading={isFetching}
      isError={isError}
      isEmpty={!recipe}
      emptyMessage="Ficha não encontrada."
      errorMessage="Não foi possível carregar a ficha técnica."
      onRetry={refetch}
    >
      {recipe && (
        <RecipeForm
          mode={mode}
          recipeType={recipe.productId ? 'PRODUCT' : 'SUB'}
          recipe={recipe}
          backTo={`/menu/recipes/${recipe.id}`}
        />
      )}
    </ListFeedback>
  );
}
