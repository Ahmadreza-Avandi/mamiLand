'use client';

import { useState, useEffect } from 'react';
import { Heart, Baby, Users, ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col" dir="rtl">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Heart className="text-white" size={32} />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                به مامی‌لند خوش آمدید
              </h1>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                دستیار هوشمند شما در مسیر مادری
              </p>

              <div className="flex items-center justify-center gap-4 mb-8 text-pink-500">
                <Heart size={20} className="animate-pulse" />
                <Baby size={20} />
                <Users size={20} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
                حساب کاربری دارید؟
              </h2>

              <a
                href="/login"
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                بله، وارد حساب کاربری می‌شوم
                <ArrowLeft size={18} />
              </a>

              <a
                href="/access-code"
                className="w-full bg-white hover:bg-pink-50 border-2 border-pink-200 hover:border-pink-300 text-pink-600 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                خیر، حساب جدید می‌سازم
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-pink-100">
              <p className="text-center text-xs text-gray-500 leading-relaxed">
                مامی‌لند همراه شما در تمام مراحل مادری
              </p>
              
              <div className="mt-4 text-center">
                <a
                  href="/admin"
                  className="text-xs text-gray-400 hover:text-pink-500 transition-colors"
                >
                  ورود ادمین
                </a>
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