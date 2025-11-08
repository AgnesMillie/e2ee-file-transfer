import React, { useRef, useState } from 'react';
import styles from './UploadForm.module.css';
import { v4 as uuidv4 } from 'uuid';
import {
  generateCryptoKey,
  exportCryptoKey,
  arrayBufferToBase64,
  encryptFile,
} from '../services/crypto.service';
// Importamos apenas o 'uploadFile'
import { uploadFile } from '../services/api.service';

// Enum para os estados da UI
enum UploadState {
  Idle, // Ocioso, pronto para upload
  Encrypting, // Criptografando o arquivo no navegador
  Uploading, // Fazendo upload para o Back-end
  Success, // Sucesso
  Error, // Erro
}

export function UploadForm() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadState, setUploadState] = useState(UploadState.Idle);
  const [errorMessage, setErrorMessage] = useState('');
  const [shareableLink, setShareableLink] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  // Função centralizada para processar o arquivo
  const processFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadState(UploadState.Encrypting);
    setErrorMessage('');
    setShareableLink('');

    try {
      // --- LÓGICA DE CRIPTOGRAFIA (CLIENT-SIDE) ---
      const fileKey = uuidv4(); // Gera um ID único para o arquivo
      const cryptoKey = await generateCryptoKey(); // Gera a chave AES-256
      const { encryptedData, iv } = await encryptFile(file, cryptoKey);
      const contentType = file.type || 'application/octet-stream';

      // --- LÓGICA DE UPLOAD (PROXY) ---
      setUploadState(UploadState.Uploading);
      // Chamada única para nossa API de proxy
      await uploadFile(fileKey, contentType, encryptedData);

      // --- GERAÇÃO DO LINK (CLIENT-SIDE) ---
      const exportedKey = await exportCryptoKey(cryptoKey);
      const keyBase64 = arrayBufferToBase64(exportedKey);
      const ivBase64 = arrayBufferToBase64(iv.buffer as ArrayBuffer);

      const link = `${globalThis.location.origin}/download/${fileKey}#${keyBase64}.${ivBase64}`;
      setShareableLink(link);
      setUploadState(UploadState.Success);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Ocorreu um erro desconhecido.');
      }
      setUploadState(UploadState.Error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  // --- Funções de Renderização ---

  const renderContent = () => {
    switch (uploadState) {
      case UploadState.Encrypting:
        return <h2>Criptografando...</h2>;
      // Removemos o 'RequestingUrl'
      case UploadState.Uploading:
        return <h2>Fazendo upload...</h2>;
      case UploadState.Success:
        return (
          <>
            <h2>Upload Concluído!</h2>
            <p>Copie seu link seguro:</p>
            <input
              type="text"
              readOnly
              value={shareableLink}
              className={styles.linkInput}
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className={styles.selectButton}
              onClick={() => processFile(undefined)} // (Reset)
            >
              Enviar Outro
            </button>
          </>
        );
      case UploadState.Error:
        return (
          <>
            <h2>Erro no Upload</h2>
            <p className={styles.errorMessage}>{errorMessage}</p>
            <button
              type="button"
              className={styles.selectButton}
              onClick={() => setUploadState(UploadState.Idle)} // (Reset)
            >
              Tentar Novamente
            </button>
          </>
        );
      case UploadState.Idle:
      default:
        return (
          <>
            <h2>Arraste e Solte seu Arquivo</h2>
            <p className={styles.orText}>ou</p>
            <button
              type="button"
              className={styles.selectButton}
              onClick={handleSelectClick}
            >
              Selecionar Arquivo
            </button>
            <p>Máximo 1GB</p>
          </>
        );
    }
  };

  const formClassName = `${styles.uploadForm} ${
    isDragActive ? styles.uploadFormActive : ''
  }`;
  const isIdle = uploadState === UploadState.Idle;

  return (
    <div
      className={formClassName}
      onDragEnter={isIdle ? handleDrag : undefined}
      onDragOver={isIdle ? handleDrag : undefined}
      onDragLeave={isIdle ? handleDrag : undefined}
      onDrop={isIdle ? handleDrop : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        (e.key === 'Enter' || e.key === ' ') && handleSelectClick()
      }
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className={styles.fileInput}
        disabled={uploadState !== UploadState.Idle}
      />
      {renderContent()}
    </div>
  );
}
