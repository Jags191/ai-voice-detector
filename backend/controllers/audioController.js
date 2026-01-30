const { processAudio } = require('../utils/audioProcessor');
const Analysis = require('../models/Analysis'); // if using database
const crypto = require('crypto');

class AudioController {
  async classifyAudio(req, res) {
    try {
      const { audio, language = 'en', mimeType = 'audio/mp3' } = req.body;
      
      // Validate input
      if (!audio) {
        return res.status(400).json({ error: 'Audio data is required' });
      }

      if (!['en', 'hi', 'ta', 'te', 'ml'].includes(language)) {
        return res.status(400).json({ error: 'Unsupported language' });
      }

      // Validate base64
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;
      if (!base64Regex.test(audio)) {
        return res.status(400).json({ error: 'Invalid base64 encoding' });
      }

      // Create hash for deduplication
      const audioHash = crypto.createHash('sha256').update(audio).digest('hex');
      
      // Check if this audio was already analyzed
      // const existing = await Analysis.findOne({ audioHash });
      // if (existing) {
      //   return res.json(existing);
      // }

      // Process audio
      const result = await processAudio(audio, language);
      
      // Add hash to result
      result.audioHash = audioHash;
      
      // Save to database (optional)
      // const analysis = new Analysis({
      //   audioHash,
      //   classification: result.classification,
      //   confidence: result.confidence,
      //   language,
      //   explanation: result.explanation,
      //   duration: result.duration,
      //   fileSize: Buffer.from(audio, 'base64').length,
      //   mimeType,
      //   features: result.features
      // });
      // await analysis.save();

      res.json(result);
    } catch (error) {
      console.error('Audio classification error:', error);
      res.status(500).json({ 
        error: 'Failed to process audio',
        details: error.message 
      });
    }
  }

  async getStats(req, res) {
    try {
      // Example statistics
      const stats = {
        totalAnalyses: 0, // await Analysis.countDocuments(),
        byLanguage: {
          en: 0,
          hi: 0,
          ta: 0,
          te: 0,
          ml: 0
        },
        byClassification: {
          ai: 0,
          human: 0
        },
        averageConfidence: 0,
        last24Hours: 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  }

  async batchClassify(req, res) {
    try {
      const { audios } = req.body; // Array of {audio, language}
      
      if (!Array.isArray(audios) || audios.length === 0) {
        return res.status(400).json({ error: 'Audios array is required' });
      }

      if (audios.length > 10) {
        return res.status(400).json({ error: 'Maximum 10 audios per batch' });
      }

      const results = await Promise.all(
        audios.map(async (item, index) => {
          try {
            const result = await processAudio(item.audio, item.language || 'en');
            return { index, ...result, status: 'success' };
          } catch (error) {
            return { 
              index, 
              status: 'error', 
              error: error.message,
              classification: 'Error',
              confidence: 0
            };
          }
        })
      );

      res.json({ results });
    } catch (error) {
      console.error('Batch classification error:', error);
      res.status(500).json({ error: 'Batch processing failed' });
    }
  }
}

module.exports = new AudioController();