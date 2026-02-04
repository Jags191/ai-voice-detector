import numpy as np
import librosa

SAMPLE_RATE = 16000
LANGUAGE_MAP = {
    "English": 0,
    "Hindi": 1,
    "Malayalam": 2,
    "Telugu": 3
}

def extract_features(file_path, language):
    audio, sr = librosa.load(file_path, sr=SAMPLE_RATE)

    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=20)
    mfcc_delta = librosa.feature.delta(mfcc)
    mfcc_delta2 = librosa.feature.delta(mfcc, order=2)

    features = np.concatenate([
        np.mean(mfcc, axis=1),
        np.mean(mfcc_delta, axis=1),
        np.mean(mfcc_delta2, axis=1),
        [
            np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr)),
            np.mean(librosa.feature.spectral_bandwidth(y=audio, sr=sr)),
            np.mean(librosa.feature.spectral_flatness(y=audio)),
            np.mean(librosa.feature.zero_crossing_rate(audio)),
            np.mean(librosa.feature.rms(y=audio)),
        ],
        [LANGUAGE_MAP[language]]
    ])

    return features.reshape(1, -1)
