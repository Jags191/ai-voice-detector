const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processAudio, mockAnalyzeAudio } = require('../utils/audioProcessor');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Audio classification endpoint
router.post('/classify-audio', upload.single('audio'), async (req, res) => {
    try {
        const { language = 'en' } = req.body;
        const audioFile = req.file;
        
        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Convert to base64 if needed
        const audioBase64 = audioFile.buffer.toString('base64');
        
        // Process and analyze audio
        const result = await processAudio(audioBase64, language);
        
        res.json(result);
    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({ 
            error: 'Failed to process audio',
            details: error.message 
        });
    }
});

// Base64 audio endpoint
router.post('/classify-base64', async (req, res) => {
    try {
        const { audio, language = 'en', mimeType = 'audio/mp3' } = req.body;
        
        if (!audio) {
            return res.status(400).json({ error: 'No audio data provided' });
        }

        // Mock analysis (Replace with actual ML model)
        const result = await mockAnalyzeAudio(audio, language);
        
        res.json(result);
    } catch (error) {
        console.error('Error processing base64 audio:', error);
        res.status(500).json({ 
            error: 'Failed to process audio',
            details: error.message 
        });
    }
});

// Real-time WebSocket connection for live audio
router.get('/ws', (req, res) => {
    // This would be handled by WebSocket server
    res.status(501).json({ error: 'WebSocket endpoint not implemented' });
});

// Supported languages
router.get('/languages', (req, res) => {
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ta', name: 'Tamil' },
        { code: 'te', name: 'Telugu' },
        { code: 'ml', name: 'Malayalam' }
    ];
    res.json({ languages });
});

module.exports = router;