import {doc,getDoc} from 'firebase/firestore'; import {db} from './firebase';
const ADMIN_EMAIL='casalablanca11@gmail.com';
export async function isAdmin(uid:string,email?:string|null,verified=false){ if(verified && email?.toLowerCase()===ADMIN_EMAIL) return true; const s=await getDoc(doc(db,'admins',uid)); return s.exists() && s.data()?.active===true && s.data()?.role==='admin'; }
