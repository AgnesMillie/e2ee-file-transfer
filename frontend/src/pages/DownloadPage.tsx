import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styles from './DownloadPage.module.css';
// Importa os serviços de API e Cripto
import { downloadFile } from '../services/api.service';
import {
  decryptFile,
  importCryptoKey,
  base64ToArrayBuffer,
} from '../services/crypto.service';

// Enum para os estados da UI
enum DownloadState {
  Idle, // Pronto para baixar
  Downloading, // Baixando do servidor
  Decrypting, // Decriptografando no navegador
  Error, // Erro
}

// Função utilitária para salvar o arquivo no disco
function saveBlob(blob: Blob, filename: string) {
  // Cria uma URL temporária para o Blob
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // Define o nome do arquivo para download
  document.body.appendChild(a); // Adiciona o link ao DOM
  a.click(); // Simula o clique
  a.remove(); // Correção SonarLint S7762
  URL.revokeObjectURL(url); // Libera a memória
}

export function DownloadPage() {
  const { fileKey } = useParams<{ fileKey: string }>();
  const location = useLocation();

  const [downloadState, setDownloadState] = useState(DownloadState.Idle);
  const [errorMessage, setErrorMessage] = useState('');
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [iv, setIv] = useState<Uint8Array | null>(null);

  // Efeito para processar a chave da URL
  useEffect(() => {
    // Estas variáveis agora são usadas:
    setErrorMessage('');
    setDownloadState(DownloadState.Idle);

    const processKey = async () => {
      try {
        // 1. Pega o hash (ex: '#keyBase64.ivBase64')
        const hash = location.hash.substring(1);
        if (!hash) {
          // Correção Prettier: Quebra de linha
          throw new Error(
            'Chave de decriptografia inválida ou ausente na URL.',
          );
        }

        // 2. Separa a chave e o IV
        const [keyBase64, ivBase64] = hash.split('.');
        if (!keyBase64 || !ivBase64) {
          throw new Error('Formato de chave inválido.');
        }

        // 3. Converte de Base64 para ArrayBuffer
        const rawKey = base64ToArrayBuffer(keyBase64);
        const rawIv = base64ToArrayBuffer(ivBase64);

        // 4. Importa a chave para uso na Web Crypto API
        const importedKey = await importCryptoKey(rawKey);
        setCryptoKey(importedKey);
        setIv(new Uint8Array(rawIv));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Erro ao processar o link de download.');
        }
        setDownloadState(DownloadState.Error);
      }
    };

    processKey();
  }, [fileKey, location.hash]); // Roda sempre que o link mudar

  const handleDownload = async () => {
    if (!cryptoKey || !iv || !fileKey) {
      setErrorMessage('Componente não inicializado corretamente.');
      setDownloadState(DownloadState.Error);
      return;
    }

    try {
      // 1. Baixar o arquivo criptografado do back-end
      setDownloadState(DownloadState.Downloading);
      const { data: encryptedData, contentType } = await downloadFile(fileKey);

      // 2. Decriptografar o arquivo no navegador
      setDownloadState(DownloadState.Decrypting);
      // Correção Prettier: Quebra de linha
      const decryptedBlob = await decryptFile(
        encryptedData,
        cryptoKey,
        iv,
        contentType,
      );

      // 3. Salvar o arquivo decriptografado
      // (O nome do arquivo é o fileKey + extensão baseada no tipo)
      const extension = contentType.split('/')[1] || 'bin';
      saveBlob(decryptedBlob, `${fileKey}.${extension}`);

      setDownloadState(DownloadState.Idle);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Ocorreu um erro desconhecido no download.');
      }
      setDownloadState(DownloadState.Error);
    }
  };

  const renderContent = () => {
    if (downloadState === DownloadState.Error) {
      return (
        <>
          <h2>Erro</h2>
          <p className={styles.errorMessage}>{errorMessage}</p>
        </>
      );
    }

    if (downloadState === DownloadState.Downloading) {
      return <h2 className={styles.loadingText}>Baixando...</h2>;
    }

    if (downloadState === DownloadState.Decrypting) {
      return <h2 className={styles.loadingText}>Decriptografando...</h2>;
    }

    return (
      <>
        <h2>Arquivo Pronto para Download</h2>
        <p className={styles.fileName}>
          Arquivo ID:
          <br />
          {fileKey}
        </p>
        <button
          type="button"
          className={styles.downloadButton}
          onClick={handleDownload}
        >
          Baixar e Decriptografar
        </button>
      </>
    );
  };

  return <div className={styles.downloadContainer}>{renderContent()}</div>;
}
