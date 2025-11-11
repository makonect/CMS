import emailService from '../services/emailService.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message, website } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    const result = await emailService.sendContactForm({
      name,
      email,
      subject,
      message,
      website: website || 'Unknown Website'
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const testEmailService = async (req, res) => {
  try {
    const result = await emailService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};