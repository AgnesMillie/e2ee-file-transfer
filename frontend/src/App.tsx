import { Routes, Route } from 'react-router-dom';
import { UploadForm } from './components/UploadForm';
import './index.css';

// Vamos criar um placeholder para a página de Download
function DownloadPagePlaceholder() {
  return <h1>Página de Download (Em construção)</h1>;
}

function App() {
  return (
    <Routes>
      {/* Rota 1: Página inicial (Upload) */}
      <Route path="/" element={<UploadForm />} />

      {/* Rota 2: Página de Download */}
      <Route path="/download/:fileKey" element={<DownloadPagePlaceholder />} />
    </Routes>
  );
}

export default App;
