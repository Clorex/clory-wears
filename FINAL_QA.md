# CLORY WEARS — Final QA Checklist (Production)

This checklist ensures the website feels luxury-first, works end-to-end, and that payment details appear ONLY inside Checkout.

---

## 1) Luxury-first copy sweep (must pass)
On the live site, confirm these pages do NOT mention:
- “pay via transfer”
- “upload receipt”
- “I have made payment”
- account number / bank name

Pages that should be **clean**:
- Home (/)
- Shop (/shop)
- Product details (/product/...)
- Category pages (/trousers, /shirts)
- Cart (/cart)
- Footer (all pages)
- Terms (/terms)
- Contact (/contact)
- Account (/account)

✅ ONLY Checkout (/checkout) should contain payment instructions + receipt upload.

Quick search (in VS Code):
- Search for: `OPay`, `8059086041`, `receipt`, `made payment`, `transfer`
- Ensure results only exist in Checkout + backend emails (optional).

---

## 2) Core store flow (must pass)
### A) Product browsing
- Open /shop
- Search and filter works
- View details opens product page
- Choose size + color
- Add to cart

### B) Cart
- Change quantity up/down
- Remove item
- Clear cart
- Proceed to checkout button works

### C) Checkout (the only payment page)
- Delivery details submit creates an order
- Payment details are visible ONLY here
- Upload receipt works
- Submit confirmation works (no crashes)
- After confirmation, cart clears (for new orders)

### D) Account (no payment steps here)
- Order list loads
- “Continue in Checkout” opens: `/checkout?order=<id>`
- Receipt can be viewed (if available)
- No receipt upload actions shown here

---

## 3) Admin flow (must pass)
- Login with admin email
- /admin loads
- Orders list shows
- Receipt link opens
- Mark paid / reject / shipped / delivered works

---

## 4) Email notifications (must pass)
### A) “I have made payment” confirmation email
- After submitting confirmation on Checkout, you receive an email at:
  - itabitamiracle090@gmail.com

### B) Contact form email
- Contact form sends to your email
- Reply-to is the customer email

---

## 5) Supabase/Resend production settings (must pass)
### A) Vercel Environment Variables (required)
In Vercel Project → Settings → Environment Variables, confirm these exist (Production):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_ADMIN_EMAILS
- ADMIN_NOTIFY_EMAIL
- RESEND_API_KEY
- RESEND_FROM

After changes, redeploy.

### B) Supabase Auth URLs
Supabase → Authentication → URL Configuration:
- Site URL = your production domain
- Redirect URLs include:
  - https://your-domain/**

---

## 6) Mobile UX (must pass)
- Mobile nav dropdown looks styled (not plain default)
- Typography is not overly bold
- Spacing is breathable (no jam-packed sections)
- Buttons are readable and not shouting
- Product cards look premium

---

## 7) Performance sanity check
- Home loads quickly
- Images load without Next.js “unconfigured host” errors
- No red errors in browser console

---

## 8) If something breaks
1) Check Vercel Deployment Logs (Build + Runtime logs)
2) Check Supabase logs if DB/storage issues
3) Check DevTools Network tab for failing API calls
4) Verify env vars are set correctly and redeploy