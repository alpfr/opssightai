/**
 * Gmail Connection Component
 */
import React, { useState } from 'react';
import { apiClient } from '../services/api';

interface GmailConnectProps {
  isConnected: boolean;
  onStatusChange: (connected: boolean) => void;
}

export const GmailConnect: React.FC<GmailConnectProps> = ({ isConnected, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getGmailAuthUrl();
      // Redirect to Google OAuth
      window.location.href = response.authorization_url;
    } catch (error) {
      console.error('Failed to get Gmail auth URL:', error);
      alert('Failed to connect Gmail. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Gmail account?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.disconnectGmail();
      onStatusChange(false);
    } catch (error) {
      console.error('Failed to disconnect Gmail:', error);
      alert('Failed to disconnect Gmail. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <span className="flex items-center text-sm text-green-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Gmail Connected
        </span>
        <button
          onClick={handleDisconnect}
          disabled={isLoading}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
    >
      {isLoading ? 'Connecting...' : 'Connect Gmail'}
    </button>
  );
};
