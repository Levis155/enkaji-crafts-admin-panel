import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaSearch } from "react-icons/fa";
import apiUrl from "../utils/apiUrl";
import { Order } from "../types";
import "../styles/AdminOrders.css";

const OrdersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const queryClient = useQueryClient();
  const limit = 10;

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", currentPage, searchTerm, statusFilter],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/admin/orders`, {
        params: {
          page: currentPage,
          limit,
          search: searchTerm,
          status: statusFilter,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        withCredentials: true,
      });
      return response.data;
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await axios.put(
        `${apiUrl}/admin/orders/${id}/status`,
        { status },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    },
  });

  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await axios.get(`${apiUrl}/admin/orders/${orderId}`, {
        withCredentials: true,
      });

      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load order details"
      );
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "delivered":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  const orders = ordersData?.data || [];
  const totalPages = Math.ceil((ordersData?.total || 0) / limit);

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="page-header">
        <h1>Orders Management</h1>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by order number, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: Order) => (
              <tr key={order.id}>
                <td>
                  <div className="order-number">#{order.orderNumber}</div>
                  <div className="order-id">ID: {order.id.slice(0, 8)}</div>
                </td>
                <td>
                  <div>
                    <div className="customer-name">{order.user.fullName}</div>
                    <div className="customer-email">
                      {order.user.emailAddress}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="order-date">
                    {formatDate(order.createdAt)}
                  </div>
                </td>
                <td>
                  <div className="items-count">
                    {order.orderItems.length} items
                  </div>
                </td>
                <td>
                  <div className="total-price">
                    KES {order.totalPrice.toFixed(2)}
                  </div>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`status-select ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      order.isPaid ? "status-paid" : "status-unpaid"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleViewOrder(order.id)}
                      title="View Details"
                    >
                      <FaEye />
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

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                Order #{selectedOrder.orderNumber}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-details">
                {/* Order Summary */}
                <div className="detail-section">
                  <h4>Order Summary</h4>
                  <div className="detail-grid">
                    <div>
                      <strong>Order ID:</strong> {selectedOrder.id}
                    </div>
                    <div>
                      <strong>Date:</strong>{" "}
                      {formatDate(selectedOrder.createdAt)}
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <span
                        className={`status-badge ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <strong>Payment:</strong>
                      <span
                        className={`status-badge ${
                          selectedOrder.isPaid ? "status-paid" : "status-unpaid"
                        }`}
                      >
                        {selectedOrder.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <div className="detail-grid">
                    <div>
                      <strong>Name:</strong> {selectedOrder.user.fullName}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedOrder.user.emailAddress}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selectedOrder.user.phoneNumber}
                    </div>
                    <div>
                      <strong>Address:</strong> {selectedOrder.town},{" "}
                      {selectedOrder.county}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="detail-section">
                  <h4>Order Items</h4>
                  <div className="items-list">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="order-item">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="item-image"
                        />
                        <div className="item-details">
                          <div className="item-name">{item.name}</div>
                          <div className="item-info">
                            <span>Qty: {item.quantity}</span>
                            <span>Price: KES {item.price}</span>
                            <span>
                              Total: KES {(item.quantity * item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <strong>
                      Total Amount: KES {selectedOrder.totalPrice.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
