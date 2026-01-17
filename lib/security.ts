// SECURITY CONFIGURATION
// WARNING: In a purely client-side app, a determined hacker can decompile this.
// However, this prevents casual piracy and handles subscription expiration.

export const SECRET_SALT = "ZAP_CATALOG_2024_MASTER_KEY_#9921"; // Mude isso para sua frase secreta única!

// Gera uma assinatura que inclui a data de expiração
export const generateLicense = async (email: string, daysValid: number): Promise<string> => {
  const expirationDate = Date.now() + (daysValid * 24 * 60 * 60 * 1000);
  const expirationHex = expirationDate.toString(16); // Encode date to hex to save space
  
  const encoder = new TextEncoder();
  // CRITICAL: The data string format must match EXACTLY in verifyLicense
  // Format: "email|expirationHex|salt" (all using the specific casing defined)
  const dataString = `${email.trim().toLowerCase()}|${expirationHex}|${SECRET_SALT}`;
  const data = encoder.encode(dataString);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // A chave final é: "DATA_HEX-ASSINATURA_CURTA" (Uppercase for better UX)
  return `${expirationHex}-${hashHex.substring(0, 12)}`.toUpperCase();
};

export const verifyLicense = async (email: string, key: string): Promise<{ valid: boolean; expired: boolean; message?: string }> => {
  try {
    const parts = key.trim().split('-');
    if (parts.length !== 2) return { valid: false, expired: false, message: 'Formato de chave inválido.' };

    const [expirationHex, signature] = parts;
    
    // 1. Verificar Assinatura Criptográfica
    const encoder = new TextEncoder();
    
    // WARNING: expirationHex from key is likely UPPERCASE. 
    // We must convert it to lowercase to match the generation logic (toString(16) produces lowercase).
    const dataString = `${email.trim().toLowerCase()}|${expirationHex.toLowerCase()}|${SECRET_SALT}`;
    const data = encoder.encode(dataString);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fullHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Expected signature is the first 12 chars of the hash, uppercased
    const expectedSignature = fullHash.substring(0, 12).toUpperCase();

    if (signature.toUpperCase() !== expectedSignature) {
      console.error("Signature Mismatch", { expected: expectedSignature, received: signature.toUpperCase() });
      return { valid: false, expired: false, message: 'Chave incorreta ou e-mail não corresponde.' };
    }

    // 2. Verificar Data de Expiração
    // parseInt works fine with Uppercase hex too
    const expirationDate = parseInt(expirationHex, 16);
    if (Date.now() > expirationDate) {
      return { valid: false, expired: true, message: 'Sua licença expirou.' };
    }

    return { valid: true, expired: false };
  } catch (e) {
    console.error(e);
    return { valid: false, expired: false, message: 'Erro ao validar licença.' };
  }
};