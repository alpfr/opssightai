/**
 * Main Dashboard Component
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { EmailList } from '../components/EmailList';
import { AgentChat } from '../components/AgentChat';
import { GmailConnect } from '../components/GmailConnect';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [gmailConnected, setGmailConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'emails' | 'agent'>('emails');

  useEffect(() => {
    checkGmailStatus();
  }, []);

  const checkGmailStatus = async () => {
    try {
      const status = await apiClient.getGmailStatus();
      setGmailConnected(status.connected);
    } catch (error) {
      console.error('Failed to check Gmail status:', error);
      // Default to not connected on error
      setGmailConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Agent Platform</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.full_name || user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/about"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                About
              </a>
              <a
                href="/how-to-use"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                How to Use
              </a>
              <GmailConnect 
                isConnected={gmailConnected} 
                onStatusChange={setGmailConnected}
              />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!gmailConnected ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please connect your Gmail account to start managing emails.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('emails')}
                  className={`${
                    activeTab === 'emails'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Emails
                </button>
                <button
                  onClick={() => setActiveTab('agent')}
                  className={`${
                    activeTab === 'agent'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  AI Agent
                </button>
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'emails' ? <EmailList /> : <AgentChat />}
          </>
        )}
      </main>
    </div>
  );
};
