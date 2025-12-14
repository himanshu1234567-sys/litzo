import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
const verifySid = process.env.TWILIO_VERIFY_SID;

// safe check
if (!accountSid || !apiKeySid || !apiKeySecret || !verifySid) {
  throw new Error("Missing Twilio credentials in environment variables");
}

const twilioClient = twilio(apiKeySid, apiKeySecret, { accountSid });

export async function sendOTP(phoneNumber: string) {
  try {
    const verification = await twilioClient.verify.v2
      .services(verifySid)
      .verifications
      .create({
        to: phoneNumber,
        channel: "sms",
      });

    return {
      success: verification.status === "pending",
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyOTP(phoneNumber: string, code: string) {
  try {
    const result = await twilioClient.verify.v2
      .services(verifySid)
      .verificationChecks
      .create({
        to: phoneNumber,
        code: code,  // MUST BE `code`
      });

    return {
      success: result.status === "approved",
      error: result.status !== "approved" ? "Invalid OTP" : undefined,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
