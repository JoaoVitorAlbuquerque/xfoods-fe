import { ContentHeader } from "../../../../components/ContentHeader";
import { Input } from "../../../../components/Input";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Spinner } from "../../../../components/Spinner";
import { CategoriesFilter } from "./components/CategoriesFilter";
import { ConfirmOrderModal } from "./components/ConfirmOrderModal";
import { MenuList } from "./components/MenuList";
import { OrderCart } from "./components/OrderCart";
import { OrderConfirmedModal } from "./components/OrderConfirmedModal";
import { ProductModal } from "./components/ProductModal";
import { TableModal } from "./components/TableModal";
import { useNewOrderController } from "./useNewOrderController";

export function NewOrder() {
  const {
    categories,
    isFetchingCategories,
    products,
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
  } = useNewOrderController();

  /**
   * O "+" da comanda recebe só o id, mas quem sabe adicionar é o handler que
   * trabalha com o produto inteiro — o item já está no carrinho, então basta
   * encontrá-lo.
   */
  function handleIncrementCartItem(productId: string) {
    const item = cartItems.find(cartItem => cartItem.product.id === productId);

    if (item) {
      handleAddToCart(item.product);
    }
  }

  return (
    <>
      <TableModal
        visible={isTableModalVisible}
        selectedTable={selectedTable}
        onClose={handleCloseTableModal}
        onSave={handleSaveTable}
      />

      <ProductModal
        product={selectedProduct}
        onClose={handleCloseProductModal}
        onAddToCart={handleAddToCart}
      />

      <ConfirmOrderModal
        visible={isConfirmModalVisible}
        table={selectedTable}
        cartItems={cartItems}
        total={total}
        description={description}
        isLoading={isCreatingOrder}
        onChangeDescription={setDescription}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmOrder}
      />

      <OrderConfirmedModal
        visible={isConfirmedModalVisible}
        table={selectedTable}
        onClose={handleCloseConfirmedModal}
      />

      {/*
        Mobile primeiro: a comanda vem antes do cardápio para ficar ao alcance
        do polegar sem rolar a lista inteira. A partir de `lg` ela vira a
        coluna da direita, ao lado do cardápio.
      */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <section className="order-2 lg:order-1">
          <ContentHeader title="Cardápio" quantity={products.length} />

          <div className="space-y-4">
            <Input
              name="search"
              placeholder="Busque um produto"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />

            {isFetchingCategories ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <CategoriesFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={handleSelectCategory}
              />
            )}

            <ListFeedback
              isLoading={isFetchingProducts}
              isError={isProductsError}
              isEmpty={products.length === 0}
              emptyMessage={
                searchTerm
                  ? 'Nenhum produto encontrado para essa busca.'
                  : 'Nenhum produto neste filtro.'
              }
              errorMessage="Não foi possível carregar o cardápio."
              onRetry={refetchProducts}
            >
              <MenuList
                products={products}
                onOpenProduct={handleOpenProductModal}
                onAddToCart={handleAddToCart}
              />
            </ListFeedback>
          </div>
        </section>

        <section className="order-1 lg:sticky lg:top-4 lg:order-2">
          <ContentHeader title="Pedido" quantity={totalItems} />

          <OrderCart
            cartItems={cartItems}
            selectedTable={selectedTable}
            total={total}
            onAdd={handleIncrementCartItem}
            onDecrement={handleDecrementCartItem}
            onRemove={handleRemoveCartItem}
            onChangeSize={handleChangeCartItemSize}
            onChangeTable={handleOpenTableModal}
            onCancelOrder={handleResetOrder}
            onConfirm={handleOpenConfirmModal}
          />
        </section>
      </div>
    </>
  );
}
