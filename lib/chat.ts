import { executeQuery } from './database';

export interface ChatMessage {
  id: number;
  session_id: number;
  user_id: number;
  content: string;
  role: 'user' | 'assistant';
  created_at: Date;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

// ایجاد جلسه چت جدید
export async function createChatSession(userId: number, title: string = 'چت جدید'): Promise<number> {
  const result: any = await executeQuery(
    'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
    [userId, title]
  );
  return result.insertId;
}

// دریافت جلسات چت کاربر
export async function getUserChatSessions(userId: number): Promise<ChatSession[]> {
  const results: any = await executeQuery(
    'SELECT * FROM chat_sessions WHERE user_id = ? AND is_active = TRUE ORDER BY updated_at DESC',
    [userId]
  );
  return results;
}

// ذخیره پیام چت
export async function saveChatMessage(
  sessionId: number,
  userId: number,
  content: string,
  role: 'user' | 'assistant'
): Promise<number> {
  const result: any = await executeQuery(
    'INSERT INTO chat_messages (session_id, user_id, content, role) VALUES (?, ?, ?, ?)',
    [sessionId, userId, content, role]
  );

  // به‌روزرسانی زمان آخرین فعالیت جلسه
  await executeQuery(
    'UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?',
    [sessionId]
  );

  return result.insertId;
}

// دریافت پیام‌های یک جلسه چت
export async function getChatMessages(sessionId: number): Promise<ChatMessage[]> {
  const results: any = await executeQuery(
    'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
    [sessionId]
  );
  return results;
}

// حذف جلسه چت
export async function deleteChatSession(sessionId: number, userId: number): Promise<void> {
  await executeQuery(
    'UPDATE chat_sessions SET is_active = FALSE WHERE id = ? AND user_id = ?',
    [sessionId, userId]
  );
}

// ارسال پیام به هوش مصنوعی
export async function sendToAI(messages: ChatMessage[], userProfile: any): Promise<string> {
  try {
    let systemMessage = `
تو یک مشاور هستی (دستیار هوش مصنوعی مامی‌لند) و وظیفه‌ت همدلی و همراهی با مادرهاست.
نباید خیلی تخصصی جواب بدی؛ باید صمیمی، دلسوز و خودمونی باشی. اگر سوال خیلی تخصصی بود، ارجاع بده به واتساپ مامی‌لند.
جواب باید ۲ تا ۵ خط باشه و حتماً فارسی و غیررسمی.
سوالاتی که مربوط به پزشکی نیستن رو نباید جواب بدی
System: You are a helpful assistant for MamiLand (مامی‌لند), a Persian website specialized in pregnancy and motherhood support. Always respond in Persian language. Be friendly, supportive, and informal.
    `;

    if (userProfile && userProfile.is_complete) {
      systemMessage += `

User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Pregnancy Status: ${userProfile.is_pregnant ? 'باردار' : 'غیر باردار'}
- Pregnancy Week: ${userProfile.pregnancy_week || 'مشخص نشده'}
- Medical Conditions: ${userProfile.medical_conditions || 'هیچی'}

از این اطلاعات برای جواب دادن استفاده کن. اسم کاربر رو اگه خواستی استفاده کن، مشکلی نیست.
`;
    }

    const chat = messages.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    }).join('\n');

    const prompt = `${systemMessage}\n\nChat History:\n${chat}`;
    const encodedPrompt = encodeURIComponent(prompt);

    const response = await fetch(`${process.env.LANGCHAIN_API_URL}?text=${encodedPrompt}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.answer) {
      return data.answer.trim();
    } else {
      return 'متأسفم، نتونستم جواب مناسبی پیدا کنم. دوباره امتحان کن!';
    }
  } catch (error) {
    console.error('Error sending message to AI:', error);
    return 'متأسفم، مشکلی در اتصال به سرور پیش اومده. لطفاً یه کم دیگه صبر کن و دوباره امتحان کن.';
  }
}