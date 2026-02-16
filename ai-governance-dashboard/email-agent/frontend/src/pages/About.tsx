/**
 * About Page Component
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">About Email Agent Platform</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-8">
          {/* Overview */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Email Agent Platform?</h2>
            <p className="text-gray-700 mb-4">
              Email Agent Platform is an intelligent email management system that combines the power of Gmail 
              with advanced AI capabilities. It helps you manage your emails more efficiently by providing 
              an AI assistant that can search, read, send, and organize your emails through natural language conversations.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Gmail Integration</h3>
                </div>
                <p className="text-gray-600">
                  Securely connect your Gmail account using OAuth 2.0. Full access to read, send, and manage your emails.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                </div>
                <p className="text-gray-600">
                  Powered by Claude AI, the assistant understands natural language and can help you with email tasks.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Smart Search</h3>
                </div>
                <p className="text-gray-600">
                  Search through your emails using Gmail's powerful search syntax or ask the AI to find specific emails.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Secure & Private</h3>
                </div>
                <p className="text-gray-600">
                  Your credentials are encrypted and stored securely. We never store your emails on our servers.
                </p>
              </div>
            </div>
          </section>

          {/* Technology Stack */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• React 18</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• Vite</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Python FastAPI</li>
                    <li>• PostgreSQL</li>
                    <li>• Redis</li>
                    <li>• LangGraph</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Infrastructure</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• AWS EKS</li>
                    <li>• AWS Cognito</li>
                    <li>• Docker</li>
                    <li>• Kubernetes</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Version Info */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Version Information</h2>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-indigo-900">
                <span className="font-semibold">Version:</span> 1.0.0
              </p>
              <p className="text-indigo-900">
                <span className="font-semibold">Release Date:</span> February 16, 2026
              </p>
              <p className="text-indigo-900">
                <span className="font-semibold">Status:</span> Production Ready
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
