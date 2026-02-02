import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle, uploading, transcribing, generating, complete
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [uploadPath, setUploadPath] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setUploadPath(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading')
    setError(null)
    setUploadPath(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:7001/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json()
      setUploadPath(data.path)

      // Simulating the AI pipeline for MVP Step 1

      // Use real data from backend
      setResult(data)
      setStatus('complete')

    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to upload file. Please ensure server is running.')
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-900 mb-2">Sermon Slicer</h1>
          <p className="text-slate-600 text-lg">Turn your Sunday sermon into a week's worth of content.</p>
        </header>

        <main className="grid gap-8">
          {/* Upload Area */}
          {status === 'idle' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center border-dashed border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".mp3,.mp4,.wav,.m4a"
              />

              {!file ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload Sermon Recording</h3>
                  <p className="text-slate-500 mb-6">Drag and drop or click to select (MP3, MP4, WAV)</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    Select File
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-indigo-900 font-medium bg-indigo-50 py-3 px-4 rounded-lg inline-block">
                    <FileText size={20} />
                    <span>{file.name}</span>
                  </div>
                  <div className="block">
                    <button
                      onClick={handleUpload}
                      className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      Slice It!
                    </button>
                    <button
                      onClick={() => setFile(null)}
                      className="ml-4 px-6 py-3 text-slate-500 hover:text-slate-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {error && (
                <div className={`mt-4 flex items-start justify-center text-left p-4 rounded-lg gap-3 ${error.includes('API Key') || error.includes('Billing') ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-red-500'}`}>
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{error}</p>
                    {error.includes('API Key') && (
                      <div className="mt-2 text-sm">
                        <p className="mb-1">To fix this:</p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Open <code>server/.env</code></li>
                          <li>Add your OpenAI API Key: <code>OPENAI_API_KEY=sk-...</code></li>
                          <li>Restart the server</li>
                        </ol>
                      </div>
                    )}
                    {error.includes('Billing') && (
                      <div className="mt-2 text-sm">
                        <p className="mb-1">To fix this:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Your OpenAI account has run out of credits.</li>
                          <li>Go to <a href="https://platform.openai.com/account/billing" target="_blank" rel="noreferrer" className="underline font-semibold">OpenAI Billing</a> to add credit.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing State */}
          {(status === 'uploading' || status === 'transcribing' || status === 'generating') && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-2 capitalize">{status}...</h3>
              <p className="text-slate-500">
                {status === 'uploading' && "Sending your sermon to the cloud."}
                {status === 'transcribing' && "AI is listening and typing out every word."}
                {status === 'generating' && "Crafting your social posts and questions."}
              </p>
            </div>
          )}

          {/* Results */}
          {status === 'complete' && result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
                <div className="flex items-center gap-3 mb-4 text-green-700 font-semibold">
                  <CheckCircle size={24} />
                  <h2>Sermon Sliced Successfully!</h2>
                </div>
                <p className="text-slate-600">Here are your assets ready for distribution.</p>

                {uploadPath && (
                  <div className="mt-4 p-3 bg-slate-100 rounded text-sm font-mono text-slate-600 break-all">
                    <strong>File saved to:</strong> {uploadPath}
                  </div>
                )}

                <div className="flex gap-4 mt-4">
                  <button onClick={() => { setStatus('idle'); setFile(null); setResult(null); setUploadPath(null); }} className="text-indigo-600 hover:underline">
                    Start Over
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:7001/download-docx', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(result)
                        });

                        if (!response.ok) throw new Error('Download failed');

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'sermon_assets.docx';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      } catch (err) {
                        console.error(err);
                        alert('Failed to download document');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <FileText size={18} />
                    Download Word Doc
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-2">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText size={20} className="text-indigo-500" /> Full Transcription
                  </h3>
                  <textarea
                    className="w-full p-4 bg-slate-50 rounded-lg text-slate-700 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[200px]"
                    value={result.transcription}
                    onChange={(e) => setResult({ ...result, transcription: e.target.value })}
                  />
                </div>

                {/* Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-2">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText size={20} className="text-indigo-500" /> Newsletter Summary
                  </h3>
                  <textarea
                    className="w-full p-4 bg-slate-50 rounded-lg text-slate-700 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[150px]"
                    value={result.summary}
                    onChange={(e) => setResult({ ...result, summary: e.target.value })}
                  />
                </div>

                {/* Tweets */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">Social Posts</h3>
                  <div className="space-y-3">
                    {result.tweets.map((tweet, i) => (
                      <textarea
                        key={i}
                        className="w-full p-3 bg-slate-50 rounded-lg text-slate-700 text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                        value={tweet}
                        onChange={(e) => {
                          const newTweets = [...result.tweets];
                          newTweets[i] = e.target.value;
                          setResult({ ...result, tweets: newTweets });
                        }}
                        rows={3}
                      />
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">Small Group Questions</h3>
                  <div className="space-y-3">
                    {result.questions.map((q, i) => (
                      <textarea
                        key={i}
                        className="w-full p-3 bg-slate-50 rounded-lg text-slate-700 text-sm font-medium border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                        value={q}
                        onChange={(e) => {
                          const newQuestions = [...result.questions];
                          newQuestions[i] = e.target.value;
                          setResult({ ...result, questions: newQuestions });
                        }}
                        rows={3}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
