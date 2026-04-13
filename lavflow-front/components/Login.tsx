
import React, { useState } from 'react';
import Link from 'next/link';
import { WashingMachineIcon, EyeIcon, EyeSlashIcon } from './icons';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await onLogin(email, password);

    if (!success) {
      setError('Email ou senha inválidos.');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-t-4 border-laundry-teal-400 m-4">
        <div className="text-center">
          <WashingMachineIcon className="w-16 h-16 mx-auto text-laundry-blue-600 dark:text-laundry-blue-400 animate-[spin_5s_linear_infinite]" />
          <h1 className="mt-4 text-3xl font-bold text-laundry-blue-900 dark:text-slate-100">
            LAVFLOW
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
            Bem-vindo! Faça login para continuar.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-laundry-blue-800 dark:text-slate-200 text-sm font-bold mb-2">Senha</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="shadow-inner bg-laundry-blue-50/50 dark:bg-slate-700/50 appearance-none border border-laundry-blue-200 dark:border-slate-600 rounded-lg w-full py-3 px-4 pr-12 text-gray-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-laundry-teal-400"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600 dark:text-slate-400 hover:text-laundry-teal-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-center text-sm font-medium text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-500/20 p-3 rounded-lg border border-red-200 dark:border-red-500/30">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-laundry-teal-500 hover:bg-laundry-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-laundry-teal-500 disabled:bg-laundry-teal-300 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

         
        </form>
      </div>
    </div>
  );
};

export default Login;