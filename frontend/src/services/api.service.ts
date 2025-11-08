import axios from 'axios';

// 1. Obtém a URL base da nossa API (Axios ainda é usado)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // O Content-Type será 'multipart/form-data',
  // mas deixamos o axios/navegador definir isso.
});

/**
 * --- ARQUITETURA PROXY (NOVA FUNÇÃO) ---
 * Faz o upload do arquivo criptografado, fileKey e contentType
 * diretamente para o nosso Back-end.
 *
 * @param fileKey O UUID do arquivo.
 * @param contentType O MIME type original.
 * @param encryptedData O blob do arquivo criptografado.
 */
export async function uploadFile(
  fileKey: string,
  contentType: string,
  encryptedData: ArrayBuffer,
) {
  // 1. Converte o ArrayBuffer em um Blob para o FormData
  const fileBlob = new Blob([encryptedData]);

  // 2. Cria o payload FormData (obrigatório para upload de arquivos)
  const formData = new FormData();
  formData.append('fileKey', fileKey);
  formData.append('contentType', contentType);
  // O nome do campo 'file' DEVE bater com o FileInterceptor no back-end
  formData.append('file', fileBlob);

  // --- LOGS ---
  console.log(
    `[LOG-FRONTEND-PROXY] Enviando POST para: ${API_BASE_URL}/files/upload`,
  );
  console.log(`[LOG-FRONTEND-PROXY] Enviando Key: ${fileKey}`);

  try {
    // 3. Envia o formulário para o back-end
    // O Axios definirá automaticamente o 'Content-Type: multipart/form-data'
    await apiClient.post('/files/upload', formData);
  } catch (error) {
    console.error('[LOG-FRONTEND-PROXY] Erro ao fazer upload:', error);
    throw new Error('Falha no upload do arquivo.');
  }
}
