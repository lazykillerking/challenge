# Credit Vault CTF

Frontend-only credit challenge.

- Any username/password logs in.
- New wallets start with 100 credits.
- Login redirects to `market.html`.
- Players can buy and sell a 100-credit image and a 1000-credit premium image.
- The premium image reveals the flag after it is bought.
- The intended weakness is the sell logic in `market.js`.

For a real hosted challenge, move the premium flag check into Supabase with Row Level
Security or an Edge Function. Anything in frontend files can be read by players.
