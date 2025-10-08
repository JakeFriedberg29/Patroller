import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ActivationEmailProps {
  firstName: string;
  organizationName: string;
  activationUrl: string;
  isResend?: boolean;
}

export const ActivationEmail = ({
  firstName,
  organizationName,
  activationUrl,
  isResend = false,
}: ActivationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {isResend ? 'Reminder: ' : ''}Activate your account for {organizationName}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          Welcome to {organizationName}!
        </Heading>
        <Text style={text}>
          Hello {firstName},
        </Text>
        <Text style={text}>
          You've been invited to join <strong>{organizationName}</strong> on our emergency management platform. 
          To get started, please activate your account by clicking the button below.
        </Text>
        
        <Section style={buttonContainer}>
          <Button style={button} href={activationUrl}>
            Activate Account
          </Button>
        </Section>

        <Text style={textSmall}>
          If the button doesn't work, copy and paste this link into your browser:
        </Text>
        <Text style={link}>
          {activationUrl}
        </Text>

        <Hr style={hr} />

        <Section style={securityBox}>
          <Heading style={h3}>Important Security Information</Heading>
          <ul style={list}>
            <li>This invitation link will expire in 24 hours</li>
            <li>The link can only be used once</li>
            <li>If you didn't expect this invitation, please contact your administrator</li>
            <li>Never share your login credentials with anyone</li>
          </ul>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Need help? Contact your system administrator or reply to this email.
        </Text>
        <Text style={copyright}>
          © {new Date().getFullYear()} {organizationName}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ActivationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const h3 = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const textSmall = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0 8px',
};

const link = {
  color: '#2563eb',
  fontSize: '14px',
  lineHeight: '22px',
  wordBreak: 'break-all' as const,
  margin: '0 0 16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const securityBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fde68a',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
};

const list = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
  paddingLeft: '20px',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '24px 0 8px',
};

const copyright = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '0',
};
