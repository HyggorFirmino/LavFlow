import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { refreshToken } from '../services/maxpanApiService';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    refreshToken();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
