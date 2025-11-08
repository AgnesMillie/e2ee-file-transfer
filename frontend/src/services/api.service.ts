import axios from 'axios';

// 1. Obtém a URL base da nossa API a partir das variáveis de ambiente
// O Vite injeta isso em 'import.meta.env'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 2. Cria uma instância do Axios pré-configurada
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Define os tipos de dados que esperamos da nossa API
// (Ainda não criamos esta rota no back-end, mas vamos criar)
interface PresignedUrlResponse {
  uploadUrl: string; // URL para onde o front-end fará o PUT
  fileKey: string; // O UUID/nome do arquivo no S3
}

/**
 * Solicita ao back-end uma URL pré-assinada para upload.
 * @param fileKey O nome único (UUID) que o arquivo terá no S3.
 * @param contentType O tipo MIME do arquivo (ex: 'image/png').
 */
export async function getPresignedUploadUrl(
  fileKey: string,
  contentType: string,
): Promise<PresignedUrlResponse> {
  try {
    const response = await apiClient.post<PresignedUrlResponse>(
      '/files/upload-url', // Rota da API (criaremos no back-end)
      {
        fileKey,
        contentType,
      },
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter URL pré-assinada:', error);
    throw new Error('Falha ao preparar o upload. Tente novamente.');
  }
}

/**
 * Faz o upload do arquivo criptografado diretamente para o S3/Minio
 * usando a URL pré-assinada.
 * @param uploadUrl A URL recebida do nosso back-end.
 * @param encryptedData O arquivo criptografado (ArrayBuffer).
 * @param contentType O tipo MIME original.
 */
export async function uploadFileToStorage(
  uploadUrl: string,
  encryptedData: ArrayBuffer,
  contentType: string,
) {
  try {
    // Nota: Usamos 'axios.put' aqui, não o 'apiClient',
    // pois estamos enviando para uma URL externa (Minio/S3),
    // não para a nossa API.
    await axios.put(uploadUrl, encryptedData, {
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo para o S3:', error);
    throw new Error('Falha no upload do arquivo.');
  }
}
