import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaSave, FaEye, FaEyeSlash, FaUser, FaLock, FaCog } from 'react-icons/fa';
import { useAuthStore } from '../stores/authStore';
import "../styles/SettingsPage.css";

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    emailAddress: user?.emailAddress || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [systemSettings, setSystemSettings] = useState({
    emailNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    reviewNotifications: false,
    maintenanceMode: false,
    defaultShippingCharge: 120,
    defaultCurrency: 'USD',
    maxOrderItems: 10,
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally call an API to update the profile
    toast.success('Profile updated successfully');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Here you would normally call an API to update the password
    toast.success('Password updated successfully');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSystemSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally call an API to update system settings
    toast.success('System settings updated successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'system', label: 'System', icon: FaCog },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and system preferences</p>
      </div>

      <div className="settings-container">
        {/* Tabs Navigation */}
        <div className="tabs-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="tab-icon" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Profile Information</h2>
                <p>Update your personal information and preferences</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="settings-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      fullName: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profileData.emailAddress}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      emailAddress: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value="Administrator"
                    disabled
                  />
                  <small className="form-help">Your role cannot be changed</small>
                </div>

                <button type="submit" className="btn btn-primary">
                  <FaSave /> Save Profile
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Security Settings</h2>
                <p>Manage your password and security preferences</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="settings-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <small className="form-help">Password must be at least 8 characters long</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  <FaLock /> Update Password
                </button>
              </form>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>System Settings</h2>
                <p>Configure system-wide settings and preferences</p>
              </div>

              <form onSubmit={handleSystemSettingsSubmit} className="settings-form">
                <div className="settings-section">
                  <h3>Notifications</h3>
                  
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.emailNotifications}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          emailNotifications: e.target.checked
                        })}
                      />
                      Email Notifications
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.orderAlerts}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          orderAlerts: e.target.checked
                        })}
                      />
                      Order Alerts
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.lowStockAlerts}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          lowStockAlerts: e.target.checked
                        })}
                      />
                      Low Stock Alerts
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.reviewNotifications}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          reviewNotifications: e.target.checked
                        })}
                      />
                      Review Notifications
                    </label>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Store Configuration</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Default Shipping Charge</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={systemSettings.defaultShippingCharge}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        defaultShippingCharge: parseFloat(e.target.value)
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Currency</label>
                    <select
                      className="form-select"
                      value={systemSettings.defaultCurrency}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        defaultCurrency: e.target.value
                      })}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Maximum Order Items</label>
                    <input
                      type="number"
                      className="form-input"
                      value={systemSettings.maxOrderItems}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        maxOrderItems: parseInt(e.target.value)
                      })}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Maintenance</h3>
                  
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceMode}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          maintenanceMode: e.target.checked
                        })}
                      />
                      Maintenance Mode
                    </label>
                    <small className="form-help">
                      Enable this to temporarily disable customer access to the store
                    </small>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  <FaSave /> Save System Settings
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;