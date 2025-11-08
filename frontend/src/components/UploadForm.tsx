// O 'useRef' não é mais necessário para este componente
import React, { useState } from 'react';
import styles from './UploadForm.module.css';

export function UploadForm() {
  const [isDragActive, setIsDragActive] = useState(false);

  // Esta função de clique manual e o ref não são mais necessários
  // const fileInputRef = useRef<HTMLInputElement>(null);
  // const handleSelectClick = () => {
  //   fileInputRef.current?.click();
  // };

  // Função centralizada para processar o arquivo
  const processFile = (file: File | undefined) => {
    if (!file) return;
    console.log('Arquivo selecionado:', file.name);
    // Lógica de criptografia e upload entrará aqui
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
  };

  // --- Manipuladores de Drag and Drop ---

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

  const formClassName = `${styles.uploadForm} ${
    isDragActive ? styles.uploadFormActive : ''
  }`;

  return (
    // Correção: Trocamos o <div> por <label>
    // Acessibilidade nativa: O htmlFor aponta para o ID do input.
    <label
      htmlFor="file-upload"
      className={formClassName}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      // role="button", tabIndex e onKeyDown foram removidos.
    >
      <input
        id="file-upload" // ID para o <label> encontrar
        type="file"
        // ref foi removido
        onChange={handleFileChange}
        className={styles.fileInput}
      />

      <h2>Arraste e Solte seu Arquivo</h2>
      <p className={styles.orText}>ou</p>

      <button
        type="button"
        className={styles.selectButton}
        // onClick foi removido. A <label> cuida do clique.
        tabIndex={-1} // Evita foco duplicado (o <label> já é focável)
      >
        Selecionar Arquivo
      </button>

      <p>Máximo 1GB</p>
    </label>
  );
}
