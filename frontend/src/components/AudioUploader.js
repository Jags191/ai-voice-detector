import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import LoadingSpinner from './LoadingSpinner';

const AudioUploader = ({ onResults, setLoading }) => {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'ml', label: 'Malayalam' }
  ];

  const supportedFormats = [
    'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav',
    'audio/m4a', 'audio/mp4', 'audio/flac', 'audio/ogg', 'audio/webm'
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];

    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    if (!supportedFormats.includes(selectedFile.type)) {
      setError('Unsupported format.');
      return;
    }

    setFile(selectedFile);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: supportedFormats.join(','),
    maxSize: 50 * 1024 * 1024
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select an audio file');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('language', language);

      const response = await axios.post('http://localhost:5000/api/classify-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onResults(response.data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to process audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader-container">
      <h2>📁 Upload Audio File</h2>
      <p className="instruction">Upload an audio file to analyze if it's AI-generated</p>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Select Language:</label>
          <Select
            options={languageOptions}
            value={languageOptions.find(opt => opt.value === language)}
            onChange={(selected) => setLanguage(selected.value)}
            className="language-select"
            isSearchable
          />
        </div>

        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          {file ? (
            <div className="file-preview">
              <span className="file-icon">📄</span>
              <div className="file-info">
                <strong>{file.name}</strong>
                <small>{(file.size / (1024 * 1024)).toFixed(2)} MB</small>
              </div>
            </div>
          ) : (
            <div className="drop-placeholder">
              <span className="upload-icon">⬆️</span>
              <p>{isDragActive ? 'Drop your file here...' : 'Click or drag to upload'}</p>
              <p className="formats">MP3, WAV, M4A, FLAC, OGG, MP4 (Max 50MB)</p>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button" disabled={!file}>
          🔍 Analyze Audio
        </button>
      </form>
    </div>
  );
};

export default AudioUploader;
