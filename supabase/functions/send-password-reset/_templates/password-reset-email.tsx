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
}

export const PasswordResetEmail = ({
  resetUrl,
  userEmail,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset Your Password</Heading>
        
        <Text style={text}>
          Hello,
        </Text>
        
        <Text style={text}>
          We received a request to reset the password for your account ({userEmail}). 
          If you didn't make this request, you can safely ignore this email.
        </Text>

        <Section style={buttonContainer}>
          <Link
            href={resetUrl}
            target="_blank"
            style={button}
          >
            Reset Password
          </Link>
        </Section>

        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        
        <Text style={linkText}>
          {resetUrl}
        </Text>

        <Section style={infoBox}>
          <Text style={infoText}>
            🔒 <strong>Security Information</strong>
          </Text>
          <Text style={infoText}>
            • This link will expire in 1 hour for security reasons
          </Text>
          <Text style={infoText}>
            • If you didn't request this reset, please contact support immediately
          </Text>
          <Text style={infoText}>
            • Never share this link with anyone
          </Text>
        </Section>

        <Text style={footer}>
          If you have any questions or concerns, please contact our support team.
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

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0066ff',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 48px',
}

const linkText = {
  color: '#0066ff',
  fontSize: '14px',
  margin: '16px 40px',
  wordBreak: 'break-all' as const,
}

const infoBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
  border: '1px solid #e1e8ed',
}

const infoText = {
  color: '#444',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  margin: '32px 40px',
  textAlign: 'center' as const,
}
