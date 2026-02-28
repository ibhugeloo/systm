import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface ClientWelcomeEmailProps {
  clientName: string;
  companyName: string;
  portalUrl: string;
  supportEmail?: string;
}

export const ClientWelcomeEmail: React.FC<ClientWelcomeEmailProps> = ({
  clientName,
  companyName,
  portalUrl,
  supportEmail = 'hello@systm.re',
}) => (
  <Html>
    <Head />
    <Preview>Welcome to Systm - Your MVP Journey Starts Here</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Text style={heading}>Welcome to Systm, {clientName}</Text>
          </Row>
          <Hr style={divider} />
          <Text style={paragraph}>
            We're thrilled to have {companyName} onboard! Your journey to building an amazing MVP starts now.
          </Text>
          <Text style={paragraph}>
            You've been added to your personal dashboard where you can:
          </Text>
          <Text style={listItem}>• Track project progress in real-time</Text>
          <Text style={listItem}>• View your MVP canvas as it develops</Text>
          <Text style={listItem}>• Communicate directly with the Systm team</Text>
          <Text style={listItem}>• Request modifications and provide feedback</Text>
          <Text style={listItem}>• Download deliverables when ready</Text>
          <Section style={buttonContainer}>
            <Button style={button} href={portalUrl}>
              Access Your Dashboard
            </Button>
          </Section>
          <Text style={paragraph}>
            Here's what happens next:
          </Text>
          <Text style={listItem}>1. Our team reviews your onboarding information</Text>
          <Text style={listItem}>2. We generate your initial MVP design</Text>
          <Text style={listItem}>3. We schedule a demo to walk through your MVP</Text>
          <Text style={listItem}>4. You provide feedback and request modifications</Text>
          <Text style={listItem}>5. We finalize and hand off the complete solution</Text>
          <Hr style={divider} />
          <Text style={paragraph}>
            Questions or need anything? Simply reply to this email or reach out to us at {supportEmail}.
          </Text>
          <Text style={footerSmall}>
            © 2026 Systm. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Preview props for React Email dev server
(ClientWelcomeEmail as any).PreviewProps = {
  clientName: 'John Doe',
  companyName: 'Acme Corp',
  portalUrl: 'https://portal.systm.re',
  supportEmail: 'hello@systm.re',
} as ClientWelcomeEmailProps;

const main = {
  backgroundColor: '#f9fafb',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  fontSize: '32px',
  fontWeight: '700',
  margin: '16px 0',
  padding: '0',
  color: '#000000',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '16px 0',
};

const divider = {
  borderColor: '#ecedee',
  margin: '16px 0',
};

const buttonContainer = {
  padding: '27px 0 27px',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
  padding: '12px 20px',
  textDecoration: 'none',
};

const listItem = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0 8px 24px',
};

const footerSmall = {
  color: '#b4becc',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '12px 0',
};

export default ClientWelcomeEmail;
