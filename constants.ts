
import { ActivityType, Plan } from './types';

export const MOCK_PLANS: Plan[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'তানভীর আহমেদ',
    type: ActivityType.GAME,
    title: 'বনানীতে ফুটবল ম্যাচ',
    description: '৫ বনাম ৫ ফ্রেন্ডলি ম্যাচের জন্য আরও ৩ জন খেলোয়াড় খুঁজছি।',
    location: 'বনানী মাঠ, ঢাকা',
    dateTime: '2024-05-20T17:00',
    createdAt: '2024-05-15T10:00',
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'সারা কবির',
    type: ActivityType.RIDE_SHARE,
    title: 'চট্টগ্রামে রাইড শেয়ারিং',
    description: 'আমার এসইউভিতে খালি সিট আছে। জ্বালানি খরচ ভাগ করে নেওয়া হবে।',
    location: 'ঢাকা',
    from: 'উত্তরা, ঢাকা',
    to: 'জিইসি মোড়, চট্টগ্রাম',
    dateTime: '2024-05-22T08:30',
    createdAt: '2024-05-16T12:00',
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'রাহাত ইসলাম',
    type: ActivityType.STUDY,
    title: 'আইইএলটিএস প্রস্তুতি গ্রুপ',
    description: 'স্পিকিং এবং রাইটিং প্র্যাকটিস করছি। শীঘ্রই পরীক্ষা দিলে যোগ দিন।',
    location: 'ধানমন্ডি লেক ক্যাফে',
    dateTime: '2024-05-21T15:00',
    createdAt: '2024-05-17T09:00',
  },
  {
    id: '4',
    userId: 'u4',
    userName: 'নাইলা জামান',
    type: ActivityType.HANGOUT,
    title: 'ফটোগ্রাফি ওয়াক',
    description: 'লেন্সের মাধ্যমে পুরান ঢাকা অন্বেষণ। নতুনদের স্বাগতম!',
    location: 'আহসান মঞ্জিল',
    dateTime: '2024-05-25T10:00',
    createdAt: '2024-05-18T14:00',
  }
];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  [ActivityType.GAME]: 'খেলাধুলা',
  [ActivityType.RIDE_SHARE]: 'রাইড শেয়ার',
  [ActivityType.HANGOUT]: 'আড্ডা',
  [ActivityType.STUDY]: 'পড়াশোনা',
  [ActivityType.EVENT]: 'ইভেন্ট',
  [ActivityType.OTHER]: 'অন্যান্য',
};

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  [ActivityType.GAME]: 'bg-orange-100 text-orange-600',
  [ActivityType.RIDE_SHARE]: 'bg-blue-100 text-blue-600',
  [ActivityType.HANGOUT]: 'bg-pink-100 text-pink-600',
  [ActivityType.STUDY]: 'bg-green-100 text-green-600',
  [ActivityType.EVENT]: 'bg-purple-100 text-purple-600',
  [ActivityType.OTHER]: 'bg-gray-100 text-gray-600',
};
