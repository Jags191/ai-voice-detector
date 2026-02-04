import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { LiveAudioVisualizer } from 'react-audio-visualize';

// Add this ABOVE your AudioRecorder component

const WaveformVisualizer = ({ stream }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#4db6ac';
      canvasCtx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
        x += sliceWidth;
      }
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} width={400} height={100} style={{ background: 'transparent' }} />;
};

const AudioRecorder = ({ onResults, setLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [language, setLanguage] = useState('en');
  const [audioStream, setAudioStream] = useState(null);
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
        alert('Your browser does not support audio recording.');
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
      setAudioStream(stream); // Save stream for waveform

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
        setAudioStream(null); // Clear stream after stop
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing mic:', err);
      alert('Microphone access is required.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) {
      alert('Please record audio first!');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', language);

      try {
        const response = await axios.post('http://localhost:5000/api/classify-audio', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        onResults(response.data);
      } catch (uploadError) {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          const response = await axios.post('http://localhost:5000/api/classify-base64', {
            audio: base64Audio,
            language: language,
            mimeType: 'audio/webm'
          });
          onResults(response.data);
        };
      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Failed to analyze audio.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
      if (audioStream) audioStream.getTracks().forEach(track => track.stop());
    };
  }, [audioURL, audioStream]);

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

        {isRecording && audioStream && (
  <div style={{ margin: '20px 0' }}>
    <WaveformVisualizer stream={audioStream} />
  </div>
)}



        <div className="control-buttons">
          {!isRecording ? (
            <button className="record-button start" onClick={startRecording}>
              🎤 Start Recording
            </button>
          ) : (
            <button className="record-button stop" onClick={stopRecording}>
              ⏹️ Stop Recording
            </button>
          )}
          <button
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
              Duration: {formatTime(recordingTime)} | Size: {Math.round(audioBlob.size / 1024)} KB
            </p>
          </div>
        )}

        <div className="recording-tips">
          <h4>💡 Tips for better analysis:</h4>
          <ul>
            <li>Record in a quiet environment</li>
            <li>Speak clearly and naturally</li>
            <li>Record at least 5–10 seconds of speech</li>
            <li>Keep microphone 6–12 inches from mouth</li>
            <li>Use Chrome or Firefox for best recording quality</li>
          </ul>
        </div>

        {!navigator.mediaDevices && (
          <div className="browser-warning">
            ⚠️ Your browser doesn't support audio recording.
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
