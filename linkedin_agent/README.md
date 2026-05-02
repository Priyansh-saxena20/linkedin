# 🤖 Priyansh's LinkedIn AI Agent

A personal LinkedIn agent powered by Claude API that generates viral posts,
hunts jobs at top product-based companies, and builds your personal brand.

---

## 📁 Project Structure

```
linkedin_agent/
├── step1_get_token.py   ← Run ONCE to connect your LinkedIn account
├── step2_agent.py       ← Run DAILY to use your agent
├── requirements.txt     ← Python dependencies
├── .env                 ← Your secret keys (never share this!)
└── .env.example         ← Template for .env
```

---

## ⚡ Setup (One Time Only)

### 1. Clone / download this folder to your laptop

### 2. Create your .env file
```bash
cp .env.example .env
```
Then open `.env` and fill in:
- `ANTHROPIC_API_KEY` → from console.anthropic.com
- `LINKEDIN_CLIENT_ID` → 8686ysfd1dxz4r (already filled)
- `LINKEDIN_CLIENT_SECRET` → from your LinkedIn Developer app → Auth tab

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Get your LinkedIn access token (run once)
```bash
python step1_get_token.py
```
- This opens your browser
- Log in with YOUR LinkedIn account (priyansh.saxena20@gmail.com)
- Token is saved automatically to .env
- Valid for 2 months — re-run when expired

---

## 🚀 Daily Usage

```bash
python step2_agent.py
```

You'll see a menu:
```
1️⃣  Content Mode  — Turn today's work into a LinkedIn post
2️⃣  Brand Mode    — Post about events/hackathons/achievements  
3️⃣  Job Hunt Mode — Paste a JD → get cover letter + recruiter message
4️⃣  Exit
```

---

## 💡 Usage Tips

**Content Mode** — Just talk naturally:
> "Today I was working on the Kubernetes cluster upgrade at DT. We had to do pre-checks,
> validate workload readiness, and execute the upgrade with zero downtime."

**Brand Mode** — Describe the event:
> "I participated in DT's Cost Smash hackathon where I presented 3 ideas to reduce
> infrastructure costs. One idea was about spot instance optimization."

**Job Hunt Mode** — Paste any JD from LinkedIn/Naukri/company website

---

## 🔑 Getting Your Anthropic API Key

1. Go to console.anthropic.com
2. Sign up / Log in
3. Go to API Keys → Create Key
4. Copy and paste into .env

---

## ⚠️ Important Notes

- Never commit `.env` to GitHub (add it to `.gitignore`)
- Token expires every 2 months — re-run `step1_get_token.py`
- Always review generated posts before confirming to post
- LinkedIn API rate limit: ~100 posts/day (you'll never hit this)
