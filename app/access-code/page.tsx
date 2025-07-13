'use client';

import { useState } from 'react';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccessCodePage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/register');
      } else {
        setError(data.error || 'کد دسترسی نامعتبر است');
      }
    } catch (error) {
      setError('خطایی رخ داد، دوباره تلاش کنید');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col" dir="rtl">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-pink-50 transition-colors duration-200"
              >
                <ArrowRight className="text-gray-600" size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-800 mr-3">کد دسترسی</h1>
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={24} />
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                لطفاً کد دسترسی دریافتی از ادمین را وارد کنید
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کد دسترسی
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="مثال: ABC123"
                    className="w-full pr-10 pl-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200 text-center font-mono text-lg tracking-wider"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!code.trim() || isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    در حال بررسی...
                  </div>
                ) : (
                  'ادامه'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-pink-100">
              <p className="text-center text-xs text-gray-500">
                کد دسترسی را از ادمین دریافت کنید
              </p>
              <div className="mt-4 bg-pink-50 border border-pink-200 rounded-xl p-4">
                <p className="text-center text-xs text-pink-700 leading-relaxed">
                  <strong>کدهای نمونه:</strong><br />
                  ABC123, XYZ789, DEF456
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4 px-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-gray-500">
            تمامی حقوق محفوظ است مامی‌لند © {new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Developed by Ahmadreza.Avandi@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}