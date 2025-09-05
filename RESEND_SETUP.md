# Resend Email Service Setup Guide

This guide will help you set up Resend for sending professional activation emails in your emergency management platform.

## Why Switch to Resend?

- **Professional Branding**: Use your own domain for emails (e.g., admin@yourcompany.com)
- **Better Deliverability**: Higher email delivery rates compared to generic services
- **Advanced Features**: Email tracking, analytics, and bounce management
- **Industry Standard**: Used by modern SaaS applications for transactional emails

## Current Status

🟡 **Testing Mode**: Currently using Supabase Auth for emails (can only send to verified email addresses)

🎯 **Production Ready**: Resend integration is configured and ready to use once domain is verified

## Setup Steps

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (includes 100 emails/day)
3. Verify your account via email

### 2. Domain Verification (Required for Production)
1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourcompany.com`)
4. Follow the DNS setup instructions:
   - Add the provided MX, TXT, and CNAME records to your DNS provider
   - This typically takes 24-48 hours to propagate
5. Wait for verification ✅

### 3. Create API Key
1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it (e.g., "Emergency Platform - Production")
4. Copy the API key (starts with `re_`)

### 4. Update Platform Configuration

#### 4.1. Add API Key to Supabase Secrets
The `RESEND_API_KEY` secret is already configured in your Supabase project.
Update it with your new API key if needed.

#### 4.2. Update Email Function
Once your domain is verified, update the "from" address in:
`supabase/functions/send-resend-email/index.ts`

```typescript
// Change this line:
from: 'Platform Admin <onboarding@resend.dev>', 

// To your verified domain:
from: 'Platform Admin <admin@yourcompany.com>',
```

#### 4.3. Switch Email Provider
In `src/hooks/useEmailService.tsx`, change:

```typescript
// Change this line:
const EMAIL_PROVIDER: 'supabase' | 'resend' = 'supabase';

// To:
const EMAIL_PROVIDER: 'supabase' | 'resend' = 'resend';
```

## Email Features Included

### Professional Template
- ✅ Responsive HTML design
- ✅ Organization branding
- ✅ Security information
- ✅ Clear call-to-action button
- ✅ Fallback text version

### Security Features
- ✅ 7-day expiration for activation links
- ✅ Unique activation tokens
- ✅ Secure credential generation
- ✅ Email tracking and logging

### Production Features
- ✅ Error handling for domain issues
- ✅ Bounce and delivery tracking
- ✅ Email metadata and tagging
- ✅ Comprehensive logging

## Testing

### Before Domain Verification
- Emails will only be sent to the account owner's email address
- Perfect for testing the integration
- Error messages will guide you through setup

### After Domain Verification
- Send emails to any valid email address
- Full production capabilities
- Professional sender reputation

## Monitoring

### Resend Dashboard
- View email delivery status
- Check bounce rates
- Monitor sending volumes
- Review error logs

### Supabase Logs
- Check edge function logs for debugging
- Monitor activation success rates
- Track user activation patterns

## Troubleshooting

### Common Issues

**"Domain verification required"**
- Your domain isn't verified yet
- Check DNS records are properly configured
- Wait for DNS propagation (24-48 hours)

**"Invalid from address"**
- Using wrong email format
- Email domain doesn't match verified domain
- Update the "from" address in the edge function

**"Rate limit exceeded"**
- Upgrade your Resend plan
- Implement email queuing if needed

### Support
- Resend Support: [resend.com/support](https://resend.com/support)
- Check edge function logs in Supabase dashboard
- Contact your development team with specific error messages

## Cost Considerations

### Resend Pricing (as of 2024)
- **Free Tier**: 100 emails/day, 3,000/month
- **Pro Tier**: $20/month for 50,000 emails
- **Business Tier**: Custom pricing for higher volumes

### Recommendation
Start with the free tier and upgrade based on your organization's email volume.

---

**Next Steps**: Once you've verified your domain and updated the configuration, your platform will send professional, branded activation emails that improve user trust and deliverability.