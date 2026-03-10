import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { refreshTokenFn } from '../services/maxpanApiService';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    refreshTokenFn();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
