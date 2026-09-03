import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Supplier } from "../../../../../types/Supplier";
import { suppliersService } from "../../../../../app/services/suppliersService";
import { suppliersQueryKey, useSuppliers } from "../../../../../app/hooks/usePurchaseQueries";
import { useDebouncedValue } from "../../../../../app/hooks/useDebouncedValue";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { cn } from "../../../../../app/utils/cn";
import { ActionButton } from "../../../../components/ActionButton";
import { ContentHeader } from "../../../../components/ContentHeader";
import { Input } from "../../../../components/Input";
import { ListFeedback } from "../../../../components/ListFeedback";
import { TableComponents } from "../../../../components/TableElements";
import { SupplierModal } from "./components/SupplierModal";
import { DeactivateSupplierModal } from "./components/DeactivateSupplierModal";

import editIcon from '../../../../components/icons/edit-icon.svg';
import trashIcon from '../../../../components/icons/trash-icon.svg';

export function Suppliers() {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [supplierBeingEdited, setSupplierBeingEdited] = useState<Supplier | null>(null);
  const [supplierBeingDeactivated, setSupplierBeingDeactivated] = useState<Supplier | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const { suppliers, isFetching, isError, refetch } = useSuppliers(
    debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {},
  );

  const queryClient = useQueryClient();
  const { isPending: isReactivating, mutateAsync } = useMutation({
    mutationFn: suppliersService.update,
  });

  const handleReactivate = useCallback(async (supplier: Supplier) => {
    try {
      await mutateAsync({ id: supplier.id, active: true });

      queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
      toast.success(`${supplier.name} reativado!`);
    } catch (error) {
      toastApiError(error, 'Erro ao reativar o fornecedor!');
    }
  }, [mutateAsync, queryClient]);

  return (
    <>
      <SupplierModal visible={isCreating} onClose={() => setIsCreating(false)} />

      {supplierBeingEdited && (
        <SupplierModal
          visible
          supplier={supplierBeingEdited}
          onClose={() => setSupplierBeingEdited(null)}
        />
      )}

      {supplierBeingDeactivated && (
        <DeactivateSupplierModal
          visible
          supplier={supplierBeingDeactivated}
          onClose={() => setSupplierBeingDeactivated(null)}
        />
      )}

      <ContentHeader title="Fornecedores" quantity={suppliers.length}>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="pt-1 text-sm font-bold text-red-600"
        >
          Novo Fornecedor
        </button>
      </ContentHeader>

      <div className="mb-6">
        <Input
          type="text"
          name="search"
          placeholder="Buscar fornecedor"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </div>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={suppliers.length === 0}
        emptyMessage="Nenhum fornecedor cadastrado."
        errorMessage="Não foi possível carregar os fornecedores."
        onRetry={refetch}
      >
        <div className="space-y-3 md:hidden">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="rounded-lg border border-gray-600 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-gray-500">{supplier.name}</strong>

                  <span className="text-xs text-gray-400">
                    {supplier._count.purchases} compra(s)
                    {!supplier.active && ' · inativo'}
                  </span>
                </div>

                {supplier.active ? (
                  <div className="flex items-center">
                    <ActionButton
                      title="Editar fornecedor"
                      onClick={() => setSupplierBeingEdited(supplier)}
                    >
                      <img src={editIcon} alt="Editar" />
                    </ActionButton>

                    <ActionButton
                      title="Desativar fornecedor"
                      onClick={() => setSupplierBeingDeactivated(supplier)}
                    >
                      <img src={trashIcon} alt="Desativar" />
                    </ActionButton>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isReactivating}
                    onClick={() => handleReactivate(supplier)}
                    className={cn(
                      'shrink-0 text-sm font-bold text-red-600',
                      isReactivating && 'text-gray-400',
                    )}
                  >
                    Reativar
                  </button>
                )}
              </div>

              {(supplier.document || supplier.phone || supplier.email) && (
                <div className="mt-2 space-y-0.5 text-xs text-gray-400">
                  {supplier.document && <span className="block">{supplier.document}</span>}
                  {supplier.phone && <span className="block">{supplier.phone}</span>}
                  {supplier.email && <span className="block">{supplier.email}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Nome</TableComponents.TableHeader>
                <TableComponents.TableHeader>Documento</TableComponents.TableHeader>
                <TableComponents.TableHeader>Contato</TableComponents.TableHeader>
                <TableComponents.TableHeader>Compras</TableComponents.TableHeader>
                <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {suppliers.map(supplier => (
                <TableComponents.TableRow key={supplier.id}>
                  <TableComponents.TableCell>
                    {supplier.name}

                    {!supplier.active && (
                      <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-400">
                        Inativo
                      </span>
                    )}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>{supplier.document ?? '—'}</TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {supplier.phone ?? supplier.email ?? '—'}

                    {supplier.phone && supplier.email && (
                      <span className="block text-xs text-gray-400">{supplier.email}</span>
                    )}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {supplier._count.purchases}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {supplier.active ? (
                      <div className="flex items-center">
                        <ActionButton
                          title="Editar fornecedor"
                          onClick={() => setSupplierBeingEdited(supplier)}
                        >
                          <img src={editIcon} alt="Editar" />
                        </ActionButton>

                        <ActionButton
                          title="Desativar fornecedor"
                          onClick={() => setSupplierBeingDeactivated(supplier)}
                        >
                          <img src={trashIcon} alt="Desativar" />
                        </ActionButton>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isReactivating}
                        onClick={() => handleReactivate(supplier)}
                        className={cn(
                          'text-sm font-bold text-red-600',
                          isReactivating && 'text-gray-400',
                        )}
                      >
                        Reativar
                      </button>
                    )}
                  </TableComponents.TableCell>
                </TableComponents.TableRow>
              ))}
            </tbody>
          </TableComponents.Table>
        </div>
      </ListFeedback>
    </>
  );
}
