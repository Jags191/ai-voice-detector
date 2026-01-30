const Joi = require('joi');

const audioValidationSchema = Joi.object({
  audio: Joi.string().base64().required(),
  language: Joi.string().valid('en', 'hi', 'ta', 'te', 'ml').default('en'),
  mimeType: Joi.string().valid(
    'audio/mp3',
    'audio/mpeg', 
    'audio/wav',
    'audio/x-wav',
    'audio/m4a',
    'audio/mp4',
    'audio/flac',
    'audio/ogg',
    'audio/webm'
  ).default('audio/mp3')
});

const fileUploadSchema = Joi.object({
  language: Joi.string().valid('en', 'hi', 'ta', 'te', 'ml').default('en')
});

const validateAudioInput = (req, res, next) => {
  const { error } = audioValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details[0].message 
    });
  }
  next();
};

const validateFileUpload = (req, res, next) => {
  const { error } = fileUploadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details[0].message 
    });
  }
  
  // Check if file exists
  if (!req.file) {
    return res.status(400).json({ error: 'Audio file is required' });
  }
  
  next();
};

const rateLimiter = require('express-rate-limit');

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  validateAudioInput,
  validateFileUpload,
  apiLimiter
};