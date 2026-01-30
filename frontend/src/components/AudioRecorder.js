import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AudioRecorder = ({ onResults, setLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [language, setLanguage] = useState('en');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'ml', label: 'Malayalam' }
  ];

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please use Chrome, Firefox, or Edge.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        stopRecording();
        alert('Recording error occurred. Please try again.');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Please allow microphone access to record audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) {
      alert('Please record audio first!');
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        // Try the direct endpoint first
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('language', language);
          
          const response = await axios.post('http://localhost:5000/api/classify-audio', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          onResults(response.data);
        } catch (uploadError) {
          // Fallback to base64 endpoint
          const response = await axios.post('http://localhost:5000/api/classify-base64', {
            audio: base64Audio,
            language: language,
            mimeType: 'audio/webm'
          });
          
          onResults(response.data);
        }
        setLoading(false);
      };
      
      reader.onerror = () => {
        setLoading(false);
        alert('Failed to process audio file.');
      };
      
    } catch (err) {
      console.error('Analysis error:', err);
      setLoading(false);
      alert('Failed to analyze audio. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  return (
    <div className="recorder-container">
      <h2>🎤 Record Live Audio</h2>
      <p className="instruction">Record audio directly from your microphone</p>
      
      <div className="form-group">
        <label>Select Language:</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="language-dropdown"
        >
          {languageOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="recorder-controls">
        <div className="recording-status">
          <div className={`status-indicator ${isRecording ? 'recording' : ''}`}>
            <span className="indicator-dot"></span>
            {isRecording ? 'Recording...' : 'Ready to record'}
          </div>
          <div className="recording-time">
            ⏱️ {formatTime(recordingTime)}
          </div>
        </div>
        
        <div className="control-buttons">
          {!isRecording ? (
            <button 
              type="button" 
              className="record-button start"
              onClick={startRecording}
              disabled={isRecording}
            >
              🎤 Start Recording
            </button>
          ) : (
            <button 
              type="button" 
              className="record-button stop"
              onClick={stopRecording}
            >
              ⏹️ Stop Recording
            </button>
          )}
          
          <button 
            type="button" 
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={!audioBlob || isRecording}
          >
            🔍 Analyze Recording
          </button>
        </div>
        
        {audioURL && (
          <div className="audio-preview">
            <h4>Preview:</h4>
            <audio controls src={audioURL} className="audio-player" />
            <p className="audio-info">
              Duration: {formatTime(recordingTime)} | 
              Size: {audioBlob ? Math.round(audioBlob.size / 1024) + ' KB' : 'Unknown'}
            </p>
          </div>
        )}
        
        <div className="recording-tips">
          <h4>💡 Tips for better analysis:</h4>
          <ul>
            <li>Record in a quiet environment</li>
            <li>Speak clearly and naturally</li>
            <li>Record at least 5-10 seconds of speech</li>
            <li>Keep microphone 6-12 inches from mouth</li>
            <li>Use Chrome or Firefox for best recording quality</li>
          </ul>
        </div>
        
        {!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ? (
          <div className="browser-warning">
            ⚠️ Your browser doesn't support audio recording. Please use Chrome, Firefox, or Edge.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AudioRecorder;