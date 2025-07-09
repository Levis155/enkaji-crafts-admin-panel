import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaTrash, FaSearch, FaStar } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { Review } from "../types";

const ReviewsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const queryClient = useQueryClient();
  const limit = 10;

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", currentPage, searchTerm, ratingFilter],
    queryFn: async () => {
      const response = await axiosInstance.get(`/admin/reviews`, {
        params: {
          page: currentPage,
          limit,
          search: searchTerm,
          rating: ratingFilter,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });
      return response.data;
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/admin/reviews/${id}`);
    },
    onSuccess: () => {
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete review");
    },
  });

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "star-filled" : "star-empty"}
      />
    ));
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

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "rating-excellent";
    if (rating >= 3) return "rating-good";
    if (rating >= 2) return "rating-fair";
    return "rating-poor";
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  const reviews: Review[] = reviewsData?.data || [];
  const totalPages = Math.ceil((reviewsData?.total || 0) / limit);

  // Filter by rating if selected
  const filteredReviews = ratingFilter
    ? reviews.filter((review) => review.rating === parseInt(ratingFilter))
    : reviews;

  return (
    <div className="reviews-page">
      {/* Header */}
      <div className="page-header">
        <h1>Reviews Management</h1>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-value">{reviewsData?.total || 0}</span>
            <span className="stat-label">Total Reviews</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {reviews.length > 0
                ? (
                    reviews.reduce((sum, review) => sum + review.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "N/A"}
            </span>
            <span className="stat-label">Avg Rating</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by product, reviewer, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="reviews-container">
        {filteredReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-info">
                <div className="reviewer-name">{review.reviewAuthor}</div>
                <div className="review-date">
                  {formatDate(review.createdAt)}
                </div>
              </div>

              <div className="review-actions">
                <div
                  className={`rating-display ${getRatingColor(review.rating)}`}
                >
                  {renderStars(review.rating)}
                  <span className="rating-number">({review.rating})</span>
                </div>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteReview(review.id)}
                  title="Delete Review"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="review-content">
              <div className="product-info">
                <img
                  src={review.product.image}
                  alt={review.product.name}
                  className="product-thumbnail"
                />
                <div>
                  <div className="product-name">{review.product.name}</div>
                  <div className="product-category">
                    {review.product.category}
                  </div>
                </div>
              </div>

              <div className="review-text">
                <h4 className="review-title">{review.reviewTitle}</h4>
                <p className="review-body">{review.reviewBody}</p>
              </div>

              <div className="review-meta">
                <div className="reviewer-details">
                  <span className="reviewer-email">
                    {review.user.emailAddress}
                  </span>
                  <span className="review-id">
                    Review ID: {review.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="no-reviews">
            <p>No reviews found matching your criteria.</p>
          </div>
        )}
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
    </div>
  );
};

export default ReviewsPage;
