import { GraphSendRequest, MailPayload } from "@/types/mail";

const REQUIRED_ENV_VARS = [
  "O365_TENANT_ID",
  "O365_CLIENT_ID",
  "O365_CLIENT_SECRET",
  "O365_SENDER_EMAIL"
] as const;

type RequiredEnv = (typeof REQUIRED_ENV_VARS)[number];

function getEnv(name: RequiredEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function validateEnv(): void {
  for (const envName of REQUIRED_ENV_VARS) {
    getEnv(envName);
  }
}

async function getAccessToken(): Promise<string> {
  const tenantId = getEnv("O365_TENANT_ID");
  const clientId = getEnv("O365_CLIENT_ID");
  const clientSecret = getEnv("O365_CLIENT_SECRET");

  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: tokenBody
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token request failed (${response.status}): ${errorText}`);
  }

  const tokenResponse = (await response.json()) as { access_token?: string };

  if (!tokenResponse.access_token) {
    throw new Error("Token response did not include access_token");
  }

  return tokenResponse.access_token;
}

export async function sendMailWithO365(payload: MailPayload): Promise<void> {
  validateEnv();

  const senderEmail = getEnv("O365_SENDER_EMAIL");
  const accessToken = await getAccessToken();

  const graphPayload: GraphSendRequest = {
    message: {
      subject: payload.subject,
      body: {
        contentType: "Text",
        content: payload.body
      },
      toRecipients: payload.to.map((address) => ({
        emailAddress: {
          address
        }
      }))
    },
    saveToSentItems: true
  };

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(graphPayload)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Send mail failed (${response.status}): ${errorText}`);
  }
}
