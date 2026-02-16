/**
 * Email List Component
 */
import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

interface Email {
  id: string;
  threadId: string;
}

export const EmailList: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async (query: string = '') => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.searchEmails(query, 50);
      setEmails(response.messages || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmails(searchQuery);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            type="text"
            placeholder="Search emails (e.g., from:sender@example.com, subject:meeting, is:unread)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                loadEmails('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          )}
        </form>
        <p className="mt-2 text-xs text-gray-500">
          Use Gmail query syntax: from:, to:, subject:, is:unread, has:attachment, after:YYYY/MM/DD
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Email List */}
      <div className="divide-y divide-gray-200">
        {emails.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="mt-2">No emails found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? 'Try a different search query' : 'Your inbox is empty'}
            </p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Email ID: {email.id}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Thread ID: {email.threadId}
                  </p>
                </div>
                <button
                  onClick={() => alert(`View email: ${email.id}`)}
                  className="ml-4 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Info */}
      {emails.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Showing {emails.length} emails
          </p>
        </div>
      )}
    </div>
  );
};
