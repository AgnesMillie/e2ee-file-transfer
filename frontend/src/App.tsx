import { Routes, Route } from 'react-router-dom';
import { UploadForm } from './components/UploadForm';
import { DownloadPage } from './pages/DownloadPage'; // Importa a página real
import './index.css';

function App() {
  return (
    <Routes>
      {/* Rota 1: Página inicial (Upload) */}
      <Route path="/" element={<UploadForm />} />

      {/* Rota 2: Página de Download */}
      {/* Removemos o 'DownloadPagePlaceholder' */}
      <Route path="/download/:fileKey" element={<DownloadPage />} />
    </Routes>
  );
}

export default App;
