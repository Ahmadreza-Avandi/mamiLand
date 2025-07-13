'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Menu, 
  LogOut, 
  Clock,
  User,
  Bot,
  Settings,
  MessageSquare,
  Send,
  Loader2,
  X,
  Edit,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRandomQuestions, determineUserGroup } from '@/lib/questions';

interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface UserProfile {
  name: string;
  age: number | null;
  is_pregnant: boolean | null;
  pregnancy_week: number | null;
  medical_conditions: string | null;
  user_group: string | null;
  is_complete: boolean;
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  message_count: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showOnboardingOptions, setShowOnboardingOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile>({
    name: '',
    age: null,
    is_pregnant: null,
    pregnancy_week: null,
    medical_conditions: '',
    user_group: null,
    is_complete: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // بررسی احراز هویت در بارگذاری اولیه
  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserProfile(data.user.profile);
        setProfileForm(data.user.profile || {
          name: '',
          age: null,
          is_pregnant: null,
          pregnancy_week: null,
          medical_conditions: '',
          user_group: null,
          is_complete: false
        });
        
        // تعیین مرحله onboarding
        if (data.user.profile) {
          const step = getOnboardingStep(data.user.profile);
          setOnboardingStep(step);
          
          // بارگذاری جلسات چت
          await loadChatSessions();
          
          // اگر پروفایل کامل است، آخرین جلسه را بارگذاری کن
          if (step >= 6) {
            await loadLastChatSession();
          } else {
            // اگر onboarding کامل نشده، پیام خوش‌آمدگویی نمایش بده
            const welcomeMessage: ChatMessage = {
              id: Date.now(),
              content: getOnboardingMessage(step),
              role: 'assistant',
              created_at: new Date().toISOString()
            };
            setMessages([welcomeMessage]);
            
            // نمایش گزینه‌ها برای سوالات مناسب
            if (step === 2 || step === 5) {
              setShowOnboardingOptions(true);
            }
          }
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    }
  };

  const loadChatSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions');
      if (response.ok) {
        const data = await response.json();
        setChatSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const loadLastChatSession = async () => {
    try {
      const response = await fetch('/api/chat/sessions');
      if (response.ok) {
        const data = await response.json();
        const sessions = data.sessions || [];
        if (sessions.length > 0) {
          const lastSession = sessions[0];
          setCurrentSessionId(lastSession.id);
          await loadChatMessages(lastSession.id);
        }
      }
    } catch (error) {
      console.error('Error loading last chat session:', error);
    }
  };

  const loadChatMessages = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chat/messages/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const createNewChatSession = async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'چت جدید'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(data.sessionId);
        setMessages([]);
        await loadChatSessions();
        return data.sessionId;
      }
    } catch (error) {
      console.error('Error creating new chat session:', error);
    }
    return null;
  };

  const getOnboardingStep = (profile: UserProfile): number => {
    if (!profile.name) return 0;
    if (profile.age === null) return 1;
    if (profile.is_pregnant === null) return 2;
    if (profile.is_pregnant && profile.pregnancy_week === null) return 3;
    if (!profile.medical_conditions) return 4;
    if (!profile.user_group) return 5;
    return 6;
  };

  const getOnboardingMessage = (step: number): string => {
    const messages = [
      'سلام! من هوش مصنوعی مامی‌لند هستم. لطفاً برای شروع کار اسم خودتون رو بگید.',
      'خوشبختم! لطفاً سن خودتون رو بگید.',
      'وضعیت فعلی شما چیست؟',
      'لطفاً بگید هفته چندم بارداری هستید؟',
      'آیا بیماری زمینه‌ای دارید؟ اگر دارید لطفاً توضیح دهید، در غیر این صورت "ندارم" بنویسید.',
      'شما در کدام گروه قرار می‌گیرید؟',
      'عالی! اطلاعات شما ذخیره شد و می‌توانید ادامه سوالاتتون رو بپرسید.'
    ];
    return messages[step] || messages[0];
  };

  const getOnboardingOptions = (step: number): string[] => {
    if (step === 2) {
      return ['مادر هستم', 'حامله هستم', 'هیچکدام'];
    }
    if (step === 5) {
      return ['سالمند', 'کودک', 'مادر باردار', 'مادر بعد از زایمان', 'مادر شیرده'];
    }
    return [];
  };

  // تبدیل اعداد فارسی به انگلیسی
  const convertPersianToEnglish = (str: string): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let result = str;
    for (let i = 0; i < persianNumbers.length; i++) {
      result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
    }
    return result;
  };

  const handleOnboardingOption = async (option: string) => {
    setShowOnboardingOptions(false);
    await handleSendMessage(null, option);
  };

  const handleSendMessage = async (e: React.FormEvent | null, customMessage?: string) => {
    if (e) e.preventDefault();
    const messageContent = customMessage || newMessage.trim();
    if (!messageContent || isLoading) return;

    // ایجاد جلسه جدید اگر وجود ندارد
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createNewChatSession();
      if (!sessionId) return;
    }

    const userMsg: ChatMessage = {
      id: Date.now(),
      content: messageContent,
      role: 'user',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customMessage) setNewMessage('');
    setIsLoading(true);

    try {
      // اگر در مرحله onboarding هستیم
      if (onboardingStep < 6) {
        const result = await processOnboarding(messageContent, onboardingStep);
        if (result.reply) {
          const assistantMsg: ChatMessage = {
            id: Date.now() + 1,
            content: result.reply,
            role: 'assistant',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMsg]);
          setOnboardingStep(result.nextStep);
          
          // نمایش گزینه‌ها برای سوال بعدی
          if (result.nextStep === 2 || result.nextStep === 5) {
            setShowOnboardingOptions(true);
          }
          
          // به‌روزرسانی پروفایل
          if (result.profile) {
            setUserProfile(result.profile);
            setProfileForm(result.profile);
            await updateProfile(result.profile);
          }

          // ذخیره پیام‌ها در دیتابیس
          await saveChatMessage(sessionId, userMsg.content, 'user');
          await saveChatMessage(sessionId, assistantMsg.content, 'assistant');
        }
      } else {
        // ارسال به هوش مصنوعی
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageContent,
            messages: [...messages, userMsg],
            sessionId: sessionId
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const assistantMsg: ChatMessage = {
            id: Date.now() + 1,
            content: data.reply,
            role: 'assistant',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMsg]);

          // ذخیره پیام‌ها در دیتابیس
          await saveChatMessage(sessionId, userMsg.content, 'user');
          await saveChatMessage(sessionId, assistantMsg.content, 'assistant');
          
          // به‌روزرسانی لیست جلسات
          await loadChatSessions();
        } else {
          throw new Error('خطا در ارسال پیام');
        }
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        content: 'متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید.',
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    }

    setIsLoading(false);
  };

  const saveChatMessage = async (sessionId: number, content: string, role: 'user' | 'assistant') => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          content,
          role
        }),
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const processOnboarding = async (content: string, step: number) => {
    const profile = { ...userProfile } as UserProfile;
    let reply: string | null = null;
    let nextStep = step;

    switch (step) {
      case 0:
        profile.name = content.trim();
        reply = `خوشبختم ${profile.name}! لطفاً سن خودتون رو بگید.`;
        nextStep = 1;
        break;
      case 1:
        const convertedContent = convertPersianToEnglish(content.trim());
        const age = parseInt(convertedContent, 10);
        if (isNaN(age) || age < 15 || age > 60) {
          reply = 'لطفاً سن معتبری وارد کنید (۱۵ تا ۶۰).';
        } else {
          profile.age = age;
          reply = 'وضعیت فعلی شما چیست؟';
          nextStep = 2;
        }
        break;
      case 2:
        if (content === 'مادر هستم') {
          profile.is_pregnant = false;
          profile.pregnancy_week = 0;
          reply = 'آیا بیماری زمینه‌ای دارید؟ اگر دارید لطفاً توضیح دهید، در غیر این صورت "ندارم" بنویسید.';
          nextStep = 4;
        } else if (content === 'حامله هستم' || content === 'باردار هستم') {
          profile.is_pregnant = true;
          reply = 'لطفاً بگید هفته چندم بارداری هستید؟';
          nextStep = 3;
        } else if (content === 'هیچکدام') {
          profile.is_pregnant = null;
          profile.pregnancy_week = 0;
          reply = 'آیا بیماری زمینه‌ای دارید؟ اگر دارید لطفاً توضیح دهید، در غیر این صورت "ندارم" بنویسید.';
          nextStep = 4;
        } else {
          reply = 'لطفاً یکی از گزینه‌های ارائه شده را انتخاب کنید.';
        }
        break;
      case 3:
        const convertedWeek = convertPersianToEnglish(content.trim());
        const week = parseInt(convertedWeek, 10);
        if (isNaN(week) || week < 1 || week > 42) {
          reply = 'لطفاً یک عدد بین ۱ تا ۴۲ وارد کنید.';
        } else {
          profile.pregnancy_week = week;
          reply = 'آیا بیماری زمینه‌ای دارید؟ اگر دارید لطفاً توضیح دهید، در غیر این صورت "ندارم" بنویسید.';
          nextStep = 4;
        }
        break;
      case 4:
        profile.medical_conditions = content.trim();
        reply = 'شما در کدام گروه قرار می‌گیرید؟';
        nextStep = 5;
        break;
      case 5:
        const groupMapping: { [key: string]: string } = {
          'سالمند': 'elderly',
          'کودک': 'child',
          'مادر باردار': 'pregnant_mother',
          'مادر بعد از زایمان': 'postpartum_mother',
          'مادر شیرده': 'breastfeeding_mother'
        };
        
        if (groupMapping[content]) {
          profile.user_group = groupMapping[content];
          profile.is_complete = true;
          reply = 'عالی! اطلاعات شما ذخیره شد و می‌توانید ادامه سوالاتتون رو بپرسید.';
          nextStep = 6;
        } else {
          reply = 'لطفاً یکی از گزینه‌های ارائه شده را انتخاب کنید.';
        }
        break;
    }

    return { reply, profile, nextStep };
  };

  const updateProfile = async (profile: UserProfile) => {
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm);
      setUserProfile(profileForm);
      setEditingProfile(false);
      alert('اطلاعات با موفقیت ذخیره شد');
    } catch (error) {
      alert('خطا در ذخیره اطلاعات');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      router.push('/');
    }
  };

  const startNewChat = async () => {
    const sessionId = await createNewChatSession();
    if (sessionId) {
      setMessages([]);
      setSidebarOpen(false);
    }
  };

  const loadChatSession = async (sessionId: number) => {
    setCurrentSessionId(sessionId);
    await loadChatMessages(sessionId);
    setSidebarOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // دریافت سوالات رندوم بر اساس گروه کاربر
  const randomQuestions = userProfile?.is_complete 
    ? getRandomQuestions(userProfile.user_group, 4)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">چت‌های من</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <button
              onClick={startNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all duration-200"
            >
              <Plus size={18} />
              چت جدید
            </button>
          </div>

          {/* Chat Sessions */}
          <div className="flex-1 overflow-y-auto p-4">
            {chatSessions.length > 0 ? (
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadChatSession(session.id)}
                    className={`w-full text-right p-3 rounded-lg transition-colors duration-200 ${
                      currentSessionId === session.id
                        ? 'bg-pink-50 border border-pink-200 text-pink-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} />
                        <span className="text-sm font-medium truncate">{session.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">{session.message_count}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-sm text-gray-600">هنوز چتی ندارید</p>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{userProfile?.name || user.username}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
              >
                <Settings size={16} />
                تنظیمات حساب
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
              >
                <LogOut size={16} />
                خروج از حساب
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Menu size={20} />
              </button>
              
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-white" size={20} />
              </div>
              
              <div>
                <h1 className="font-semibold text-gray-900">مامی‌لند</h1>
                <p className="text-sm text-gray-600">
                  {userProfile?.is_complete && userProfile?.name 
                    ? `سلام ${userProfile.name}`
                    : 'دستیار هوشمند شما'
                  }
                </p>
              </div>
            </div>

            {userProfile?.is_complete && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-lg">
                <User size={16} className="text-pink-600" />
                <span className="text-sm text-pink-700">
                  {userProfile.is_pregnant && userProfile.pregnancy_week && userProfile.pregnancy_week > 0 
                    ? `هفته ${userProfile.pregnancy_week}` 
                    : 'پروفایل تکمیل شده'
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="text-white" size={32} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {userProfile?.name ? `سلام ${userProfile.name}!` : 'به مامی‌لند خوش آمدید'}
                </h2>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  من دستیار هوشمند مامی‌لند هستم. آماده‌ام تا در زمینه‌های بارداری، مادری و خانواده به شما کمک کنم.
                </p>

                {userProfile?.is_complete && randomQuestions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {randomQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(null, question)}
                        className="text-right p-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-pink-200 rounded-xl transition-all duration-200 text-sm text-gray-700 hover:text-pink-700"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-4">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-pink-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      <span className="text-xs text-gray-500 mt-1 px-2">
                        {new Date(message.created_at).toLocaleTimeString('fa-IR', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bot size={16} className="text-gray-600" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Onboarding Options */}
        {showOnboardingOptions && (onboardingStep === 2 || onboardingStep === 5) && (
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm text-gray-600 mb-3 text-center">لطفاً یکی از گزینه‌های زیر را انتخاب کنید:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {getOnboardingOptions(onboardingStep).map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOnboardingOption(option)}
                    className="px-4 py-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 hover:border-pink-300 text-pink-700 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="پیام خود را اینجا بنویسید..."
                  className="w-full resize-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-4 pl-12 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200 min-h-[48px] max-h-[120px]"
                  rows={1}
                  disabled={isLoading || showOnboardingOptions}
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isLoading || showOnboardingOptions}
                  className="absolute left-2 bottom-2 w-8 h-8 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 py-2 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gray-500">
              تمامی حقوق محفوظ است مامی‌لند © {new Date().getFullYear()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Developed by Ahmadreza.Avandi@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">تنظیمات حساب</h3>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setEditingProfile(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">نام کاربری:</label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{user.username}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">ایمیل:</label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{user.email}</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-600">نام:</label>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="text-pink-600 hover:text-pink-700"
                  >
                    {editingProfile ? <X size={16} /> : <Edit size={16} />}
                  </button>
                </div>
                {editingProfile ? (
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-50 p-2 rounded">{userProfile?.name || 'تعیین نشده'}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">سن:</label>
                {editingProfile ? (
                  <input
                    type="number"
                    value={profileForm.age || ''}
                    onChange={(e) => setProfileForm({...profileForm, age: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="15"
                    max="60"
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-50 p-2 rounded">{userProfile?.age || 'تعیین نشده'}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">وضعیت:</label>
                {editingProfile ? (
                  <select
                    value={profileForm.is_pregnant === null ? 'null' : profileForm.is_pregnant.toString()}
                    onChange={(e) => {
                      const value = e.target.value === 'null' ? null : e.target.value === 'true';
                      setProfileForm({...profileForm, is_pregnant: value});
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="null">هیچکدام</option>
                    <option value="false">مادر هستم</option>
                    <option value="true">حامله هستم</option>
                  </select>
                ) : (
                  <p className="text-gray-800 bg-gray-50 p-2 rounded">
                    {userProfile?.is_pregnant === null ? 'هیچکدام' : 
                     userProfile?.is_pregnant ? 'حامله' : 'مادر'}
                  </p>
                )}
              </div>
              
              {profileForm.is_pregnant && (
                <div>
                  <label className="text-sm font-medium text-gray-600">هفته بارداری:</label>
                  {editingProfile ? (
                    <input
                      type="number"
                      value={profileForm.pregnancy_week || ''}
                      onChange={(e) => setProfileForm({...profileForm, pregnancy_week: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full p-2 border border-gray-300 rounded"
                      min="1"
                      max="42"
                    />
                  ) : (
                    <p className="text-gray-800 bg-gray-50 p-2 rounded">{userProfile?.pregnancy_week || 'تعیین نشده'}</p>
                  )}
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600">گروه کاربری:</label>
                {editingProfile ? (
                  <select
                    value={profileForm.user_group || ''}
                    onChange={(e) => setProfileForm({...profileForm, user_group: e.target.value || null})}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="elderly">سالمند</option>
                    <option value="child">کودک</option>
                    <option value="pregnant_mother">مادر باردار</option>
                    <option value="postpartum_mother">مادر بعد از زایمان</option>
                    <option value="breastfeeding_mother">مادر شیرده</option>
                  </select>
                ) : (
                  <p className="text-gray-800 bg-gray-50 p-2 rounded">
                    {userProfile?.user_group === 'elderly' ? 'سالمند' :
                     userProfile?.user_group === 'child' ? 'کودک' :
                     userProfile?.user_group === 'pregnant_mother' ? 'مادر باردار' :
                     userProfile?.user_group === 'postpartum_mother' ? 'مادر بعد از زایمان' :
                     userProfile?.user_group === 'breastfeeding_mother' ? 'مادر شیرده' :
                     'تعیین نشده'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">سابقه پزشکی:</label>
                {editingProfile ? (
                  <textarea
                    value={profileForm.medical_conditions || ''}
                    onChange={(e) => setProfileForm({...profileForm, medical_conditions: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-50 p-2 rounded">{userProfile?.medical_conditions || 'ندارم'}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">تاریخ عضویت:</label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{new Date(user.created_at).toLocaleDateString('fa-IR')}</p>
              </div>
              
              {editingProfile && (
                <button
                  onClick={handleSaveProfile}
                  className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg transition-colors duration-200"
                >
                  <Save size={16} />
                  ذخیره تغییرات
                </button>
              )}
            </div>

            {/* Footer در مودال */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  تمامی حقوق محفوظ است مامی‌لند © {new Date().getFullYear()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Developed by Ahmadreza.Avandi@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}