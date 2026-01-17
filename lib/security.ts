// SECURITY CONFIGURATION
// WARNING: In a purely client-side app, a determined hacker can decompile this.
// However, this prevents casual piracy and requires the "cracker" to understand coding.
const SECRET_SALT = "ZAP_CATALOG_2024_MASTER_KEY_#9921"; // Change this to your own secret phrase!

export const generateSignature = async (email: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.trim().toLowerCase() + SECRET_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16); // We take the first 16 chars to keep the key short
};

export const verifyLicense = async (email: string, key: string): Promise<boolean> => {
  try {
    const generated = await generateSignature(email);
    return generated === key.trim();
  } catch (e) {
    return false;
  }
};
