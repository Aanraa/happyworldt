const admin = require('firebase-admin');

function getServiceAccount() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountJson) {
    return JSON.parse(serviceAccountJson);
  }

  if (serviceAccountPath) {
    return require(require('path').resolve(serviceAccountPath));
  }

  throw new Error(
    'Missing Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH to a valid service account JSON.',
  );
}

async function main() {
  admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
  });

  const db = admin.firestore();
  const snapshot = await db.collection('tours').get();

  const updates = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.active !== true) {
      updates.push(doc.ref.update({ active: true }));
    }
  });

  await Promise.all(updates);

  console.log(`Updated ${updates.length} tour documents to include active: true.`);
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
