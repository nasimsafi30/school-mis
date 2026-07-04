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
  Row,
  Column,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
  email: string
  password: string
  role: string
}

export function WelcomeEmail({ name, email, password, role }: WelcomeEmailProps) {
  const loginUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/login'

  return (
    <Html>
      <Head />
      <Preview>Welcome to School MIS - Your Account Details</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to School MIS!</Heading>

          <Text style={text}>Dear {name},</Text>

          <Text style={text}>
            Your account has been created successfully. You can now access the School Management
            Information System with the following credentials:
          </Text>

          <Section style={detailsContainer}>
            <Row>
              <Column style={label}>Email:</Column>
              <Column style={value}>{email}</Column>
            </Row>
            <Row>
              <Column style={label}>Password:</Column>
              <Column style={value}>{password}</Column>
            </Row>
            <Row>
              <Column style={label}>Role:</Column>
              <Column style={value}>{role}</Column>
            </Row>
          </Section>

          <Text style={warning}>
            Please change your password after your first login for security purposes.
          </Text>

          <Button href={loginUrl} style={button}>
            Login to Your Account
          </Button>

          <Text style={footer}>
            If you have any questions or need assistance, please contact the system administrator.
          </Text>

          <Text style={footerText}>
            {new Date().getFullYear()} School MIS. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 30px',
  textAlign: 'center' as const,
}

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const detailsContainer = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  margin: '24px 0',
  padding: '20px',
  border: '1px solid #e9ecef',
}

const label = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '8px 0',
  width: '100px',
}

const value = {
  color: '#333',
  fontSize: '14px',
  padding: '8px 0',
}

const warning = {
  color: '#e67e22',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#fef9e7',
  borderRadius: '4px',
  borderLeft: '4px solid #f1c40f',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '14px',
  margin: '32px 0',
}

const footer = {
  color: '#888',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0 8px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#aaa',
  fontSize: '12px',
  textAlign: 'center' as const,
}