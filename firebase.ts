
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, Timestamp, getDocFromServer, arrayUnion, arrayRemove } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operation types for error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection function
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export async function seedPlans(userId: string, userName: string) {
  const plansRef = collection(db, 'plans');
  
  const otherUsers = [
    { id: 'user_1', name: 'আরিফ আহমেদ' },
    { id: 'user_2', name: 'সাদিয়া ইসলাম' },
    { id: 'user_3', name: 'তানভীর রহমান' },
    { id: 'user_4', name: 'নুসরাত জাহান' }
  ];

  const demoPlans = [
    {
      userId,
      userName,
      type: 'Game',
      title: 'ধানমন্ডিতে ফ্রেন্ডলি ক্রিকেট ম্যাচ',
      description: 'আগামী শুক্রবার বিকেলে ধানমন্ডি ৮/এ মাঠে একটি ফ্রেন্ডলি ক্রিকেট ম্যাচের আয়োজন করছি। আমাদের আরও ৪ জন খেলোয়াড় দরকার। সবাই আমন্ত্রিত!',
      location: 'ধানমন্ডি ৮/এ মাঠ, ঢাকা',
      dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      createdAt: new Date().toISOString(),
      participants: [{ userId, userName }],
    },
    {
      userId: otherUsers[0].id,
      userName: otherUsers[0].name,
      type: 'Ride Share',
      title: 'ঢাকা থেকে চট্টগ্রাম রাইড শেয়ার',
      description: 'আমি এই সপ্তাহে শুক্রবার সকালে ঢাকা থেকে চট্টগ্রাম যাচ্ছি। আমার গাড়িতে ২ জন বসার জায়গা আছে। তেলের খরচ ভাগ করে নেওয়া হবে।',
      location: 'গুলশান ২, ঢাকা',
      from: 'গুলশান, ঢাকা',
      to: 'জিইসি মোড়, চট্টগ্রাম',
      dateTime: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
      createdAt: new Date().toISOString(),
      participants: [{ userId: otherUsers[0].id, userName: otherUsers[0].name }],
    },
    {
      userId: otherUsers[1].id,
      userName: otherUsers[1].name,
      type: 'Study',
      title: 'বিসিএস প্রস্তুতি গ্রুপ স্টাডি',
      description: 'আমরা কয়েকজন মিলে বিসিএস সাধারণ বিজ্ঞানের ওপর গ্রুপ স্টাডি করছি। যারা সিরিয়াসলি পড়তে চান তারা যোগ দিতে পারেন।',
      location: 'ঢাকা বিশ্ববিদ্যালয় লাইব্রেরি এলাকা',
      dateTime: new Date(Date.now() + 259200000).toISOString().slice(0, 16),
      createdAt: new Date().toISOString(),
      participants: [{ userId: otherUsers[1].id, userName: otherUsers[1].name }],
    },
    {
      userId: otherUsers[2].id,
      userName: otherUsers[2].name,
      type: 'Hangout',
      title: 'বইপ্রেমীদের আড্ডা',
      description: 'বিশ্বসাহিত্য কেন্দ্রে বসে বই নিয়ে আড্ডা হবে। আপনার প্রিয় বইটি নিয়ে চলে আসুন।',
      location: 'বিশ্বসাহিত্য কেন্দ্র, বাংলামোটর',
      dateTime: new Date(Date.now() + 345600000).toISOString().slice(0, 16),
      createdAt: new Date().toISOString(),
      participants: [{ userId: otherUsers[2].id, userName: otherUsers[2].name }],
    },
    {
      userId: otherUsers[3].id,
      userName: otherUsers[3].name,
      type: 'Event',
      title: 'সাপ্তাহিক সাইক্লিং ট্যুর',
      description: 'শনিবার ভোরে ৩০০ ফিট এলাকায় সাইক্লিং। যারা সাইক্লিং পছন্দ করেন তারা যোগ দিন।',
      location: 'কুড়িল বিশ্বরোড, ঢাকা',
      dateTime: new Date(Date.now() + 432000000).toISOString().slice(0, 16),
      createdAt: new Date().toISOString(),
      participants: [{ userId: otherUsers[3].id, userName: otherUsers[3].name }],
    },
    {
      userId: otherUsers[0].id,
      userName: otherUsers[0].name,
      type: 'Game',
      title: 'ফুটবল ম্যাচ - বনানী মাঠ',
      description: 'বনানী মাঠে ৫-এ-সাইড ফুটবল খেলার জন্য ২ জন খেলোয়াড় দরকার। সন্ধ্যা ৬টায় খেলা শুরু হবে।',
      location: 'বনানী সোসাইটি মাঠ, ঢাকা',
      dateTime: new Date(Date.now() + 518400000).toISOString().slice(0, 16),
      createdAt: new Date().toISOString(),
      participants: [{ userId: otherUsers[0].id, userName: otherUsers[0].name }],
      comments: [
        {
          id: 'c1',
          userId: 'user_2',
          userName: 'সাদিয়া ইসলাম',
          text: 'আমি আসতে পারি! আমার সাথে আরও একজন থাকতে পারে।',
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      userId: otherUsers[1].id,
      userName: otherUsers[1].name,
      type: 'Hangout',
      title: 'ফটোগ্রাফি ওয়াক - পুরান ঢাকা',
      description: 'পুরান ঢাকার অলিগলিতে ফটোগ্রাফি করার জন্য একটি ছোট গ্রুপ করছি। যারা ছবি তুলতে ভালোবাসেন তারা যোগ দিন।',
      location: 'আহসান মঞ্জিল এলাকা, ঢাকা',
      dateTime: new Date(Date.now() + 604800000).toISOString().slice(0, 16),
      createdAt: new Date().toISOString(),
      participants: [{ userId: otherUsers[1].id, userName: otherUsers[1].name }],
      comments: [
        {
          id: 'c2',
          userId: 'user_3',
          userName: 'তানভীর রহমান',
          text: 'দারুণ আইডিয়া! আমি আমার ডিএসএলআর নিয়ে আসব।',
          createdAt: new Date().toISOString()
        }
      ]
    }
  ];

  for (const plan of demoPlans) {
    try {
      await addDoc(plansRef, plan);
    } catch (error) {
      console.error('Error seeding plan:', error);
    }
  }
}

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp
};
export type { FirebaseUser };
