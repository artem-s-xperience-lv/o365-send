export type MailPayload = {
  to: string;
  subject: string;
  body: string;
};

export type GraphSendRequest = {
  message: {
    subject: string;
    body: {
      contentType: "Text";
      content: string;
    };
    toRecipients: Array<{
      emailAddress: {
        address: string;
      };
    }>;
  };
  saveToSentItems: boolean;
};