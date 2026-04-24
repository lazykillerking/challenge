# Credit Vault CTF

Frontend-only credit challenge.

- Any username/password logs in.
- New wallets start with 100 credits.
- The basic image is visible immediately.
- The premium image unlocks at 1000 credits.
- The intended weakness is the exposed client-side credit API in `script.js`.

For a real hosted challenge, move the premium flag check into Supabase with Row Level
Security or an Edge Function. Anything in frontend files can be read by players.
