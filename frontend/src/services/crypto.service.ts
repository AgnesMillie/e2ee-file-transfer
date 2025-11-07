/**
 * crypto.service.ts
 *
 * Encapsula toda a lógica de criptografia/decriptografia
 * usando a Web Crypto API (AES-GCM 256-bit).
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH_BYTES = 12; // AES-GCM recomenda 12 bytes (96 bits) para o IV

/**
 * Gera uma nova chave de criptografia AES-GCM 256-bit.
 * @returns Promise<CryptoKey> A chave de criptografia.
 */
export async function generateCryptoKey(): Promise<CryptoKey> {
  return globalThis.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // Permite que a chave seja exportada (para o link)
    ['encrypt', 'decrypt'], // A chave pode ser usada para ambas as operações
  );
}

/**
 * Exporta uma CryptoKey para um formato "raw" (ArrayBuffer)
 * para que possa ser transformada em Base64 (para a URL).
 * @param key A CryptoKey a ser exportada.
 * @returns Promise<ArrayBuffer> A chave em formato raw.
 */
export async function exportCryptoKey(key: CryptoKey): Promise<ArrayBuffer> {
  return globalThis.crypto.subtle.exportKey('raw', key);
}

/**
 * Importa uma chave "raw" (ArrayBuffer) de volta para o formato CryptoKey.
 * @param rawKey A chave em formato raw (vinda da URL).
 * @returns Promise<CryptoKey> A chave pronta para decriptografia.
 */
export async function importCryptoKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: ALGORITHM },
    true, // A chave é exportável (embora não precisemos)
    ['encrypt', 'decrypt'], // A chave pode ser usada para ambas as operações
  );
}

/**
 * Criptografa o conteúdo de um arquivo.
 * Gera um IV (Initialization Vector) único para esta operação.
 * @param file O arquivo original.
 * @param key A CryptoKey para criptografar.
 * @returns Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }>
 */
export async function encryptFile(
  file: File,
  key: CryptoKey,
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  // 1. Gera um IV único (vetor de inicialização)
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));

  // 2. Lê o arquivo como ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // 3. Criptografa os dados
  const encryptedData = await globalThis.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    fileBuffer,
  );

  return { encryptedData, iv };
}

/**
 * Decriptografa dados (ArrayBuffer) de volta para um Blob.
 * @param encryptedData Os dados criptografados.
 * @param key A CryptoKey de decriptografia.
 * @param iv O IV (vetor de inicialização) usado na criptografia.
 * @param fileType O MIME Type original do arquivo.
 * @returns Promise<Blob> O arquivo decriptografado como um Blob.
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array,
  fileType: string,
): Promise<Blob> {
  // 1. Decriptografa os dados
  const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    encryptedData,
  );

  // 2. Converte o buffer de volta para um Blob com o tipo correto
  return new Blob([decryptedBuffer], { type: fileType });
}

// --- Funções Utilitárias para a URL ---

/**
 * Converte um ArrayBuffer (como a chave ou o IV) para uma string Base64.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    // Correção SonarLint: S7758
    binary += String.fromCodePoint(bytes[i]);
  }
  return globalThis.btoa(binary);
}

/**
 * Converte uma string Base64 de volta para um ArrayBuffer.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = globalThis.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    // Correção SonarLint: S7758
    bytes[i] = binary_string.codePointAt(i) ?? 0;
  }
  return bytes.buffer;
}
