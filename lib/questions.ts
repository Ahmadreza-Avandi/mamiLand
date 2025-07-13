// سوالات پیشنهادی برای گروه‌های مختلف کاربران

export interface SuggestedQuestion {
  id: string;
  text: string;
  group: string[];
}

export const suggestedQuestions: SuggestedQuestion[] = [
  // سوالات مادران باردار
  {
    id: 'pregnancy_1',
    text: 'نکات مهم تغذیه در بارداری چیست؟',
    group: ['pregnant_mother']
  },
  {
    id: 'pregnancy_2', 
    text: 'علائم خطرناک بارداری کدامند؟',
    group: ['pregnant_mother']
  },
  {
    id: 'pregnancy_3',
    text: 'چگونه با تهوع بارداری کنار بیایم؟',
    group: ['pregnant_mother']
  },
  {
    id: 'pregnancy_4',
    text: 'ورزش مناسب در دوران بارداری چیست؟',
    group: ['pregnant_mother']
  },
  {
    id: 'pregnancy_5',
    text: 'چه ویتامین‌هایی در بارداری ضروری است؟',
    group: ['pregnant_mother']
  },

  // سوالات مادران بعد از زایمان
  {
    id: 'postpartum_1',
    text: 'چگونه از نوزاد تازه متولد شده مراقبت کنم؟',
    group: ['postpartum_mother']
  },
  {
    id: 'postpartum_2',
    text: 'نکات مهم شیردهی چیست؟',
    group: ['postpartum_mother']
  },
  {
    id: 'postpartum_3',
    text: 'چگونه با افسردگی بعد از زایمان مقابله کنم؟',
    group: ['postpartum_mother']
  },
  {
    id: 'postpartum_4',
    text: 'تغذیه مادر شیرده چگونه باید باشد؟',
    group: ['postpartum_mother']
  },
  {
    id: 'postpartum_5',
    text: 'چه زمانی باید نوزاد را به پزشک ببرم؟',
    group: ['postpartum_mother']
  },

  // سوالات مادران شیرده
  {
    id: 'breastfeeding_1',
    text: 'مشکلات شایع شیردهی و راه حل آنها',
    group: ['breastfeeding_mother']
  },
  {
    id: 'breastfeeding_2',
    text: 'چگونه شیر مادر را افزایش دهم؟',
    group: ['breastfeeding_mother']
  },
  {
    id: 'breastfeeding_3',
    text: 'تا چه سنی باید نوزاد شیر مادر بخورد؟',
    group: ['breastfeeding_mother']
  },
  {
    id: 'breastfeeding_4',
    text: 'آیا می‌توانم در دوران شیردهی دارو مصرف کنم؟',
    group: ['breastfeeding_mother']
  },

  // سوالات مراقبت از کودک
  {
    id: 'child_1',
    text: 'تغذیه مناسب کودک در سنین مختلف',
    group: ['child']
  },
  {
    id: 'child_2',
    text: 'چگونه با لجبازی کودک برخورد کنم؟',
    group: ['child']
  },
  {
    id: 'child_3',
    text: 'نکات ایمنی خانه برای کودکان',
    group: ['child']
  },
  {
    id: 'child_4',
    text: 'چه زمانی کودک باید واکسن بزند؟',
    group: ['child']
  },
  {
    id: 'child_5',
    text: 'چگونه خواب کودک را تنظیم کنم؟',
    group: ['child']
  },

  // سوالات مراقبت از سالمندان
  {
    id: 'elderly_1',
    text: 'تغذیه مناسب برای سالمندان چیست؟',
    group: ['elderly']
  },
  {
    id: 'elderly_2',
    text: 'چگونه از سقوط سالمندان جلوگیری کنم؟',
    group: ['elderly']
  },
  {
    id: 'elderly_3',
    text: 'مراقبت از سالمند مبتلا به دیابت',
    group: ['elderly']
  },
  {
    id: 'elderly_4',
    text: 'ورزش مناسب برای سالمندان کدام است؟',
    group: ['elderly']
  },

  // سوالات عمومی
  {
    id: 'general_1',
    text: 'نکات مهم بهداشت خانواده',
    group: ['pregnant_mother', 'postpartum_mother', 'breastfeeding_mother', 'child', 'elderly']
  },
  {
    id: 'general_2',
    text: 'چگونه استرس خانوادگی را مدیریت کنم؟',
    group: ['pregnant_mother', 'postpartum_mother', 'breastfeeding_mother', 'child', 'elderly']
  },
  {
    id: 'general_3',
    text: 'اهمیت خواب کافی برای سلامتی',
    group: ['pregnant_mother', 'postpartum_mother', 'breastfeeding_mother', 'child', 'elderly']
  },
  {
    id: 'general_4',
    text: 'نکات مهم تغذیه سالم خانواده',
    group: ['pregnant_mother', 'postpartum_mother', 'breastfeeding_mother', 'child', 'elderly']
  }
];

// تابع دریافت سوالات رندوم بر اساس گروه کاربر
export function getRandomQuestions(userGroup: string | null, count: number = 4): string[] {
  if (!userGroup) {
    // اگر گروه مشخص نیست، سوالات عمومی نمایش بده
    const generalQuestions = suggestedQuestions.filter(q => 
      q.group.includes('pregnant_mother') && q.group.includes('postpartum_mother')
    );
    return shuffleArray(generalQuestions).slice(0, count).map(q => q.text);
  }

  // فیلتر سوالات مربوط به گروه کاربر
  const relevantQuestions = suggestedQuestions.filter(q => 
    q.group.includes(userGroup)
  );

  // اگر سوال کافی نداریم، سوالات عمومی اضافه کن
  if (relevantQuestions.length < count) {
    const generalQuestions = suggestedQuestions.filter(q => 
      q.group.length > 2 // سوالات عمومی
    );
    relevantQuestions.push(...generalQuestions);
  }

  return shuffleArray(relevantQuestions).slice(0, count).map(q => q.text);
}

// تابع مخلوط کردن آرایه
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// تابع تعیین گروه کاربر بر اساس اطلاعات پروفایل
export function determineUserGroup(profile: any): string | null {
  if (!profile || !profile.is_complete) return null;

  // اگر باردار است
  if (profile.is_pregnant === true) {
    return 'pregnant_mother';
  }

  // اگر مادر است (بعد از زایمان)
  if (profile.is_pregnant === false) {
    return 'postpartum_mother';
  }

  // اگر سن بالای 60 سال است
  if (profile.age && profile.age >= 60) {
    return 'elderly';
  }

  // اگر سن کمتر از 18 سال است (مراقب کودک)
  if (profile.age && profile.age < 18) {
    return 'child';
  }

  return null;
}