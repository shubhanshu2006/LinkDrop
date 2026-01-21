import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const otpEmailTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>One-Time Access Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Secure File Access</h1>
      </div>

      <!-- Content -->
      <div style="padding: 40px 20px; color: #333333; line-height: 1.6;">

        <div style="background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 700;">
            One-Time Password (OTP)
          </h2>
        </div>

        <p style="margin: 20px 0; font-size: 16px; color: #555;">
          You are trying to access a <strong>very sensitive file</strong> on <strong>LinkDrop</strong>.
        </p>

        <p style="margin: 20px 0; font-size: 16px; color: #555;">
          Use the following one-time password to verify your access:
        </p>

        <!-- OTP Box -->
        <div style="text-align: center; margin: 35px 0;">
          <div style="display: inline-block; background: #111827; color: #ffffff; padding: 18px 40px; border-radius: 12px; font-size: 28px; font-weight: 800; letter-spacing: 6px;">
            ${otp}
          </div>
        </div>

        <!-- Info Box -->
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <p style="margin: 0; color: #991b1b; font-size: 14px;">
            <strong>Important:</strong> This OTP is valid for <strong>5 minutes</strong> and can be used only once.
            Do not share this code with anyone.
          </p>
        </div>

        <p style="margin: 20px 0; font-size: 14px; color: #666;">
          If you did not request access to this file, you can safely ignore this email.
        </p>

      </div>

      <!-- Footer -->
      <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 25px 20px; text-align: center; color: #9ca3af; font-size: 13px; border-top: 3px solid #ef4444;">
        <p style="margin: 0;">
          © ${new Date().getFullYear()} <strong style="color: #ffffff;">LinkDrop</strong>. All rights reserved.
        </p>
        <p style="margin: 8px 0 0 0; font-size: 12px;">
          This is an automated security email — please do not reply.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`;

export const sendOtpEmail = async (email, otp) => {
  try {
    await transactionalEmailApi.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || "LinkDrop Security",
      },
      to: [{ email }],
      subject: "Your One-Time Access Code",
      htmlContent: otpEmailTemplate(otp),
    });

    console.log("OTP email sent successfully via Brevo");
  } catch (error) {
    console.error("Brevo OTP email error:", error);
    throw new Error("Failed to send OTP email");
  }
};
