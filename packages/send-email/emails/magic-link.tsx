import { Body, Container, Head, Heading, Html, Preview, Text } from "react-email";

interface MagicLinkEmailProps {
  token: string;
}

/**
 * Authored with react-email's real component library (Html, Body,
 * Container, etc.) rather than hand-rolled HTML tags — these components
 * encode a lot of hard-won email-client compatibility knowledge (Outlook's
 * Word rendering engine, Gmail's CSS stripping, table-based layout
 * fallbacks) that's genuinely hard to get right by hand.
 *
 * `react-email` (the package these come from — `@react-email/components`
 * is deprecated/merged into it) is a devDependency only: this template is
 * pre-rendered to static HTML at build time by scripts/build-template.ts
 * and never imported by the deployed Worker (src/index.ts) at runtime,
 * so the Worker's bundle never has to include react-email's much heavier
 * CLI-oriented dependency tree (esbuild, tailwind, etc.). See
 * specs/002-email-otp-auth/research.md §10.
 */
export function MagicLinkEmail({ token }: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your HomeBase sign-in code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your HomeBase sign-in code</Heading>
          <Text style={text}>Enter this code in the app to sign in:</Text>
          <Text style={code}>{token}</Text>
          <Text style={footer}>
            This code expires in 10 minutes. If you didn&apos;t request this,
            you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MagicLinkEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  padding: "24px",
  margin: "0 auto",
  maxWidth: "480px",
};

const h1 = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#333",
};

const text = {
  fontSize: "14px",
  color: "#333",
  marginBottom: "8px",
};

const code = {
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  textAlign: "center" as const,
  padding: "16px",
  backgroundColor: "#f4f4f4",
  borderRadius: "5px",
  border: "1px solid #eee",
  color: "#333",
};

const footer = {
  fontSize: "12px",
  color: "#898989",
  marginTop: "24px",
};
