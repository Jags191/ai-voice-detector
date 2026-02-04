import React, { useState } from "react";
import { predictVoice } from "../api";

function VoiceDetector() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("English");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDetect = async () => {
    if (!file) {
      alert("Please upload a WAV file");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictVoice(file, language);
      setResult(data);
    } catch (err) {
      setError("Prediction failed. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detector-card">
      <h2>AI Voice Detector</h2>

      <input
        type="file"
        accept=".wav"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>English</option>
        <option>Hindi</option>
        <option>Malayalam</option>
        <option>Telugu</option>
      </select>

      <button onClick={handleDetect} disabled={loading}>
        {loading ? "Analyzing..." : "Detect"}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result-box">
          <h3>{result.classification}</h3>
          <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
          <p>Language: {result.language}</p>
        </div>
      )}
    </div>
  );
}

export default VoiceDetector;
