import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { refreshTokenFn } from '../services/maxpanApiService';
import CustomModal from '../components/CustomModal';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [showAuthError, setShowAuthError] = useState(false);

  useEffect(() => {
    refreshTokenFn();

    const handleAuthError = () => {
      setShowAuthError(true);
    };

    window.addEventListener('maxpan-auth-error', handleAuthError);
    return () => window.removeEventListener('maxpan-auth-error', handleAuthError);
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <CustomModal
        isOpen={showAuthError}
        onClose={() => setShowAuthError(false)}
        type="error"
        title="Sessão Maxpan Expirada"
        message="O token da Maxpan está vencido ou é inválido. Por favor, atualize o token no painel de administração (Admin -> Lojas) para continuar usando as funcionalidades de clientes e recargas."
      />
    </>
  );
}

export default MyApp;
