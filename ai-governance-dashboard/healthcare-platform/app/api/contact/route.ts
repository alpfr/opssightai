import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

// Email service - using SendGrid as example
const sendEmail = async (data: any) => {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@vantedgehealth.com';
  const TO_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@vantedgehealth.com';

  if (!SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: TO_EMAIL }],
          subject: `New Demo Request from ${data.firstName} ${data.lastName}`,
        }],
        from: { email: FROM_EMAIL, name: 'Vantedge Health Website' },
        content: [{
          type: 'text/html',
          value: `
            <h2>New Demo Request</h2>
            <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Practice Name:</strong> ${data.practiceName}</p>
            <p><strong>Practice Size:</strong> ${data.practiceSize}</p>
            <p><strong>Message:</strong></p>
            <p>${data.message || 'No message provided'}</p>
            <hr>
            <p><small>Submitted at: ${new Date().toISOString()}</small></p>
          `,
        }],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send confirmation email to user
const sendConfirmationEmail = async (data: any) => {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@vantedgehealth.com';

  if (!SENDGRID_API_KEY) return false;

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: data.email }],
          subject: 'Thank you for contacting Vantedge Health',
        }],
        from: { email: FROM_EMAIL, name: 'Vantedge Health' },
        content: [{
          type: 'text/html',
          value: `
            <h2>Thank You for Your Interest!</h2>
            <p>Hi ${data.firstName},</p>
            <p>Thank you for reaching out to Vantedge Health. We've received your demo request and will be in touch within 24 hours.</p>
            <p>In the meantime, feel free to explore our website to learn more about how we're returning humanity to healthcare.</p>
            <br>
            <p>Best regards,<br>The Vantedge Health Team</p>
            <hr>
            <p><small>Vantedge Health | Returning Humanity to Healthcare</small></p>
          `,
        }],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous';
    const { success, remaining } = await rateLimit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'practiceName', 'practiceSize'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send notification email to team
    const emailSent = await sendEmail(data);

    // Send confirmation email to user
    await sendConfirmationEmail(data);

    // Log submission (in production, save to database)
    console.log('Contact form submission:', {
      ...data,
      timestamp: new Date().toISOString(),
      ip: request.ip,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for your submission. We will contact you within 24 hours.',
      remaining,
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
