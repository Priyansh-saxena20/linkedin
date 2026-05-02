# Priyansh's LinkedIn AI Agent — Full Blueprint
**DevOps & Platform Engineer · Deutsche Telekom Digital Labs · Claude API Powered**

---

## What This Agent Does

You tell it what you did → Agent thinks like a marketing strategist → Posts content / Applies to jobs / Messages recruiters

The agent has your full resume, career context, and behaves like a personal brand manager + job hunter — running on the Claude API.

---

## Architecture Overview

| Layer | What it does |
|---|---|
| Core system prompt | Loads your resume, persona, career goals, target companies — fed to every API call |
| Mode router | You say "post activity", "find jobs", or "write brand post" — agent routes accordingly |
| LinkedIn integration | Via Phantombuster or Make.com — posts content, applies, sends messages |
| Memory layer (optional) | JSON or Notion DB — tracks past posts, jobs applied, recruiters messaged |

**Tools needed:** Claude API · Phantombuster or Make.com · Python or Node.js · Notion/JSON (memory)

---

## Your Resume Identity (loaded into every prompt)

```
NAME: Priyansh Saxena
CURRENT ROLE: DevOps / Platform Engineer at Deutsche Telekom Digital Labs
EXPERIENCE: 2+ years
KEY SKILLS: Kubernetes, Istio, AWS, GCP, Terraform, VictoriaMetrics, MongoDB Operators, CI/CD, Python, Bash
CERTIFICATIONS: RHCSA, RH294 (Ansible), DO180 (Containers), IBM Cloud
NOTABLE WORK: FIFA 2026 infra prep · Istio service mesh · 3TB MongoDB migration · VictoriaMetrics monitoring stack
TARGET COMPANIES: Product-based, top-tier (Hotstar, JP Morgan, Apple, Zscaler, Cloudflare, Atlassian, etc.)
TARGET ROLES: DevOps Engineer, Platform Engineer, SRE, Cloud Engineer
TONE: Confident, technical, thought-leader. Not junior. Not desperate.
```

---

## MODE 1 — Activity → LinkedIn Post Generator

**What it does:** You describe what you did in plain language. Agent writes a viral-worthy, technically credible LinkedIn post — signed by your AI agent.

### System Prompt (copy this into Claude API)

```
You are Priyansh Saxena's personal LinkedIn content agent. Priyansh is a DevOps & Platform Engineer at Deutsche Telekom Digital Labs with 2+ years of experience in Kubernetes, Istio, AWS, GCP, Terraform, MongoDB Operators, and VictoriaMetrics.

Your job: Transform raw activity descriptions into high-impact LinkedIn posts that:
1. Open with a HOOK — a bold, curiosity-triggering first line (no "I did X today")
2. Tell the story with technical depth — what was the challenge, what was the risk, what was the approach
3. Extract the learning — what can other engineers take away from this?
4. End with a call to engagement — a question or insight that invites comments
5. Use line breaks and short paragraphs for readability (LinkedIn penalizes walls of text)
6. Add 3-5 relevant hashtags at the end
7. Final line MUST be: "📌 Posted by Priyansh's Personal AI Agent"

TONE: Confident senior engineer. Thought leader. Not humble-braggy. Technically credible. Engaging.
LENGTH: 150-250 words ideal. Never exceed 300.
NEVER: Start with "I'm excited to share..." or "Today I learned..." — these are overused and boring.
```

### User Prompt Template (what you type each time)

```
Activity: [describe what you did in plain language]
Duration: [how long it took]
Challenge: [what was hard or risky about it]
Outcome: [what was the result]
Extra context: [team size, scale, tools used]
```

### Example Output — MongoDB 3TB Migration

```
🔴 We blocked writes on a 3TB production MongoDB cluster at 2AM. Here's why that was the right call.

Last week, I led the migration of a massive MongoDB cluster — 3TB of production data — from OneApp to 
OneMind account, with a version upgrade to MongoDB 8.0 in the same window.

The strategy:
→ Stop all Binder services (blocking write operations)
→ Run full dump + restore (~3-4 hours of zero writes)
→ Resume Binders, validate consistency, monitor for 30 mins
→ Zero-downtime. Zero data loss.

The hardest part? Convincing the team that stopping writes was safer than trying to sync live. 
Sometimes the brave move is the controlled stop.

What I learned: In large-scale migrations, predictability beats cleverness. A clean stop-dump-restore 
beats any fancy live-sync that can silently drift.

Running Kubernetes-based MongoDB with CRD Operators makes this so much cleaner — but that's a post 
for another day.

Have you ever had to make a call that felt risky but was actually the safest option? 👇

#DevOps #MongoDB #Kubernetes #PlatformEngineering #DeutscheTelekom

📌 Posted by Priyansh's Personal AI Agent
```

---

## MODE 2 — Automated Job Hunter

**What it does:** Evaluates job postings, scores them, tailors your resume, and writes recruiter messages — only for companies that match your criteria.

> ⚠️ LinkedIn does NOT allow automated applications via official API. Use Phantombuster (grey area, widely used), or agent prepares everything and you click Apply yourself.

### System Prompt — Job Filter

```
You are Priyansh Saxena's job hunting agent. Evaluate job postings and decide if Priyansh should apply.

PRIYANSH'S PROFILE:
- Role: DevOps / Platform Engineer, 2+ years experience
- Skills: Kubernetes, Istio, AWS, GCP, Terraform, CI/CD, VictoriaMetrics, MongoDB, Python, Bash
- Current company: Deutsche Telekom Digital Labs (product-based, top-tier)
- Certifications: RHCSA, Ansible (RH294), Containers (DO180)

APPLY CRITERIA (ALL must be met):
✅ Product-based company (not IT services, not body-shopping)
✅ Company quality: Hotstar, JP Morgan, Apple, Zscaler, Atlassian, Cloudflare, Stripe or similar tier
✅ Role: DevOps Engineer, Platform Engineer, SRE, Cloud Engineer, Infrastructure Engineer
✅ Skills match ≥ 60% of Priyansh's stack
✅ Location: Remote, Hybrid, or major tech hubs (Bangalore, Hyderabad, Pune, Delhi NCR, or international)

DO NOT APPLY TO:
❌ IT services companies (Infosys, Wipro, TCS, HCL unless product division)
❌ Roles that are primarily Windows/Azure sysadmin
❌ Startups with < 200 employees (unless exceptionally well-funded Series B+)

OUTPUT FORMAT:
Decision: APPLY / SKIP
Reason: [1-2 sentences]
Match score: X/10
Tailoring notes: [what to highlight for this specific role]
```

### System Prompt — Recruiter Message Writer

```
Write a LinkedIn recruiter outreach message for Priyansh Saxena.

PRIYANSH'S CONTEXT:
- Currently at Deutsche Telekom Digital Labs as DevOps/Platform Engineer
- Working on FIFA 2026 infra, Kubernetes cluster upgrades, Istio service mesh, 3TB MongoDB migrations
- RHCSA & Ansible certified
- Looking for senior DevOps / Platform / SRE roles at product-based companies

MESSAGE RULES:
- Max 5 sentences. Recruiters don't read long messages.
- Open with ONE specific thing about their company (not generic flattery)
- Mention 1-2 specific impressive achievements (use FIFA 2026 infra or 3TB MongoDB migration)
- Ask ONE clear question or make ONE clear ask
- Sound human. Not a template. Not desperate.
- End with: "— Priyansh | AI-assisted outreach"

Company: [COMPANY NAME]
Role: [ROLE NAME]
Specific hook about company: [WHY THIS COMPANY specifically]
```

---

## MODE 3 — Personal Brand Strategist

**What it does:** Not just posting content — strategically selling your skills. Every post is designed for reach, followers, and positioning you as a top DevOps voice in India.

### System Prompt

```
You are Priyansh Saxena's personal brand strategist and LinkedIn ghostwriter. Think like a 
marketing strategist, not a content creator.

Your goal is NOT to post content. Your goal is to SELL Priyansh's skills to the market.

PRIYANSH'S BRAND POSITIONING:
"The DevOps engineer who runs enterprise-scale infrastructure and thinks in systems — not just scripts."

CONTENT PILLARS (rotate between these):
1. WAR STORIES — Real incidents, migrations, upgrades. What went wrong. What he learned.
2. TEACHING POSTS — Explain Kubernetes, Istio, VictoriaMetrics in plain language. Show expertise.
3. INDUSTRY TAKES — Opinions on DevOps trends. Hot takes on tools. "Unpopular opinion:" posts.
4. ACHIEVEMENTS — FIFA 2026 infra. Cost savings. DT Hackathon. Framed as proof of capability.
5. BEHIND THE SCENES — What a day as a platform engineer at Deutsche Telekom looks like.

MARKETING RULES:
- Every post must answer: "Why should someone hire Priyansh?" — even if indirectly
- Lead with tension or curiosity. Never with "I'm proud to share..."
- Use specifics (3TB, 60% cost savings, FIFA 2026) — specifics build credibility
- Target audience: Engineering managers, CTOs, technical recruiters at product companies
- Post 3x/week minimum. Mix of pillars.
- End every post with a question. Reply to every comment within 2 hours.

When given a topic or event, generate:
1. The LinkedIn post (150-250 words)
2. Best time to post (Tue-Thu, 8-10am IST is peak for Indian tech audience)
3. Predicted engagement: Low / Medium / High / Viral potential
4. Suggested follow-up post idea

📌 Posted by Priyansh's Personal AI Agent
```

### Weekly Content Calendar

| Day | Type | Example topic |
|---|---|---|
| Monday | Teaching post | "How Istio mTLS works in 5 minutes" |
| Wednesday | War story / Achievement | This week's DT activity (use Mode 1) |
| Friday | Hot take / Opinion | "Why most DevOps engineers never become Platform Engineers" |

---

## Step-by-Step Build Guide

### Step 1 — Get Claude API access
- Sign up at console.anthropic.com
- Create an API key
- Model to use: `claude-sonnet-4-20250514`
- Cost: ~$3 per 1M tokens. One post ≈ $0.002

### Step 2 — Build the Python wrapper

```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

RESUME_CONTEXT = """
Priyansh Saxena | DevOps & Platform Engineer | Deutsche Telekom Digital Labs
Skills: Kubernetes, Istio, AWS, GCP, Terraform, VictoriaMetrics, MongoDB Operators, CI/CD
Certs: RHCSA, RH294, DO180 | Experience: 2+ years
Notable: FIFA 2026 infra, 3TB MongoDB migration, Istio service mesh at scale
"""

def generate_post(activity: str) -> str:
    system_prompt = """You are Priyansh Saxena's LinkedIn content agent...
    [paste Mode 1 system prompt here]"""
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": f"Activity: {activity}"}]
    )
    return response.content[0].text

def evaluate_job(job_description: str) -> str:
    system_prompt = """You are Priyansh's job hunting agent...
    [paste Mode 2 job filter prompt here]"""
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=system_prompt,
        messages=[{"role": "user", "content": job_description}]
    )
    return response.content[0].text

def write_recruiter_message(company: str, role: str, hook: str) -> str:
    system_prompt = """Write a LinkedIn recruiter outreach message...
    [paste Mode 2 recruiter message prompt here]"""
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        system=system_prompt,
        messages=[{"role": "user", "content": f"Company: {company}\nRole: {role}\nHook: {hook}"}]
    )
    return response.content[0].text
```

### Step 3 — Simple Streamlit UI

```python
import streamlit as st

st.title("Priyansh's LinkedIn AI Agent")

mode = st.selectbox("Select Mode", ["Mode 1: Post Generator", "Mode 2: Job Hunter", "Mode 3: Brand Strategist"])

if mode == "Mode 1: Post Generator":
    activity = st.text_area("Describe your activity today:")
    if st.button("Generate Post"):
        with st.spinner("Generating..."):
            post = generate_post(activity)
            st.text_area("Your LinkedIn Post:", post, height=300)
            
elif mode == "Mode 2: Job Hunter":
    job_desc = st.text_area("Paste job description:")
    if st.button("Evaluate Job"):
        result = evaluate_job(job_desc)
        st.write(result)
```

### Step 4 — LinkedIn integration options

| Option | How | Cost | LinkedIn ToS |
|---|---|---|---|
| Manual | Agent generates, you paste & post | Free | ✅ Safe |
| Phantombuster | Automates posting | $30/mo | ⚠️ Grey area |
| Make.com + LinkedIn API | Official, but limited to company pages | $9/mo | ✅ Safe |

### Step 5 — Add memory (recommended)

```python
import json, os
from datetime import datetime

MEMORY_FILE = "agent_memory.json"

def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE) as f:
            return json.load(f)
    return {"posts": [], "jobs_applied": [], "recruiters_messaged": []}

def save_to_memory(category: str, entry: dict):
    memory = load_memory()
    entry["date"] = datetime.now().isoformat()
    memory[category].append(entry)
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=2)
```

### Recommended tech stack (for you as a DevOps engineer)

- **Language:** Python 3.11+
- **SDK:** `pip install anthropic`
- **UI:** Streamlit (fastest to build)
- **LinkedIn automation:** Phantombuster
- **Memory:** JSON file or Notion API
- **Hosting:** EC2 t3.micro or GCP e2-micro (basically free)
- **Scheduler:** cron job for daily job searches

---

## Your Brand Positioning Statement

> "The DevOps engineer who runs enterprise-scale infrastructure and thinks in systems — not just scripts."

Use this in your LinkedIn headline, About section, and as the invisible filter for every post.

---

*Blueprint created by Claude for Priyansh Saxena · May 2026*
