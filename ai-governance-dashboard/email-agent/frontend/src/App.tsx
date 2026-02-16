import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  📧 Email Agent Platform
                </h1>
                <p className="text-lg text-gray-600">
                  AI-powered email management with LangGraph
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Frontend is ready. Backend API will be connected soon.
                </p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
