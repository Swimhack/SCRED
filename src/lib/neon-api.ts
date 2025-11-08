// Neon Database API utility
// This handles contact form submissions to Neon DB via backend API

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'https://scred.netlify.app/.netlify/functions/send-contact-email';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
  userAgent?: string;
  referrer?: string;
}

interface ContactSubmissionResponse {
  success: boolean;
  id?: string;
  error?: string;
  message?: string;
}

/**
 * Submit contact form to Neon database via backend API
 */
export async function submitContactForm(formData: ContactFormData): Promise<ContactSubmissionResponse> {
  try {
    // Validate required fields
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
      return {
        success: false,
        error: 'Missing required fields (name, email, and message)'
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return {
        success: false,
        error: 'Invalid email address'
      };
    }

    // Call backend API endpoint
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
        message: formData.message.trim(),
        source: formData.source || 'website',
        userAgent: formData.userAgent || navigator.userAgent,
        referrer: formData.referrer || document.referrer
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: Failed to send message` }));
      console.error('API error:', errorData);
      return {
        success: false,
        error: errorData.error || errorData.message || `HTTP ${response.status}: Failed to send message`
      };
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        id: result.id,
        message: result.message || 'Contact form submitted successfully'
      };
    }

    return {
      success: false,
      error: result.error || result.message || 'Failed to submit contact form'
    };

  } catch (error) {
    console.error('Contact form submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

