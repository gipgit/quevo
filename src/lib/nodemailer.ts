// src/lib/nodemailer.ts
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import getRequestConfig from '../i18n/request';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // For port 587, STARTTLS is used, so 'secure' is false. If using port 465, set to true.
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendMailProps {
  to: string;
  subject?: string;
  template: 'UserManagerActivation' | 'UserCustomerActivation';
  templateProps: {
    recipientName: string;
    confirmationLink: string;
  };
  locale: string;
}

export async function sendMail({ to, subject, template, templateProps, locale }: SendMailProps) {
  // Handle case sensitivity for template names
  const templateFileName = template === 'UserManagerActivation' ? 'userManagerActivation' : template;
  const templatePath = path.join(process.cwd(), 'emails', 'templates', `${templateFileName}.html`);
  
  try {
    const { messages } = await getRequestConfig({ requestLocale: Promise.resolve(locale) });
    console.log(`[nodemailer] Loaded messages for locale ${locale}:`, JSON.stringify(messages, null, 2)); // Debug log

    const getTranslatedText = (key: string, section: string, replacements?: Record<string, string>) => {
      let text = messages?.[section]?.[key] || key;
      
      if (replacements) {
        for (const [placeholder, value] of Object.entries(replacements)) {
          text = text.replace(`{${placeholder}}`, value);
        }
      }
      return text;
    };

    // --- START: Additional Debugging Logs for Template Reading ---
    console.log(`[nodemailer] Attempting to read template from: ${templatePath}`);
    let htmlContent = await fs.readFile(templatePath, 'utf8');
    console.log('[nodemailer] Raw HTML content read from file (first 500 chars):', htmlContent.substring(0, 500));
    // --- END: Additional Debugging Logs for Template Reading ---

    const sectionMessages = messages?.[template] || {};

    const replacements: Record<string, string> = {
      '{{LOCALE}}': locale,
      '{{EMAIL_SUBJECT}}': subject || getTranslatedText('subject', template),
      '{{LOGO_URL}}': getTranslatedText('logo_url', template),
      '{{WELCOME_HEADING}}': getTranslatedText('welcome_heading', template, { recipientName: templateProps.recipientName }),
      '{{CONFIRMATION_MESSAGE}}': getTranslatedText('confirmation_message', template),
      '{{CONFIRM_BUTTON_TEXT}}': getTranslatedText('confirm_button_text', template),
      '{{FALLBACK_LINK_INSTRUCTION}}': getTranslatedText('fallback_link_instruction', template),
      '{{HELP_MESSAGE}}': getTranslatedText('help_message', template),
      '{{CLOSING_SALUTATION}}': getTranslatedText('closing_salutation', template),
      '{{TEAM_NAME}}': getTranslatedText('team_name', template),
      '{{CONFIRMATION_LINK}}': templateProps.confirmationLink,
      '{{BRAND_NAME}}': getTranslatedText('brand_name', template),
      '{{PRIVACY_DISCLAIMER}}': getTranslatedText('privacy_disclaimer', template),
      '{{WEBSITE_URL}}': getTranslatedText('website_url', template),
      '{{FACEBOOK_URL}}': getTranslatedText('facebook_url', template),
      '{{TIKTOK_URL}}': getTranslatedText('tiktok_url', template),
      '{{INSTAGRAM_URL}}': getTranslatedText('instagram_url', template),
      '{{LINKEDIN_URL}}': getTranslatedText('linkedin_url', template),
    };

    // --- START: Additional Debugging Logs for Replacements ---
    console.log('[nodemailer] Replacements object prepared:', JSON.stringify(replacements, null, 2));
    // --- END: Additional Debugging Logs for Replacements ---

    for (const placeholder in replacements) {
      if (Object.prototype.hasOwnProperty.call(replacements, placeholder)) {
        const regex = new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
        htmlContent = htmlContent.replace(regex, replacements[placeholder]);
      }
    }

    // --- START: Additional Debugging Logs for Final HTML ---
    console.log('[nodemailer] Final HTML content after replacements (first 500 chars):', htmlContent.substring(0, 500));
    // --- END: Additional Debugging Logs for Final HTML ---

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: replacements['{{EMAIL_SUBJECT}}'],
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} for template ${template}`);
  } catch (error) {
    console.error(`Error sending email for template ${template}:`, error);
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Email template file not found. Check path: ${templatePath}`);
    }
    throw error;
  }
}
