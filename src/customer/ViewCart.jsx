import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../features/cartContext";

const ViewCart = () => {
  const {
    items: cartItems,
    update: updateItem,
    remove: removeItem,
    loading,
  } = useCart();
  const navigate = useNavigate();

  const getProductId = (item) => item.productId;
  const getQty = (item) => item.qty ?? item.quantity ?? 1;
  const getPrice = (item) =>
    item.product?.finalPrice ?? item.finalPrice ?? item.product?.price ?? 0;
  // Memoize calculations for performance
  const cartSummary = useMemo(() => {
    const subtotal = (cartItems || []).reduce((sum, item) => {
      return sum + getPrice(item) * getQty(item);
    }, 0);
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
  }, [cartItems]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateItem(itemId, newQuantity).catch((err) => console.error(err));
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId).catch((err) => console.error(err));
  };

  return (
    <main className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <a
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items - Desktop */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>

                        <tbody className="divide-y divide-gray-200">
                    {(cartItems || []).map((item) => {
                      const productId = getProductId(item);
                      const qty = getQty(item);
                      const price = getPrice(item);
                      const product = item.product ?? item;
                      return (
                        <tr key={productId}>
                          {/* first Product portion with Image, title, size, color, and condition */}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  src={product.image || item.product}
                                  alt={product.title || item.title}
                                  className="h-full w-full object-cover object-center"
                                  loading="lazy"
                                />
                              </div>
                              <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {product.title || item.title}
                                </h3>
                                <div className="mt-1 text-sm text-gray-500">
                                  <p>Size: {item.product.size}</p>
                                  <p>Color: {item.product.color || "Black"}</p>
                                  <p>Condition: {item.product.condition}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Price */}
                          <td className="px-6 py-4 text-center text-sm text-gray-900">
                            Rs. {price.toFixed(2)}
                          </td>

                          {/* Quantity Increment and decrement button */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() =>
                                  handleQuantityChange(productId, Math.max(1, qty - 1))
                                }
                                className="text-gray-500 hover:text-gray-700 p-1"
                                disabled={qty <= 1}
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                  />
                                </svg>
                              </button>
                              <input
                                type="number"
                                value={qty}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    productId,
                                    parseInt(e.target.value || 1)
                                  )
                                }
                                className="mx-2 w-12 text-center border rounded-md"
                                min="1"
                              />
                              <button
                                onClick={() =>
                                  handleQuantityChange(productId, Math.max(1 , qty + 1))
                                }
                                className="text-gray-500 hover:text-gray-700 p-1"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                          {/* Total after quantity*/}
                          <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                            Rs. {(price * qty).toFixed(2)}
                          </td>
                          {/* Remove item button */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleRemoveItem(productId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cart Items - Mobile */}
                    <div className="md:hidden space-y-4">
                {(cartItems || []).map((item) => {
                  const ProductId = getProductId(item);
                  const qty = getQty(item);
                  const price = getPrice(item);
                  const product = item.product ?? item;
                  return (
                    <div key={ProductId} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-start space-x-4">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={product.image || item.image}
                            alt={product.title || item.title}
                            className="h-full w-full object-cover object-center"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-900">
                            {product.title || item.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Size: {item.size} | Color: {item.color || "Black"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Condition: {item.condition}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-base font-medium text-gray-900">
                              Rs.{price.toFixed(2)}
                            </p>
                            <div className="flex items-center">
                              <button
                                onClick={() =>
                                  handleQuantityChange(ProductId, Math.max(1, qty - 1))
                                }
                                className="text-gray-500 hover:text-gray-700 p-1"
                                disabled={qty <= 1}
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                  />
                                </svg>
                              </button>
                              <span className="mx-2 text-gray-700">{qty}</span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(ProductId, qty + 1)
                                }
                                className="text-gray-500 hover:text-gray-700 p-1"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                              Total:{" "}
                              <span className="font-medium text-gray-900">
                                Rs. {(price * qty).toFixed(2)}
                              </span>
                            </p>
                            <button
                              onClick={() => handleRemoveItem(ProductId)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      Rs.{cartSummary.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {cartSummary.shipping === 0
                        ? "FREE"
                        : `Rs.${cartSummary.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {/* <div className='flex justify-between text-sm'>
                                        <span className='text-gray-600'>Tax</span>
                                        <span className='font-medium'>Rs.{cartSummary.tax.toFixed(2)}</span>
                                    </div> */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">
                        Total
                      </span>
                      <span className="text-base font-medium text-gray-900">
                        Rs.{cartSummary.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-6 bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium"
                  onClick={() => {
                    navigate("/order");
                  }}
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <a
                    href="/"
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Continue Shopping
                  </a>
                </div>

                {/* Trust badges */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ViewCart;
