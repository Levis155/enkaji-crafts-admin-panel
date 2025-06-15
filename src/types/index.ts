export interface User {
  id: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  county: string;
  town: string;
  shippingCharge: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface AdminUser {
  id: string;
  fullName: string;
  emailAddress: string;
  isAdmin: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  category: string;
  specifications: string;
  packageContent: string;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  reviews?: Review[];
}

export interface Order {
  id: string;
  orderNumber: number;
  userId: string;
  status: string;
  totalPrice: number;
  county: string;
  town: string;
  isPaid: boolean;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  reviewAuthor: string;
  reviewTitle: string;
  reviewBody: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  product: Product;
}

export interface Cart {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  inStock: boolean;
  quantity: number;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Wishlist {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  inStock: boolean;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  outOfStockProducts: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  emailAddress: string;
  isAdmin: boolean;
}

export interface LoginCredentials {
  emailAddress: string;
  password: string;
}

export interface ApiResponse<T> {
  data?: T;
  message: string;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
