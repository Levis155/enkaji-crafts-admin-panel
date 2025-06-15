import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FaTrash, FaSearch, FaStar } from 'react-icons/fa';
import { adminService } from '../services/adminService';
import { Review } from '../types';

const ReviewsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  
  const queryClient = useQueryClient();
  const limit = 10;

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', currentPage, searchTerm, ratingFilter],
    queryFn: () => adminService.getReviews({
      page: currentPage,
      limit,
      search: searchTerm,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: adminService.deleteReview,
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    },
  });

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'rating-excellent';
    if (rating >= 3) return 'rating-good';
    if (rating >= 2) return 'rating-fair';
    return 'rating-poor';
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  const reviews = reviewsData?.data || [];
  const totalPages = Math.ceil((reviewsData?.total || 0) / limit);

  // Filter by rating if selected
  const filteredReviews = ratingFilter 
    ? reviews.filter(review => review.rating === parseInt(ratingFilter))
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
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : 'N/A'
              }
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
                <div className="review-date">{formatDate(review.createdAt)}</div>
              </div>
              
              <div className="review-actions">
                <div className={`rating-display ${getRatingColor(review.rating)}`}>
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
                  <div className="product-category">{review.product.category}</div>
                </div>
              </div>

              <div className="review-text">
                <h4 className="review-title">{review.reviewTitle}</h4>
                <p className="review-body">{review.reviewBody}</p>
              </div>

              <div className="review-meta">
                <div className="reviewer-details">
                  <span className="reviewer-email">{review.user.emailAddress}</span>
                  <span className="review-id">Review ID: {review.id.slice(0, 8)}</span>
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
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .reviews-page {
          max-width: 1200px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: var(--text-color);
        }

        .stats-summary {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .filters-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .search-input {
          padding-left: 3rem;
        }

        .filter-select {
          min-width: 150px;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .reviews-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .review-card {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
          transition: box-shadow 0.2s;
        }

        .review-card:hover {
          box-shadow: var(--shadow-lg);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .review-info {
          display: flex;
          flex-direction: column;
        }

        .reviewer-name {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-color);
        }

        .review-date {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .review-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rating-display .star-filled {
          color: #ffc107;
        }

        .rating-display .star-empty {
          color: var(--border-color);
        }

        .rating-number {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .rating-excellent .rating-number {
          color: var(--success-color);
        }

        .rating-good .rating-number {
          color: #28a745;
        }

        .rating-fair .rating-number {
          color: var(--warning-color);
        }

        .rating-poor .rating-number {
          color: var(--danger-color);
        }

        .review-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--background-light);
          border-radius: 6px;
        }

        .product-thumbnail {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }

        .product-name {
          font-weight: 600;
          color: var(--text-color);
        }

        .product-category {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .review-text {
          padding: 1rem 0;
        }

        .review-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-color);
        }

        .review-body {
          line-height: 1.6;
          color: var(--text-color);
        }

        .review-meta {
          border-top: 1px solid var(--border-light);
          padding-top: 1rem;
        }

        .reviewer-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .reviewer-email {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .review-id {
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .no-reviews {
          text-align: center;
          padding: 3rem;
          color: var(--text-light);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .stats-summary {
            justify-content: center;
          }

          .filters-section {
            flex-direction: column;
          }

          .search-container {
            max-width: none;
          }

          .review-header {
            flex-direction: column;
            gap: 1rem;
          }

          .review-actions {
            align-self: flex-start;
          }

          .product-info {
            flex-direction: column;
            text-align: center;
          }

          .reviewer-details {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewsPage;