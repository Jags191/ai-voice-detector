import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ResultsDisplay = ({ data }) => {
  if (!data) return null;

  const isAI = data.classification === 'AI-generated';
  const confidence = data.confidence * 100;

  const chartData = {
    labels: ['AI Probability', 'Human Probability'],
    datasets: [
      {
        data: [isAI ? confidence : 100 - confidence, isAI ? 100 - confidence : confidence],
        backgroundColor: [
          isAI ? 'rgba(255, 99, 132, 0.8)' : 'rgba(54, 162, 235, 0.8)',
          isAI ? 'rgba(54, 162, 235, 0.8)' : 'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          isAI ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
          isAI ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed.toFixed(1)}%`;
          }
        }
      }
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      en: 'English',
      hi: 'Hindi',
      ta: 'Tamil',
      te: 'Telugu',
      ml: 'Malayalam'
    };
    return languages[code] || code;
  };

  return (
    <div className="results-container">
      <h2>📊 Analysis Results</h2>

      <div className="results-grid">
        <div className="result-card main-result">
          <h3>Classification</h3>
          <div className={`classification-badge ${isAI ? 'ai' : 'human'}`}>
            {data.classification}
          </div>
          <div className="confidence-score">
            <h4>Confidence Score</h4>
            <div className="score-display">
              <span className="score-value">{(confidence).toFixed(1)}%</span>
            </div>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
          </div>

          {/* ✅ Circular Gauge Visualization */}
          <div style={{ width: 120, margin: '20px auto' }}>
            <CircularProgressbar
              value={confidence}
              text={`${confidence.toFixed(0)}%`}
              styles={buildStyles({
                pathColor: confidence >= 70 ? '#4caf50' : confidence >= 50 ? '#ff9800' : '#f44336',
                textColor: '#333',
                trailColor: '#eee',
              })}
            />
            <p style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold' }}>
              {isAI ? 'AI Confidence' : 'Human Confidence'}
            </p>
          </div>
        </div>

        <div className="result-card chart-card">
          <h3>Probability Distribution</h3>
          <div className="chart-container">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="result-card explanation-card">
          <h3>Analysis Explanation</h3>
          <div className="explanation-content">
            <p>{data.explanation}</p>
            <div className="metadata">
              <div className="meta-item">
                <strong>Language:</strong> {getLanguageName(data.language)}
              </div>
              <div className="meta-item">
                <strong>Analyzed:</strong> {new Date(data.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="technical-details">
        <h3>🔬 Technical Analysis</h3>
        <div className="features-list">
          {data.featuresAnalyzed?.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">✅</span>
              {feature}
            </div>
          ))}
        </div>
      </div>

      <div className="actions">
        <button className="action-button">
          📥 Download Full Report
        </button>
        <button className="action-button secondary">
          🔄 Analyze Another Sample
        </button>
        <button className="action-button secondary">
          📋 Copy Results
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
