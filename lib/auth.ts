import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
const ADMIN_EMAILS = ['casalablanca11@gmail.com', 'hwt191204@gmail.com'];
export async function isAdmin(uid: string, email?: string | null, verified = false) {
  if (verified && email && ADMIN_EMAILS.includes(email.toLowerCase())) return true;
  const s = await getDoc(doc(db, 'admins', uid));
  return s.exists() && s.data()?.active === true && s.data()?.role === 'admin';
}
