import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import apiUrl from "../utils/apiUrl";
import { Product } from "../types";
import "../styles/AdminProducts.css";

const ProductsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  const queryClient = useQueryClient();
  const limit = 10;

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", currentPage, searchTerm],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/admin/products`, {
        params: {
          page: currentPage,
          limit,
          search: searchTerm,
        },
        withCredentials: true,
      });
      return response.data;
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${apiUrl}/admin/products/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const response = await axios.post(`${apiUrl}/admin/products`, product, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowModal(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      product,
    }: {
      id: string;
      product: Partial<Product>;
    }) => {
      const response = await axios.put(
        `${apiUrl}/admin/products/${id}`,
        product,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowModal(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });

  const handleCreateProduct = () => {
    setModalMode("create");
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleViewProduct = (product: Product) => {
    setModalMode("view");
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      originalPrice:
        parseFloat(formData.get("originalPrice") as string) || undefined,
      image: formData.get("image") as string,
      category: formData.get("category") as string,
      specifications: formData.get("specifications") as string,
      packageContent: formData.get("packageContent") as string,
      inStock: formData.get("inStock") === "true",
    };

    if (modalMode === "create") {
      createProductMutation.mutate(productData);
    } else if (modalMode === "edit" && selectedProduct) {
      updateProductMutation.mutate({
        id: selectedProduct.id,
        product: productData,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  const products = productsData?.data || [];
  const totalPages = Math.ceil((productsData?.total || 0) / limit);

  return (
    <div className="products-page">
      {/* Header */}
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="btn btn-primary" onClick={handleCreateProduct}>
          <FaPlus /> Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                </td>
                <td>
                  <div>
                    <div className="product-name">{product.name}</div>
                    <div className="product-id">
                      ID: {product.id.slice(0, 8)}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{product.category}</span>
                </td>
                <td>
                  <div>
                    <div className="price">KES {product.price}</div>
                    {product.originalPrice && (
                      <div className="original-price">
                        KES {product.originalPrice}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      product.inStock
                        ? "status-in-stock"
                        : "status-out-of-stock"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td>
                  <div className="rating">
                    ⭐ {product.averageRating?.toFixed(1) || "N/A"}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleViewProduct(product)}
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditProduct(product)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteProduct(product.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === "create" && "Add New Product"}
                {modalMode === "edit" && "Edit Product"}
                {modalMode === "view" && "Product Details"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {modalMode === "view" ? (
                <div className="product-details">
                  <img
                    src={selectedProduct?.image}
                    alt={selectedProduct?.name}
                    className="detail-image"
                  />
                  <h3>{selectedProduct?.name}</h3>
                  <p>
                    <strong>Category:</strong> {selectedProduct?.category}
                  </p>
                  <p>
                    <strong>Price:</strong> KES {selectedProduct?.price}
                  </p>
                  {selectedProduct?.originalPrice && (
                    <p>
                      <strong>Original Price:</strong> KES{" "}
                      {selectedProduct.originalPrice}
                    </p>
                  )}
                  <p>
                    <strong>Description:</strong> {selectedProduct?.description}
                  </p>
                  <p>
                    <strong>Specifications:</strong> {}{" "}
                    <ReactMarkdown>
                      {selectedProduct?.specifications}
                    </ReactMarkdown>
                  </p>
                  <p>
                    <strong>Package Content:</strong>{" "}
                    <ReactMarkdown>
                      {selectedProduct?.packageContent}
                    </ReactMarkdown>
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedProduct?.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      defaultValue={selectedProduct?.name || ""}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      defaultValue={selectedProduct?.description || ""}
                      required
                    />
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        className="form-input"
                        defaultValue={selectedProduct?.price || ""}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Original Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="originalPrice"
                        className="form-input"
                        defaultValue={selectedProduct?.originalPrice || ""}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      name="image"
                      className="form-input"
                      defaultValue={selectedProduct?.image || ""}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      name="category"
                      className="form-input"
                      defaultValue={selectedProduct?.category || ""}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specifications</label>
                    <textarea
                      name="specifications"
                      className="form-textarea"
                      defaultValue={selectedProduct?.specifications || ""}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Package Content</label>
                    <textarea
                      name="packageContent"
                      className="form-textarea"
                      defaultValue={selectedProduct?.packageContent || ""}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Status</label>
                    <select
                      name="inStock"
                      className="form-select"
                      defaultValue={selectedProduct?.inStock ? "true" : "false"}
                    >
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        createProductMutation.isPending ||
                        updateProductMutation.isPending
                      }
                    >
                      {modalMode === "create"
                        ? "Create Product"
                        : "Update Product"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
