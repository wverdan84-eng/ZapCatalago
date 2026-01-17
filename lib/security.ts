// SECURITY CONFIGURATION
// WARNING: In a purely client-side app, a determined hacker can decompile this.
// However, this prevents casual piracy and handles subscription expiration.

export const SECRET_SALT = "ZAP_CATALOG_2024_MASTER_KEY_#9921"; // Mude isso para sua frase secreta única!

// Gera uma assinatura que inclui a data de expiração
export const generateLicense = async (email: string, daysValid: number): Promise<string> => {
  const expirationDate = Date.now() + (daysValid * 24 * 60 * 60 * 1000);
  const expirationHex = expirationDate.toString(16); // Encode date to hex to save space
  
  const encoder = new TextEncoder();
  // A assinatura depende do email, da data de expiração e do segredo
  const data = encoder.encode(`${email.trim().toLowerCase()}|${expirationHex}|${SECRET_SALT}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // A chave final é: "DATA_HEX-ASSINATURA_CURTA"
  return `${expirationHex}-${hashHex.substring(0, 12)}`.toUpperCase();
};

export const verifyLicense = async (email: string, key: string): Promise<{ valid: boolean; expired: boolean; message?: string }> => {
  try {
    const parts = key.trim().split('-');
    if (parts.length !== 2) return { valid: false, expired: false, message: 'Formato inválido' };

    const [expirationHex, signature] = parts;
    
    // 1. Verificar Assinatura Criptográfica
    const encoder = new TextEncoder();
    const data = encoder.encode(`${email.trim().toLowerCase()}|${expirationHex.toLowerCase()}|${SECRET_SALT}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fullHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const expectedSignature = fullHash.substring(0, 12).toUpperCase();

    if (signature.toUpperCase() !== expectedSignature) {
      return { valid: false, expired: false, message: 'Chave incorreta' };
    }

    // 2. Verificar Data de Expiração
    const expirationDate = parseInt(expirationHex, 16);
    if (Date.now() > expirationDate) {
      return { valid: false, expired: true, message: 'Licença expirada' };
    }

    return { valid: true, expired: false };
  } catch (e) {
    return { valid: false, expired: false, message: 'Erro de validação' };
  }
};