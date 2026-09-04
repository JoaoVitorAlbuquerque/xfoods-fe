import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriesService } from "../../../../../app/services/categoriesService";
import { ordersService } from "../../../../../app/services/ordersService";
import { productsService } from "../../../../../app/services/productsService";
import { applySizePrice } from "../../../../../app/utils/sizePrice";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { CartItem } from "../../../../../types/CartItem";
import { MenuProduct } from "../../../../../types/MenuProduct";
import { SizeType } from "../../../../../types/Recipe";

/**
 * No aplicativo as abas são telas vivas e a comanda sobrevive a ir e voltar da
 * lista de pedidos. Na web, trocar de rota desmonta o componente — o rascunho
 * fica no `sessionStorage` para o garçom não perder a comanda por um toque
 * errado. É por aba do navegador e some ao fechar, que é o tempo de vida certo
 * para um pedido em montagem.
 */
const ORDER_DRAFT_KEY = 'xfoods:orderDraft';

interface OrderDraft {
  table: string;
  items: CartItem[];
}

const emptyDraft: OrderDraft = { table: '', items: [] };

function readDraft(): OrderDraft {
  try {
    const stored = sessionStorage.getItem(ORDER_DRAFT_KEY);

    return stored ? { ...emptyDraft, ...JSON.parse(stored) } : emptyDraft;
  } catch {
    return emptyDraft;
  }
}

/**
 * Categorias em que o tamanho não faz sentido — a regra vem do aplicativo, que
 * esconde o seletor para elas. A comparação é pelo nome porque é o que a API
 * devolve; se a categoria for renomeada, o seletor volta a aparecer.
 */
const SIZELESS_CATEGORIES = ['bebidas', 'vinhos'];

export function hasSizeChoice(product: MenuProduct) {
  const categoryName = product.category?.name?.toLowerCase() ?? '';

  return !SIZELESS_CATEGORIES.includes(categoryName);
}

export function useNewOrderController() {
  const queryClient = useQueryClient();

  const [selectedTable, setSelectedTable] = useState(() => readDraft().table);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readDraft().items);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [description, setDescription] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [isTableModalVisible, setIsTableModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isConfirmedModalVisible, setIsConfirmedModalVisible] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        ORDER_DRAFT_KEY,
        JSON.stringify({ table: selectedTable, items: cartItems }),
      );
    } catch {
      // Aba anônima ou armazenamento bloqueado: perder o rascunho é aceitável,
      // derrubar a tela de pedido não é.
    }
  }, [selectedTable, cartItems]);

  const {
    data: categories = [],
    isFetching: isFetchingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

  const {
    data: products = [],
    isFetching: isFetchingProducts,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['menu-products', selectedCategoryId],
    queryFn: () => (
      selectedCategoryId
        ? productsService.getByCategory(selectedCategoryId)
        : productsService.getMenu()
    ),
  });

  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationFn: ordersService.create,
  });

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return products;
    }

    return products.filter(product => (
      product.name.toLowerCase().includes(term)
      || (product.description ?? '').toLowerCase().includes(term)
    ));
  }, [products, searchTerm]);

  const total = cartItems.reduce((acc, { product, quantity, size }) => (
    acc + applySizePrice(product.price * quantity, size)
  ), 0);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  function handleSelectCategory(categoryId: string) {
    // Clicar de novo na categoria já escolhida volta para o cardápio inteiro,
    // como no aplicativo.
    setSelectedCategoryId(current => (current === categoryId ? '' : categoryId));
  }

  function handleOpenTableModal() {
    setIsTableModalVisible(true);
  }

  function handleCloseTableModal() {
    setIsTableModalVisible(false);
  }

  function handleSaveTable(table: string) {
    setSelectedTable(table);
    handleCloseTableModal();
  }

  function handleOpenProductModal(product: MenuProduct) {
    setSelectedProduct(product);
  }

  function handleCloseProductModal() {
    setSelectedProduct(null);
  }

  function handleAddToCart(product: MenuProduct) {
    // A mesa é obrigatória no `POST /orders`. O item entra no carrinho mesmo
    // assim e o modal abre em seguida — assim o garçom não perde o toque.
    if (!selectedTable) {
      handleOpenTableModal();
    }

    setCartItems(currentItems => {
      const itemIndex = currentItems.findIndex(
        item => item.product.id === product.id,
      );

      if (itemIndex < 0) {
        return currentItems.concat({ product, quantity: 1, size: 'MEAN' });
      }

      return currentItems.map((item, index) => (
        index === itemIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    });
  }

  function handleDecrementCartItem(productId: string) {
    setCartItems(currentItems => currentItems.flatMap(item => {
      if (item.product.id !== productId) {
        return item;
      }

      return item.quantity === 1 ? [] : { ...item, quantity: item.quantity - 1 };
    }));
  }

  function handleRemoveCartItem(productId: string) {
    setCartItems(currentItems => currentItems.filter(
      item => item.product.id !== productId,
    ));
  }

  function handleChangeCartItemSize(productId: string, size: SizeType) {
    setCartItems(currentItems => currentItems.map(item => (
      item.product.id === productId ? { ...item, size } : item
    )));
  }

  function handleResetOrder() {
    setSelectedTable('');
    setCartItems([]);
    setDescription('');
  }

  function handleOpenConfirmModal() {
    if (!selectedTable) {
      handleOpenTableModal();
      return;
    }

    setIsConfirmModalVisible(true);
  }

  function handleCloseConfirmModal() {
    setIsConfirmModalVisible(false);
  }

  async function handleConfirmOrder() {
    try {
      await createOrder({
        table: Number(selectedTable),
        // A API aceita `description` opcional; string vazia só polui o
        // histórico, então ela nem é enviada.
        description: description.trim() || undefined,
        products: cartItems.map(({ product, quantity, size }) => ({
          productId: product.id,
          size,
          quantity,
        })),
      });

      // O `orderCreated` do socket só é emitido quando o pedido chega pelo
      // gateway; criando por HTTP, é esta invalidação que atualiza a Home e a
      // aba de pedidos.
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      setIsConfirmModalVisible(false);
      setIsConfirmedModalVisible(true);
    } catch (error) {
      toastApiError(error, 'Não foi possível enviar o pedido.');
    }
  }

  function handleCloseConfirmedModal() {
    setIsConfirmedModalVisible(false);
    handleResetOrder();
  }

  return {
    categories,
    isFetchingCategories,
    products: filteredProducts,
    isFetchingProducts,
    isProductsError,
    refetchProducts,
    selectedCategoryId,
    handleSelectCategory,
    searchTerm,
    setSearchTerm,
    selectedTable,
    isTableModalVisible,
    handleOpenTableModal,
    handleCloseTableModal,
    handleSaveTable,
    selectedProduct,
    handleOpenProductModal,
    handleCloseProductModal,
    cartItems,
    total,
    totalItems,
    handleAddToCart,
    handleDecrementCartItem,
    handleRemoveCartItem,
    handleChangeCartItemSize,
    handleResetOrder,
    description,
    setDescription,
    isConfirmModalVisible,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleConfirmOrder,
    isCreatingOrder,
    isConfirmedModalVisible,
    handleCloseConfirmedModal,
  };
}
