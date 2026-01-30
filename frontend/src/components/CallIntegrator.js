import React, { useState } from 'react';
//import axios from 'axios';

const CallIntegrator = ({ onResults, setLoading }) => {
  const [callStatus, setCallStatus] = useState('idle');
  const [callSid, setCallSid] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');

  const startCallIntegration = async () => {
    setCallStatus('connecting');
    
    // For demo purposes, we'll simulate a call
    setTimeout(() => {
      setCallStatus('active');
      setCallSid('CA' + Math.random().toString(36).substr(2, 12));
      
      // Simulate receiving a recording after call ends
      setTimeout(() => {
        setCallStatus('recording_ready');
        setRecordingUrl('https://example.com/sample-call-recording.mp3');
      }, 5000);
    }, 2000);
  };

  const analyzeCallRecording = async () => {
    if (!recordingUrl) return;
    
    setLoading(true);
    
    try {
      // In real implementation, you would:
      // 1. Fetch the recording from the URL
      // 2. Convert to base64
      // 3. Send to backend
      
      // For demo, use mock data
      const mockResult = {
        classification: Math.random() > 0.5 ? 'AI-generated' : 'Human-generated',
        confidence: (Math.random() * 0.4 + 0.6).toFixed(3),
        explanation: 'Call recording analysis shows ' + 
          (Math.random() > 0.5 ? 'consistent digital artifacts' : 'natural human speech patterns'),
        language: 'en',
        timestamp: new Date().toISOString()
      };
      
      onResults(mockResult);
    } catch (err) {
      console.error('Call analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'idle': return 'gray';
      case 'connecting': return 'orange';
      case 'active': return 'green';
      case 'recording_ready': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="call-container">
      <h2>📞 Phone Call Integration</h2>
      <p className="instruction">Connect phone calls for real-time analysis</p>
      
      <div className="call-status">
        <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}>
          Status: {callStatus.replace('_', ' ').toUpperCase()}
        </div>
        
        {callSid && (
          <div className="call-info">
            <p>Call SID: <code>{callSid}</code></p>
          </div>
        )}
      </div>
      
      <div className="call-controls">
        {callStatus === 'idle' && (
          <button 
            className="call-button start"
            onClick={startCallIntegration}
          >
            📞 Start Call Integration
          </button>
        )}
        
        {callStatus === 'active' && (
          <div className="active-call">
            <div className="call-animation">
              <div className="pulse-ring"></div>
              <div className="phone-icon">📱</div>
            </div>
            <p>Call in progress... Speak naturally</p>
          </div>
        )}
        
        {callStatus === 'recording_ready' && (
          <div className="recording-ready">
            <p>✅ Call recording ready for analysis!</p>
            <button 
              className="analyze-button"
              onClick={analyzeCallRecording}
            >
              🔍 Analyze Call Recording
            </button>
          </div>
        )}
      </div>
      
      <div className="integration-options">
        <h3>Integration Methods:</h3>
        <div className="method-cards">
          <div className="method-card">
            <h4>Twilio Webhook</h4>
            <p>Set webhook URL in Twilio console to forward call recordings</p>
            <code>https://your-api.com/twilio-webhook</code>
          </div>
          
          <div className="method-card">
            <h4>Direct Upload</h4>
            <p>Upload call recording files from your device</p>
            <button className="secondary-button">
              📁 Upload Call Recording
            </button>
          </div>
          
          <div className="method-card">
            <h4>API Integration</h4>
            <p>Use our REST API to submit call recordings programmatically</p>
            <code>POST /api/analyze-call</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallIntegrator;