import React from 'react';

const LoadingSpinner = () => (
  <div className="spinner-overlay">
    <div className="spinner"></div>
    <p>Analyzing audio... Please wait.</p>
  </div>
);

export default LoadingSpinner;
