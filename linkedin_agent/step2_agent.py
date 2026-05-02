"""
Priyansh's LinkedIn AI Agent
Auto-detects Gemini OR Anthropic API key from .env — no code changes needed!
"""

import requests
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# ── AUTO-DETECT WHICH API TO USE ─────────────────────────
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LINKEDIN_TOKEN      = os.getenv("LINKEDIN_ACCESS_TOKEN")
LINKEDIN_PERSON_URN = os.getenv("LINKEDIN_PERSON_URN")

def detect_provider():
    if ANTHROPIC_API_KEY and ANTHROPIC_API_KEY != "your_anthropic_api_key_here":
        return "anthropic"
    elif GEMINI_API_KEY and GEMINI_API_KEY != "your_new_gemini_api_key_here":
        return "gemini"
    else:
        return None

PROVIDER = detect_provider()

# ── MASTER SYSTEM PROMPT (shared across both APIs) ────────
SYSTEM_PROMPT = """
You are Priyansh's Personal LinkedIn AI Agent — a skilled technical writer,
marketing strategist, and job search specialist.

=== ABOUT PRIYANSH ===
Name: Priyansh Saxena | Role: DevOps & Platform Engineer
Company: Deutsche Telekom Digital Labs | Experience: 2+ years
Skills: Kubernetes, Istio, AWS, GCP, Terraform, CI/CD, VictoriaMetrics,
Grafana, MongoDB Operators, RabbitMQ, Docker, Jenkins, Python, Bash
Certs: RHCSA, Red Hat Ansible RH294, Red Hat Containers DO180, IBM Cloud
Key highlights: FIFA 2026 World Cup infra preparation, 3TB MongoDB zero-downtime
migration, Istio service mesh implementation, AWS migration of 42 enterprise apps

=== CONTENT RULES ===
- Write like a MARKETING STRATEGIST selling Priyansh's skills — not a resume bot
- Posts: Hook → Story (Problem/Action/Result) → Insight → CTA → Hashtags
- Hook must make people STOP SCROLLING in the first 2 lines
- Use real numbers, real tools, real outcomes — never fabricate anything
- Max 3-4 emojis, 5-7 hashtags, 150-250 words per post
- ALWAYS end every LinkedIn post with: — Posted by Priyansh's Personal AI Agent 🤖

=== JOB PREFERENCES ===
- Product-based companies ONLY — no IT services, no consulting firms
- Target: Hotstar, JP Morgan, Apple, Zscaler, Cloudflare, HashiCorp, Datadog,
  Grafana Labs, MongoDB Inc, Red Hat, Palo Alto Networks, Razorpay, CRED, PhonePe
- Roles: DevOps Engineer, Platform Engineer, SRE, Cloud Engineer
- Location: Remote/Hybrid preferred | Bangalore, Pune, Hyderabad, Delhi NCR
"""

# ── GEMINI API CALL ───────────────────────────────────────
def call_gemini(user_message):
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    )
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": user_message}]}],
        "generationConfig": {"temperature": 0.85, "maxOutputTokens": 1024}
    }
    r = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
    if r.status_code != 200:
        print(f"\n❌ Gemini Error [{r.status_code}]: {r.text}")
        return None
    try:
        return r.json()["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        print(f"\n❌ Unexpected Gemini response: {r.json()}")
        return None

# ── ANTHROPIC API CALL ────────────────────────────────────
def call_anthropic(user_message):
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 1024,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_message}]
    }
    r = requests.post(url, headers=headers, json=payload)
    if r.status_code != 200:
        print(f"\n❌ Anthropic Error [{r.status_code}]: {r.text}")
        return None
    try:
        return r.json()["content"][0]["text"]
    except (KeyError, IndexError):
        print(f"\n❌ Unexpected Anthropic response: {r.json()}")
        return None

# ── UNIFIED AI CALL (auto-routes to right provider) ───────
def ask_ai(user_message):
    if PROVIDER == "anthropic":
        return call_anthropic(user_message)
    elif PROVIDER == "gemini":
        return call_gemini(user_message)
    else:
        print("❌ No valid API key found. Check your .env file.")
        return None

# ── MODE PROMPTS ──────────────────────────────────────────
def content_prompt(activity):
    return f"""MODE: CONTENT
Convert this activity into a viral LinkedIn post.

Rules:
- Powerful hook — first 2 lines must stop scrolling
- Structure: Problem → What I did → How → Result
- Include real technical details (tools, numbers, outcomes)
- End with a key insight OR question for the community
- 5-7 hashtags, 150-250 words total
- Final line MUST be: — Posted by Priyansh's Personal AI Agent 🤖

Activity:
{activity}"""

def brand_prompt(event):
    return f"""MODE: BRAND
Create a thought-leadership LinkedIn post about this event or achievement.

Rules:
- Tell the STORY — don't just announce it
- Connect it to a bigger industry trend
- Highlight what made Priyansh's contribution unique
- End with a bold insight or thought-provoking question
- Format: Hook → Story → Insight → CTA → Hashtags
- Final line MUST be: — Posted by Priyansh's Personal AI Agent 🤖

Event/Achievement:
{event}"""

def job_prompt(jd):
    return f"""MODE: JOB HUNT
Analyze this Job Description and generate all 3 items:

1. COVER LETTER (3 paragraphs):
   - Para 1: Technical fit — match my skills directly to the JD requirements
   - Para 2: Culture/mission fit — why this company specifically
   - Para 3: Confident closing with a clear call to action

2. RESUME KEYWORDS:
   List the top 8 keywords from this JD that I should add to my resume

3. RECRUITER MESSAGE (LinkedIn DM, max 5 sentences):
   - Mention Deutsche Telekom + FIFA 2026 infra as credibility signal
   - Name the specific role I'm interested in
   - End with a low-friction ask (15-min call or referral request)
   - Tone: confident, direct, NOT copy-paste sounding

My profile: 2+ years DevOps/Platform Engineering at Deutsche Telekom Digital Labs.
Key work: FIFA 2026 World Cup infra, 3TB MongoDB migration, Istio service mesh.
RHCSA certified. Strong in AWS, GCP, Kubernetes, Terraform.

Job Description:
{jd}"""

# ── POST TO LINKEDIN ──────────────────────────────────────
def post_to_linkedin(text):
    if not LINKEDIN_TOKEN or not LINKEDIN_PERSON_URN:
        print("⚠️  LinkedIn not connected. Run step1_get_token.py first.")
        return
    headers = {
        "Authorization": f"Bearer {LINKEDIN_TOKEN}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    payload = {
        "author": LINKEDIN_PERSON_URN,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
    }
    r = requests.post("https://api.linkedin.com/v2/ugcPosts", headers=headers, json=payload)
    if r.status_code == 201:
        print(f"\n✅ Posted to LinkedIn! [{datetime.now().strftime('%Y-%m-%d %H:%M')}]")
    else:
        print(f"\n❌ Post failed [{r.status_code}]: {r.text}")

# ── HELPERS ───────────────────────────────────────────────
def get_multiline_input():
    print("(Press Enter twice when done)\n")
    lines = []
    while True:
        line = input()
        if line == "" and lines:
            break
        lines.append(line)
    return "\n".join(lines)

def run_mode(title, prompt_fn, can_post=True):
    print(f"\n{title}")
    print("-" * 45)
    user_input = get_multiline_input()
    model_label = "Claude Sonnet" if PROVIDER == "anthropic" else "Gemini 2.5 Flash"
    print(f"\n⏳ Generating with {model_label}...")
    result = ask_ai(prompt_fn(user_input))
    if not result:
        return
    print("\n" + "="*55)
    print(result)
    print("="*55)
    if can_post:
        if input("\n🚀 Post this to LinkedIn? (y/n): ").strip().lower() == "y":
            post_to_linkedin(result)
        else:
            print("📋 Not posted — copy it manually anytime.")
    else:
        print("\n💡 Copy the recruiter message and send it on LinkedIn!")

# ── STARTUP CHECKS ────────────────────────────────────────
def startup_checks():
    print("\n" + "="*55)
    print("  🤖  Priyansh's LinkedIn AI Agent")
    print("="*55)

    # API provider
    if PROVIDER == "anthropic":
        print("  🧠 AI Provider  : Anthropic Claude ✅")
    elif PROVIDER == "gemini":
        print("  🧠 AI Provider  : Google Gemini 2.5 Flash ✅")
    else:
        print("  ❌ AI Provider  : No valid API key found!")
        print("     Add GEMINI_API_KEY or ANTHROPIC_API_KEY to .env")
        exit(1)

    # LinkedIn
    if LINKEDIN_TOKEN and LINKEDIN_TOKEN != "":
        print("  🔗 LinkedIn     : Connected ✅")
    else:
        print("  ⚠️  LinkedIn     : Not connected (run step1_get_token.py)")

    print("="*55)

# ── MAIN MENU ─────────────────────────────────────────────
if __name__ == "__main__":
    startup_checks()

    while True:
        provider_label = "Claude" if PROVIDER == "anthropic" else "Gemini"
        print(f"\n  Powered by: {provider_label}  |  What do you want to do?")
        print("  1️⃣   Content Mode  — Today's work → LinkedIn post")
        print("  2️⃣   Brand Mode    — Events/Hackathons → Brand post")
        print("  3️⃣   Job Hunt Mode — Paste JD → Cover letter + recruiter DM")
        print("  4️⃣   Exit")
        print("-"*45)
        choice = input("  Choose (1-4): ").strip()

        if choice == "1":
            run_mode("📝 CONTENT MODE — Tell me what you did today:", content_prompt)
        elif choice == "2":
            run_mode("📢 BRAND MODE — Describe the event or achievement:", brand_prompt)
        elif choice == "3":
            run_mode("🎯 JOB HUNT MODE — Paste the Job Description:", job_prompt, can_post=False)
        elif choice == "4":
            print("\n👋 Shutting down. Keep building, Priyansh! 🚀\n")
            break
        else:
            print("  ❌ Invalid choice. Pick 1-4.")
