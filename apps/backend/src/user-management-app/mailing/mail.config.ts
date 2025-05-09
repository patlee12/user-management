export const mailConfig: any = {
  service: process.env.MAIL_SERVICE_PROVIDER,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};
