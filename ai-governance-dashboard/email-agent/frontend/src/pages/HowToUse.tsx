/**
 * How to Use Page Component
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HowToUse: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">How to Use Email Agent Platform</h1>
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
          {/* Getting Started */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Create an Account</h3>
                  <p className="text-gray-600">
                    Sign up with your email and password. Your account will be created instantly.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Connect Your Gmail</h3>
                  <p className="text-gray-600">
                    Click the "Connect Gmail" button in the dashboard and authorize the application to access your Gmail account.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Start Using the Platform</h3>
                  <p className="text-gray-600">
                    Once connected, you can browse your emails or chat with the AI assistant to manage your inbox.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Using the Email Tab */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Using the Emails Tab</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Emails</h3>
                <p className="text-gray-600 mb-2">
                  Use the search bar to find specific emails. You can use Gmail's search syntax:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li><code className="bg-gray-200 px-2 py-1 rounded">from:john@example.com</code> - Emails from a specific sender</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">subject:meeting</code> - Emails with "meeting" in subject</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">is:unread</code> - Unread emails</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">has:attachment</code> - Emails with attachments</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">after:2024/01/01</code> - Emails after a specific date</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">View Email Details</h3>
                <p className="text-gray-600">
                  Click on any email in the list to view its full content, including sender, recipients, subject, and body.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Organize with Labels</h3>
                <p className="text-gray-600">
                  Add or remove Gmail labels to organize your emails. Labels help you categorize and find emails quickly.
                </p>
              </div>
            </div>
          </section>

          {/* Using the AI Agent */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Using the AI Agent</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <p className="text-gray-700">
                The AI Agent is your intelligent email assistant. Simply chat with it in natural language, and it will help you manage your emails.
              </p>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What You Can Ask</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <p className="font-medium text-gray-900">Search for emails</p>
                    <p className="text-gray-600 text-sm">
                      "Find all emails from John about the project"<br/>
                      "Show me unread emails from this week"
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <p className="font-medium text-gray-900">Read email content</p>
                    <p className="text-gray-600 text-sm">
                      "What did Sarah say in her last email?"<br/>
                      "Summarize the email thread about the meeting"
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <p className="font-medium text-gray-900">Send emails</p>
                    <p className="text-gray-600 text-sm">
                      "Send an email to john@example.com about the project update"<br/>
                      "Draft a reply to the last email from Sarah"
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <p className="font-medium text-gray-900">Organize emails</p>
                    <p className="text-gray-600 text-sm">
                      "Add the 'Important' label to emails from my boss"<br/>
                      "Show me all emails labeled 'Work'"
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <p className="font-medium text-gray-900">Get insights</p>
                    <p className="text-gray-600 text-sm">
                      "How many unread emails do I have?"<br/>
                      "What are the most important emails today?"
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tips for Best Results</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Be specific about what you want to do</li>
                  <li>Include sender names, subjects, or dates when searching</li>
                  <li>Ask follow-up questions to refine results</li>
                  <li>The AI remembers context within a conversation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Security & Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Security & Privacy</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Your Data is Safe</h3>
                  <ul className="text-yellow-800 space-y-1">
                    <li>• OAuth tokens are encrypted and stored securely in AWS Secrets Manager</li>
                    <li>• We never store your email content on our servers</li>
                    <li>• All communication is encrypted with HTTPS</li>
                    <li>• You can disconnect your Gmail account at any time</li>
                    <li>• Your credentials are protected by AWS Cognito authentication</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Can't connect Gmail?</h3>
                <p className="text-gray-600">
                  Make sure you're using a Google account and that you've granted all the required permissions during the OAuth flow.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">AI Agent not responding?</h3>
                <p className="text-gray-600">
                  Check that your Gmail account is connected. The AI needs access to your emails to help you.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Search not working?</h3>
                <p className="text-gray-600">
                  Try using Gmail's search syntax or ask the AI agent to search for you using natural language.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Need to disconnect?</h3>
                <p className="text-gray-600">
                  Click the "Disconnect Gmail" button in the dashboard header. This will revoke all access tokens.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
