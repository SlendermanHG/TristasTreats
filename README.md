# Tristas Treats Website

Express + SQLite site for:

- public gallery from the local `images/` folder
- public customer reviews with admin approval
- Facebook-photo-comment callouts from `data/facebook-comments.json`
- customer accounts only for order requests and questions
- owner-only inbox with per-customer threaded conversations
- on-page website assistant backed by the OpenAI Responses API

## Run locally

```powershell
npm install
npm start
```

Open `http://localhost:3000`

To enable the assistant, set:

```powershell
$env:OPENAI_API_KEY="sk-..."
$env:OPENAI_MODEL="gpt-5-mini"
npm start
```

## Owner login

Set these before starting:

```powershell
$env:ADMIN_EMAIL="you@example.com"
$env:ADMIN_PASSWORD="UseAStrongPassword"
$env:SESSION_SECRET="replace-this-too"
$env:APP_BASE_URL="http://localhost:3000"
npm start
```

## Optional Google / Facebook sign-in

The site keeps email/password login as a fallback, but you can also enable social login:

```powershell
$env:GOOGLE_CLIENT_ID="..."
$env:GOOGLE_CLIENT_SECRET="..."
$env:FACEBOOK_APP_ID="..."
$env:FACEBOOK_APP_SECRET="..."
$env:APP_BASE_URL="http://localhost:3000"
npm start
```

Use these callback URLs in your Google and Facebook app settings:

- Google: `http://localhost:3000/auth/google/callback`
- Facebook: `http://localhost:3000/auth/facebook/callback`

## Content files

- `images/`: gallery photos shown on the storefront
- `data/facebook-comments.json`: local comment/callout data tied to images
- `tristas-treats.db`: SQLite database created on first run
- `render.yaml`: starter Render deployment config
- `.env.example`: environment variable reference

## Notes

- Reviews do not require an account.
- Orders and questions do require an account.
- The owner inbox stays inside the app instead of forwarding threads into a mixed personal email inbox.
