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
      {isResend ? 'Reminder: ' : ''}Activate your account for Patroller
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={greeting}>
          Hi {firstName},
        </Text>
        <Heading style={h1}>
          Welcome to the <strong>Patroller Console</strong>!
        </Heading>
        <Text style={text}>
          To complete your registration and activate your account, please confirm your email by clicking the button below. You'll then be prompted to set your password and get started.
        </Text>
        
        <Section style={buttonContainer}>
          <Button style={button} href={activationUrl}>
            Activate my Account
          </Button>
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

const greeting = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const h1 = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: '400',
  lineHeight: '32px',
  margin: '0 0 24px',
};

const text = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 32px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

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
};

const footerText = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '40px 0 24px',
};

const signature = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 4px',
};

const signatureTeam = {
  color: '#000000',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};
