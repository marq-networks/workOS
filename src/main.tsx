import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { installGlobalErrorCapture } from './observability/telemetry';
import './styles/index.css';

installGlobalErrorCapture();
createRoot(document.getElementById('root')!).render(<App />);
