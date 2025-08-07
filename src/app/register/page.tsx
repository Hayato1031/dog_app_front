'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, User, Mail, Lock, Check, X, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password, passwordConfirmation);
      router.push('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.error || '登録に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Heart size={80} className="text-red-500 wag-animation" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent mb-2">
            よっつのおくすり日記
          </h2>
          <p className="text-orange-600 font-medium">
            新しいアカウントを作成しましょう
          </p>
        </div>
        <div className="warm-card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
                <X size={16} />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-2">
                  <User size={16} />
                  <span>名前</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400"
                  placeholder="名前を入力"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-2">
                  <Mail size={16} />
                  <span>メールアドレス</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400"
                  placeholder="メールアドレスを入力"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-2">
                  <Lock size={16} />
                  <span>パスワード</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400"
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="passwordConfirmation" className="flex items-center space-x-2 text-sm font-bold text-orange-800 mb-2">
                  <Check size={16} />
                  <span>パスワード確認</span>
                </label>
                <input
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="warm-input w-full px-4 py-3 text-orange-900 placeholder-orange-400"
                  placeholder="パスワードを再度入力"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full warm-button py-4 text-lg disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>登録中...</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>アカウント作成</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <Link 
                href="/login" 
                className="font-semibold text-orange-600 hover:text-orange-800 transition-colors flex items-center justify-center space-x-2"
              >
                <LogIn size={16} />
                <span>すでにアカウントをお持ちの方はこちら</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}