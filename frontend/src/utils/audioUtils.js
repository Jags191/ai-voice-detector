// Audio utility functions

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateAudioFile = (file) => {
  const validTypes = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/m4a',
    'audio/mp4',
    'audio/flac',
    'audio/ogg',
    'audio/webm'
  ];
  
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type. Please use: MP3, WAV, M4A, FLAC, OGG, MP4`
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 50MB limit. Your file: ${formatFileSize(file.size)}`
    };
  }

  return { valid: true, error: null };
};

export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const getAudioDuration = (file) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    });
    audio.addEventListener('error', () => {
      resolve(0); // Return 0 if duration can't be determined
    });
  });
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const createAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
};

export const analyzeAudioFeatures = async (audioBuffer) => {
  // This would extract features for display or pre-processing
  const features = {
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    // Add more features as needed
  };
  return features;
};