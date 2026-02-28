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
} from "@react-email/components"
import * as React from "react"

interface HandoffEmailTemplateProps {
  clientName: string
  commercialName: string
  summaryHtml: string
  handoffUrl: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://systm.re"

export const HandoffEmailTemplate = ({
  clientName,
  commercialName,
  summaryHtml,
  handoffUrl,
}: HandoffEmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Votre handoff de projet - systm.re</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src={`${baseUrl}/logo.png`}
            width="50"
            height="50"
            alt="systm.re"
          />
          <Text style={heading}>Handoff de votre projet</Text>

          <Hr style={hr} />

          <Text style={paragraph}>
            Bonjour <strong>{clientName}</strong>,
          </Text>

          <Text style={paragraph}>
            Nous sommes heureux de vous partager le handoff complet de votre
            projet. Ce document contient tous les détails techniques, les
            décisions clés, et les étapes suivantes.
          </Text>

          <Section style={summarySection}>
            <Text style={subheading}>Résumé du projet</Text>
            <div
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
              style={summaryContent}
            />
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={handoffUrl}>
              Consulter le handoff complet
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Équipe systm.re
            <br />
            {commercialName}
          </Text>

          <Text style={footerLink}>
            <Link href={baseUrl} style={link}>
              systm.re
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: "#f3f4f6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen-Sans","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const box = {
  padding: "0 48px",
}

const heading = {
  fontSize: "32px",
  fontWeight: "bold",
  margin: "16px 0",
  color: "#1f2937",
}

const subheading = {
  fontSize: "18px",
  fontWeight: "600",
  margin: "16px 0 12px",
  color: "#374151",
}

const paragraph = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
}

const summarySection = {
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "8px",
  margin: "24px 0",
}

const summaryContent = {
  fontSize: "14px",
  color: "#4b5563",
  lineHeight: "20px",
}

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
}

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
}

const footerLink = {
  color: "#3b82f6",
  fontSize: "14px",
}

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
}
