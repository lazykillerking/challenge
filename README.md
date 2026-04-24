# Credit Vault CTF

Frontend-only credit challenge.

- Any username/password logs in.
- New wallets start with 100 credits.
- Login redirects to `market.html`.
- Players can buy and sell a 100-credit image and a 1000-credit premium image.
- The premium image reveals the final link after it is bought.
- The intended weakness is a 1 ms post-buy settlement bug in `market.js`.

For a real hosted challenge, move the premium prize check into Supabase with Row Level
Security or an Edge Function. Anything in frontend files can be read by players.
