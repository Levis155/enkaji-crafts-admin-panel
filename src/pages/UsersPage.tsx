import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEdit, FaTrash, FaSearch, FaUserShield } from "react-icons/fa";
import apiUrl from "../utils/apiUrl";
import { User } from "../types";

const UsersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const queryClient = useQueryClient();
  const limit = 10;

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", currentPage, searchTerm],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/admin/users`, {
        params: {
          page: currentPage,
          limit,
          search: searchTerm,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        withCredentials: true,
      });
      return response.data;
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${apiUrl}/admin/users/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, user }: { id: string; user: Partial<User> }) => {
      const response = await axios.put(`${apiUrl}/admin/users/${id}`, user, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowModal(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

const handleViewUser = async (userId: string) => {
  try {
    const response = await axios.get(`${apiUrl}/admin/users/${userId}`, {
      withCredentials: true,
    });
    const user = response.data;

    setSelectedUser(user);
    setModalMode("view");
    setShowModal(true);
  } catch (error) {
    toast.error("Failed to load user details");
  }
};

const handleEditUser = async (userId: string) => {
  try {
    const response = await axios.get(`${apiUrl}/admin/users/${userId}`, {
      withCredentials: true,
    });
    const user = response.data;

    setSelectedUser(user);
    setModalMode("edit");
    setShowModal(true);
  } catch (error) {
    toast.error("Failed to load user details");
  }
};

  const handleDeleteUser = (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.currentTarget);
    const userData = {
      fullName: formData.get("fullName") as string,
      emailAddress: formData.get("emailAddress") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      county: formData.get("county") as string,
      town: formData.get("town") as string,
      shippingCharge: parseFloat(formData.get("shippingCharge") as string),
      isAdmin: formData.get("isAdmin") === "true",
    };

    updateUserMutation.mutate({ id: selectedUser.id, user: userData });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  const users: User[] = usersData?.data || [];
  const totalPages = Math.ceil((usersData?.total || 0) / limit);

  return (
    <div className="users-page">
      {/* Header */}
      <div className="page-header">
        <h1>Users Management</h1>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-value">{usersData?.total || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {users.filter((user) => user.isAdmin).length}
            </span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Joined</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-name">
                      {user.fullName}
                      {user.isAdmin && (
                        <FaUserShield className="admin-icon" title="Admin" />
                      )}
                    </div>
                    <div className="user-id">ID: {user.id.slice(0, 8)}</div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="contact-email">{user.emailAddress}</div>
                    <div className="contact-phone">{user.phoneNumber}</div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="location">{user.town}</div>
                    <div className="location-county">{user.county}</div>
                  </div>
                </td>
                <td>
                  <div className="join-date">{formatDate(user.createdAt)}</div>
                </td>
                <td>
                  <span
                    className={`role-badge ${
                      user.isAdmin ? "role-admin" : "role-user"
                    }`}
                  >
                    {user.isAdmin ? "Admin" : "Customer"}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      user.isDeleted ? "status-deleted" : "status-active"
                    }`}
                  >
                    {user.isDeleted ? "Deleted" : "Active"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleViewUser(user.id)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditUser(user.id)}
                      title="Edit User"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
                      disabled={user.isAdmin}
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

      {/* User Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === "view" ? "User Details" : "Edit User"}
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
                <div className="user-details">
                  <div className="detail-section">
                    <h4>Personal Information</h4>
                    <div className="detail-grid">
                      <div>
                        <strong>Full Name:</strong> {selectedUser.fullName}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedUser.emailAddress}
                      </div>
                      <div>
                        <strong>Phone:</strong> {selectedUser.phoneNumber}
                      </div>
                      <div>
                        <strong>Role:</strong>
                        <span
                          className={`role-badge ${
                            selectedUser.isAdmin ? "role-admin" : "role-user"
                          }`}
                        >
                          {selectedUser.isAdmin ? "Admin" : "Customer"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Address Information</h4>
                    <div className="detail-grid">
                      <div>
                        <strong>County:</strong> {selectedUser.county}
                      </div>
                      <div>
                        <strong>Town:</strong> {selectedUser.town}
                      </div>
                      <div>
                        <strong>Shipping Charge:</strong> $
                        {selectedUser.shippingCharge}
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Account Information</h4>
                    <div className="detail-grid">
                      <div>
                        <strong>User ID:</strong> {selectedUser.id}
                      </div>
                      <div>
                        <strong>Joined:</strong>{" "}
                        {formatDate(selectedUser.createdAt)}
                      </div>
                      <div>
                        <strong>Last Updated:</strong>{" "}
                        {formatDate(selectedUser.updatedAt)}
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <span
                          className={`status-badge ${
                            selectedUser.isDeleted
                              ? "status-deleted"
                              : "status-active"
                          }`}
                        >
                          {selectedUser.isDeleted ? "Deleted" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-input"
                      defaultValue={selectedUser.fullName}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="emailAddress"
                      className="form-input"
                      defaultValue={selectedUser.emailAddress}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-input"
                      defaultValue={selectedUser.phoneNumber}
                      required
                    />
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">County</label>
                      <input
                        type="text"
                        name="county"
                        className="form-input"
                        defaultValue={selectedUser.county}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Town</label>
                      <input
                        type="text"
                        name="town"
                        className="form-input"
                        defaultValue={selectedUser.town}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shipping Charge</label>
                    <input
                      type="number"
                      step="0.01"
                      name="shippingCharge"
                      className="form-input"
                      defaultValue={selectedUser.shippingCharge}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      name="isAdmin"
                      className="form-select"
                      defaultValue={selectedUser.isAdmin ? "true" : "false"}
                    >
                      <option value="false">Customer</option>
                      <option value="true">Admin</option>
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
                      disabled={updateUserMutation.isPending}
                    >
                      Update User
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

export default UsersPage;
