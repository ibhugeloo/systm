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

interface RequestNotificationEmailProps {
  clientName: string;
  requestType: 'feature' | 'bug' | 'meeting' | 'question';
  requestTitle: string;
  requestDescription: string;
  priority: 'low' | 'medium' | 'high';
  reviewUrl: string;
}

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return '#dc2626';
    case 'medium':
      return '#ea580c';
    case 'low':
    default:
      return '#16a34a';
  }
};

const getRequestTypeLabel = (type: string): string => {
  switch (type) {
    case 'feature':
      return 'New Feature Request';
    case 'bug':
      return 'Bug Report';
    case 'meeting':
      return 'Meeting Request';
    case 'question':
      return 'Question';
    default:
      return 'Request';
  }
};

export const RequestNotificationEmail: React.FC<RequestNotificationEmailProps> = ({
  clientName,
  requestType,
  requestTitle,
  requestDescription,
  priority,
  reviewUrl,
}) => (
  <Html>
    <Head />
    <Preview>New request from {clientName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Row>
            <Text style={heading}>New Request from {clientName}</Text>
          </Row>
          <Hr style={divider} />
          <Row>
            <Section style={detailsSection}>
              <Text style={labelText}>Request Type</Text>
              <Text style={valueText}>{getRequestTypeLabel(requestType)}</Text>
            </Section>
            <Section style={detailsSection}>
              <Text style={labelText}>Priority</Text>
              <Text style={{ ...valueText, color: getPriorityColor(priority) }}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
            </Section>
          </Row>
          <Hr style={divider} />
          <Text style={labelText}>Title</Text>
          <Text style={paragraph}>{requestTitle}</Text>
          <Text style={labelText}>Description</Text>
          <Text style={paragraph}>{requestDescription}</Text>
          <Section style={buttonContainer}>
            <Button style={button} href={reviewUrl}>
              Review Request
            </Button>
          </Section>
          <Hr style={divider} />
          <Text style={footerSmall}>
            This is an automated notification. Log into your dashboard to review and respond to this request.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Preview props for React Email dev server
(RequestNotificationEmail as any).PreviewProps = {
  clientName: 'John Doe',
  requestType: 'feature',
  requestTitle: 'Add dark mode support',
  requestDescription: 'Users have requested a dark mode option for better accessibility',
  priority: 'medium',
  reviewUrl: 'https://portal.systm.re/requests/123',
} as RequestNotificationEmailProps;

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
  fontSize: '28px',
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

const detailsSection = {
  padding: '12px 0',
};

const labelText = {
  color: '#8898aa',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
};

const valueText = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
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

const footerSmall = {
  color: '#b4becc',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '12px 0',
};

export default RequestNotificationEmail;
