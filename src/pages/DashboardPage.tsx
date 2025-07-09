import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import axiosInstance from "../utils/axiosInstance";
import "../styles/AdminDashboard.css";

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/admin/dashboard/stats`);
      return response.data;
    },
  });

const { data: salesData } = useQuery({
  queryKey: ["sales-data", "30d"],
  queryFn: async ({ queryKey }) => {
    const [, period] = queryKey;
    const response = await axiosInstance.get(
      `/admin/analytics/sales?period=${period}`);
    return response.data;
  },
});

const { data: topProducts } = useQuery({
  queryKey: ["top-products", 10], 
  queryFn: async ({ queryKey }) => {
    const [, limit] = queryKey as [string, number];
    const response = await axiosInstance.get(
      `/admin/analytics/top-products?limit=${limit}`);
    return response.data;
  },
});

  if (statsLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: FaUsers,
      color: "blue",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: FaBox,
      color: "green",
      change: "+5%",
      trend: "up",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: FaShoppingCart,
      color: "purple",
      change: "+18%",
      trend: "up",
    },
    {
      title: "Total Revenue",
      value: `KES ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: FaDollarSign,
      color: "orange",
      change: "+25%",
      trend: "up",
    },
  ];

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="grid grid-4 mb-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-card-content">
                <div className="stat-info">
                  <h3 className="stat-title">{card.title}</h3>
                  <p className="stat-value">{card.value}</p>
                  <div className="stat-change">
                    {card.trend === "up" ? (
                      <FaArrowUp className="trend-icon trend-up" />
                    ) : (
                      <FaArrowDown className="trend-icon trend-down" />
                    )}
                    <span
                      className={`change-text ${
                        card.trend === "up" ? "text-success" : "text-danger"
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className={`stat-icon stat-icon-${card.color}`}>
                  <Icon />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-2 mb-6">
        {/* Sales Chart */}
        <div className="card">
          <div className="card-header">
            <h3>Sales Overview (Last 30 Days)</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary-color)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <h3>Top Selling Products</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="var(--primary-color)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Order Status and Alerts */}
      <div className="grid grid-2">
        {/* Order Status */}
        <div className="card">
          <div className="card-header">
            <h3>Order Status Overview</h3>
          </div>
          <div className="card-body">
            <div className="status-overview">
              <div className="status-item">
                <div className="status-label">Pending Orders</div>
                <div className="status-value">{stats?.pendingOrders || 0}</div>
              </div>
              <div className="status-item">
                <div className="status-label">Completed Orders</div>
                <div className="status-value">
                  {stats?.completedOrders || 0}
                </div>
              </div>
              <div className="status-item">
                <div className="status-label">Cancelled Orders</div>
                <div className="status-value">
                  {stats?.cancelledOrders || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="card-header">
            <h3>Alerts & Notifications</h3>
          </div>
          <div className="card-body">
            <div className="alerts-list">
              {stats?.outOfStockProducts > 0 && (
                <div className="alert alert-warning">
                  <FaExclamationTriangle />
                  <div>
                    <strong>{stats.outOfStockProducts} products</strong> are out
                    of stock
                  </div>
                </div>
              )}
              {stats?.pendingOrders > 10 && (
                <div className="alert alert-info">
                  <FaShoppingCart />
                  <div>
                    <strong>{stats.pendingOrders} pending orders</strong> need
                    attention
                  </div>
                </div>
              )}
              <div className="alert alert-success">
                <FaUsers />
                <div>System is running smoothly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
