# Happy World Tour — Next.js + Firebase

A responsive travel website starter with Firebase Auth, Google login, Firestore, Storage, user bookings, and an admin CMS.

## Requirements

- Node.js 20+ recommended
- pnpm
- A Firebase project

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the Firebase Web App config from Firebase Console.
3. Enable Authentication providers: Email/Password and Google.
4. Create Firestore Database and Storage.
5. Deploy `firestore.rules` and `storage.rules`.
6. Run `pnpm install` then `pnpm dev`.

## Admin

The bootstrap admin email is `casalablanca11@gmail.com`. Firebase rules require this account to be email-verified. The admin UI also accepts users listed in the `admins/{uid}` collection with `active: true` and `role: "admin"`.

After the first verified login with the bootstrap email, create `admins/{UID}` if you want the account represented explicitly in Firestore. Do not put passwords or Firebase service-account JSON files in this project.

## Security notes

- No Firebase secrets or service-account credentials are included.
- `.env.local` is gitignored.
- Public users can read tours and published articles only.
- Only verified users can create bookings, and only their own bookings are readable by them.
- Admin writes are restricted by Firestore rules.
- Storage uploads are restricted to authenticated admin users, image content types, and 10 MB per file.
- Contact messages can be submitted publicly but can only be read/changed by admins.
- Firebase client API keys are not treated as passwords; Firestore/Storage rules are the access-control boundary.

## Production checklist

- Add App Check in Firebase Console.
- Use a custom domain and HTTPS.
- Keep `.env.local` out of Git.
- Review Firestore/Storage rules before launch.
- Add a privacy policy and terms page.
- Consider Cloud Functions/server-side validation for high-value booking/payment workflows.

### Admin bootstrap detail

For `casalablanca11@gmail.com`, Google Sign-In is the easiest admin path because Google accounts are normally email-verified. If using email/password for that admin account, complete Firebase's email verification first; the Firestore rules require the bootstrap admin email to be verified.
