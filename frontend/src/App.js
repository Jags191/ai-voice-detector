import React, { useState } from 'react';
import AudioUploader from './components/AudioUploader';
import AudioRecorder from './components/AudioRecorder';
import CallIntegrator from './components/CallIntegrator';
import ResultsDisplay from './components/ResultsDisplay';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResults = (data) => {
    setResults(data);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return <AudioUploader onResults={handleResults} setLoading={setLoading} />;
      case 'record':
        return <AudioRecorder onResults={handleResults} setLoading={setLoading} />;
      case 'call':
        return <CallIntegrator onResults={handleResults} setLoading={setLoading} />;
      default:
        return <AudioUploader onResults={handleResults} setLoading={setLoading} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎤 AI Voice Detector</h1>
        <p className="subtitle">Detect AI-generated voices in multiple languages</p>
      </header>

      <main className="app-main">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📁 Upload Audio
          </button>
          <button 
            className={`tab ${activeTab === 'record' ? 'active' : ''}`}
            onClick={() => setActiveTab('record')}
          >
            🎤 Record Live
          </button>
          <button 
            className={`tab ${activeTab === 'call' ? 'active' : ''}`}
            onClick={() => setActiveTab('call')}
          >
            📞 Call Integration
          </button>
        </div>

        <div className="content-container">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Analyzing audio... This may take a moment.</p>
            </div>
          ) : (
            <>
              <div className="input-section">
                {renderTabContent()}
              </div>
              
              {results && (
                <div className="results-section">
                  <ResultsDisplay data={results} />
                </div>
              )}
            </>
          )}
        </div>

        <div className="info-panel">
          <h3>📋 Supported Features</h3>
          <ul>
            <li>🎯 Detect AI-generated voices with confidence scores</li>
            <li>🌍 Multiple languages: English, Hindi, Tamil, Telugu, Malayalam</li>
            <li>📊 Detailed analysis with explanations</li>
            <li>🎙️ Real-time recording and analysis</li>
            <li>📞 Phone call integration (beta)</li>
          </ul>
        </div>
      </main>

      <footer className="app-footer">
        <p>AI Voice Detection System • Hackathon Project • Made with ❤️</p>
        <p className="disclaimer">
          ⚠️ This tool is for research purposes. Results may vary based on audio quality.
        </p>
      </footer>
    </div>
  );
}

export default App;