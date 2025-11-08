import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export async function uploadFile(
  fileKey: string,
  contentType: string,
  encryptedData: ArrayBuffer,
) {
  const fileBlob = new Blob([encryptedData]);
  const formData = new FormData();
  formData.append('fileKey', fileKey);
  formData.append('contentType', contentType);
  formData.append('file', fileBlob);

  // [LOGS REMOVIDOS]

  try {
    await apiClient.post('/files/upload', formData);
  } catch (error) {
    console.error('[LOG-FRONTEND-PROXY] Erro ao fazer upload:', error);
    throw new Error('Falha no upload do arquivo.');
  }
}

export async function downloadFile(
  fileKey: string,
): Promise<{ data: ArrayBuffer; contentType: string }> {
  // [LOG REMOVIDO]
  try {
    const response = await apiClient.get(`/files/download/${fileKey}`, {
      responseType: 'arraybuffer',
    });

    return {
      data: response.data,
      contentType:
        response.headers['content-type'] || 'application/octet-stream',
    };
  } catch (error) {
    console.error('[LOG-FRONTEND-PROXY] Erro ao baixar:', error);
    throw new Error(
      'Falha ao baixar o arquivo. Ele pode ter expirado ou não existir.',
    );
  }
}
