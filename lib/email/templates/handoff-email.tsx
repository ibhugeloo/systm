import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface HandoffEmailProps {
  clientName: string;
  projectName: string;
  handoffUrl: string;
  teamName?: string;
}

export const HandoffEmail: React.FC<HandoffEmailProps> = ({
  clientName,
  projectName,
  handoffUrl,
  teamName = 'Systm',
}) => (
  <Html>
    <Head />
    <Preview>Your MVP handoff document is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Text style={heading}>Your MVP Is Ready</Text>
          </Row>
          <Hr style={divider} />
          <Text style={paragraph}>
            Hi {clientName},
          </Text>
          <Text style={paragraph}>
            We're excited to share your MVP handoff document for {projectName}. This comprehensive guide includes everything you need to understand the solution, implementation details, and next steps.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={handoffUrl}>
              View Handoff Document
            </Button>
          </Section>
          <Text style={paragraph}>
            The handoff document includes:
          </Text>
          <Text style={listItem}>• Context and project objectives</Text>
          <Text style={listItem}>• Detailed solution overview</Text>
          <Text style={listItem}>• Architecture and technical decisions</Text>
          <Text style={listItem}>• Component specifications</Text>
          <Text style={listItem}>• Budget breakdown</Text>
          <Text style={listItem}>• Next steps and timeline</Text>
          <Hr style={divider} />
          <Text style={footer}>
            Questions? Reply to this email or visit our portal to start a conversation with the {teamName} team.
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
(HandoffEmail as any).PreviewProps = {
  clientName: 'John Doe',
  projectName: 'E-Commerce Platform',
  handoffUrl: 'https://systm.re/handoffs/123',
  teamName: 'Systm',
} as HandoffEmailProps;

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

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '12px 0',
};

const footerSmall = {
  color: '#b4becc',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '12px 0',
};

export default HandoffEmail;
