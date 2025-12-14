import twilio from "twilio";

/**
 * Raw env values (string | undefined)
 */
const _accountSid = process.env.TWILIO_ACCOUNT_SID;
const _apiKeySid = process.env.TWILIO_API_KEY_SID;
const _apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
const _verifySid = process.env.TWILIO_VERIFY_SID;

/**
 * Runtime validation + TypeScript narrowing
 */
if (!_accountSid || !_apiKeySid || !_apiKeySecret || !_verifySid) {
  throw new Error("❌ Missing Twilio credentials in environment variables");
}

/**
 * ✅ After this point TypeScript KNOWS these are strings
 */
const accountSid: string = _accountSid;
const apiKeySid: string = _apiKeySid;
const apiKeySecret: string = _apiKeySecret;
const verifySid: string = _verifySid;

/**
 * Twilio client
 */
const twilioClient = twilio(apiKeySid, apiKeySecret, {
  accountSid,
});

/**
 * SEND OTP
 */
export async function sendOTP(phoneNumber: string) {
  if (!phoneNumber) {
    return { success: false, error: "Phone number is required" };
  }

  try {
    const verification = await twilioClient.verify.v2
      .services(verifySid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    return {
      success: verification.status === "pending",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to send OTP",
    };
  }
}

/**
 * VERIFY OTP
 */
export async function verifyOTP(phoneNumber: string, code: string) {
  if (!phoneNumber || !code) {
    return { success: false, error: "Phone number & code are required" };
  }

  try {
    const result = await twilioClient.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      });

    return {
      success: result.status === "approved",
      error: result.status !== "approved" ? "Invalid OTP" : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "OTP verification failed",
    };
  }
}
