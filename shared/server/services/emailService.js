import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendContactForm(data) {
    const { name, email, subject, message, website } = data;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself
      replyTo: email,
      subject: `Contact Form: ${subject} - ${website}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 100px; font-weight: bold; color: #555;">Website:</td>
                <td>${website}</td>
              </tr>
              <tr>
                <td style="width: 100px; font-weight: bold; color: #555;">Name:</td>
                <td>${name}</td>
              </tr>
              <tr>
                <td style="width: 100px; font-weight: bold; color: #555;">Email:</td>
                <td>${email}</td>
              </tr>
              <tr>
                <td style="width: 100px; font-weight: bold; color: #555;">Subject:</td>
                <td>${subject}</td>
              </tr>
              <tr>
                <td style="width: 100px; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
                <td style="white-space: pre-wrap;">${message}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This email was sent from your website contact form.</p>
            <p>Sent on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, message: 'Failed to send email', error: error.message };
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is working correctly' };
    } catch (error) {
      return { success: false, message: 'Email service configuration error', error: error.message };
    }
  }
}

export default new EmailService();