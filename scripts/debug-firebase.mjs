
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

function cleanValue(val) {
  if (!val) return '';
  let s = val.trim();
  while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.substring(1, s.length - 1).trim();
  }
  return s;
}

async function debug() {
  let saJson = cleanValue(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log('Raw length:', saJson.length);
  
  if (saJson && !saJson.startsWith('{') && (saJson.length > 100)) {
    try {
      const decoded = Buffer.from(saJson, 'base64').toString('utf8');
      console.log('Decoded start:', decoded.substring(0, 50));
      if (decoded.trim().startsWith('{')) saJson = decoded.trim();
    } catch (e) {
      console.error('Base64 decode failed:', e);
    }
  }

  const parsed = JSON.parse(saJson);
  console.log('Project ID:', parsed.project_id);
  console.log('Client Email:', parsed.client_email);
  console.log('Private Key ID:', parsed.private_key_id);

  try {
    const app = initializeApp({
      credential: cert(parsed),
      projectId: parsed.project_id
    });
    console.log('App initialized successfully');
    
    const auth = getAuth(app);
    const token = await auth.createCustomToken('test-uid', { role: 'admin' });
    console.log('Custom token created successfully');
    console.log('Token snippet:', token.substring(0, 50));

    // Cleanup
    await app.delete();
  } catch (err) {
    console.error('Error during debug:', err);
  }
}

debug();
