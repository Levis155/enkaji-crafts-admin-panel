import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaStar, 
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import useUserStore from '../stores/userStore';
import { useState } from 'react';

const Layout: React.FC = () => {
  const location = useLocation();
  const user = useUserStore(state => state.user);
  const removeUserInfo = useUserStore(state => state.removeUserInfo);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/products', label: 'Products', icon: FaBox },
    { path: '/orders', label: 'Orders', icon: FaShoppingCart },
    { path: '/users', label: 'Users', icon: FaUsers },
    { path: '/reviews', label: 'Reviews', icon: FaStar },
    { path: '/settings', label: 'Settings', icon: FaCog },
  ];

  const handleLogout = () => {
    removeUserInfo();
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Enkaji Admin</h2>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="nav-icon" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button 
              className="sidebar-toggle md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <h1 className="page-title">
              {navItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
            </h1>
          </div>
          
          <div className="top-bar-right">
            <div className="user-info">
              <span className="user-name">Welcome, {user?.fullName}</span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
                title="Logout"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          <Outlet />
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;