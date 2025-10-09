import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  resetUrl: string
  userEmail: string
  firstName: string
}

export const PasswordResetEmail = ({
  resetUrl,
  userEmail,
  firstName,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your Patroller password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={greeting}>
          Hi {firstName},
        </Text>
        
        <Text style={text}>
          We received a request to reset the password for your <strong>Patroller Console</strong> account.
        </Text>
        
        <Text style={text}>
          If you made this request, click the button below to set a new password. This link will expire in <strong>24 hours</strong> for your security.
        </Text>

        <Section style={buttonContainer}>
          <Link
            href={resetUrl}
            target="_blank"
            style={button}
          >
            Reset my Password
          </Link>
        </Section>

        <Text style={footerText}>
          If you didn't expect this email for Patroller, you can safely ignore this message.
        </Text>
        
        <Text style={signature}>
          Thanks,
        </Text>
        <Text style={signatureTeam}>
          <strong>The Patroller Team</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const greeting = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
  padding: '0 40px',
}

const text = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
  padding: '0 40px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const footerText = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '40px 40px 24px',
}

const signature = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 4px',
  padding: '0 40px',
}

const signatureTeam = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  padding: '0 40px',
}
