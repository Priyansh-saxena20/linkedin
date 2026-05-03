from fastapi import FastAPI, HTTPException, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import json
import mimetypes
import requests
import os
import secrets
import time
import urllib.parse
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional

load_dotenv()

app = FastAPI(title="Priyansh LinkedIn Agent API", version="1.0.0")

_default_origins = "http://localhost:3000,http://frontend:3000"
_cors = os.getenv("CORS_ORIGINS", _default_origins).strip()
allow_origins = [o.strip() for o in _cors.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ENV ──────────────────────────────────────────────────
GEMINI_API_KEY      = os.getenv("GEMINI_API_KEY", "")
ANTHROPIC_API_KEY   = os.getenv("ANTHROPIC_API_KEY", "")
LINKEDIN_TOKEN      = os.getenv("LINKEDIN_ACCESS_TOKEN", "") or ""
LINKEDIN_PERSON_URN = os.getenv("LINKEDIN_PERSON_URN", "") or ""

LINKEDIN_CLIENT_ID     = os.getenv("LINKEDIN_CLIENT_ID", "") or ""
LINKEDIN_CLIENT_SECRET   = os.getenv("LINKEDIN_CLIENT_SECRET", "") or ""
LINKEDIN_REDIRECT_URI    = os.getenv(
    "LINKEDIN_REDIRECT_URI",
    "http://localhost:8000/api/linkedin/callback",
)
LINKEDIN_OAUTH_SUCCESS_URL = os.getenv(
    "LINKEDIN_OAUTH_SUCCESS_URL",
    "http://localhost:3000/?linkedin=connected",
)
LINKEDIN_OAUTH_ERROR_URL = os.getenv(
    "LINKEDIN_OAUTH_ERROR_URL",
    "http://localhost:3000/?linkedin_error=1",
)

LINKEDIN_OAUTH_SCOPES = "openid profile w_member_social"
OAUTH_STATE_TTL_SEC = 600
oauth_states: dict[str, float] = {}


def _token_file_path() -> str:
    custom = os.getenv("LINKEDIN_TOKEN_FILE", "").strip()
    if custom:
        return custom
    data_dir = os.getenv("DATA_DIR", ".").strip() or "."
    return os.path.join(data_dir, "linkedin_tokens.json")


def load_persisted_tokens() -> None:
    """Override env token/URN from disk if present (written after UI OAuth)."""
    global LINKEDIN_TOKEN, LINKEDIN_PERSON_URN
    path = _token_file_path()
    if not os.path.isfile(path):
        return
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        if data.get("access_token"):
            LINKEDIN_TOKEN = data["access_token"]
        if data.get("person_urn"):
            LINKEDIN_PERSON_URN = data["person_urn"]
    except (OSError, json.JSONDecodeError, TypeError):
        pass


def linkedin_fully_connected() -> bool:
    return bool(LINKEDIN_TOKEN and LINKEDIN_PERSON_URN)


def linkedin_oauth_ready() -> bool:
    if not LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_ID in ("your_client_id_here",):
        return False
    if not LINKEDIN_CLIENT_SECRET or LINKEDIN_CLIENT_SECRET in (
        "",
        "your_linkedin_client_secret_here",
    ):
        return False
    return True


def _prune_oauth_states() -> None:
    now = time.time()
    for key, exp in list(oauth_states.items()):
        if exp < now:
            oauth_states.pop(key, None)


def _new_oauth_state() -> str:
    _prune_oauth_states()
    state = secrets.token_urlsafe(24)
    oauth_states[state] = time.time() + OAUTH_STATE_TTL_SEC
    return state


def _consume_oauth_state(state: str) -> bool:
    _prune_oauth_states()
    exp = oauth_states.pop(state, None)
    if exp is None or time.time() > exp:
        return False
    return True


def _linkedin_authorize_url(state: str) -> str:
    params = {
        "response_type": "code",
        "client_id": LINKEDIN_CLIENT_ID,
        "redirect_uri": LINKEDIN_REDIRECT_URI,
        "scope": LINKEDIN_OAUTH_SCOPES,
        "state": state,
    }
    return "https://www.linkedin.com/oauth/v2/authorization?" + urllib.parse.urlencode(
        params
    )


def _exchange_code_for_token(code: str) -> dict:
    r = requests.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": LINKEDIN_CLIENT_ID,
            "client_secret": LINKEDIN_CLIENT_SECRET,
            "redirect_uri": LINKEDIN_REDIRECT_URI,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=60,
    )
    return r.json()


def _fetch_person_urn(access_token: str) -> str:
    r = requests.get(
        "https://api.linkedin.com/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=30,
    )
    data = r.json()
    sub = data.get("sub")
    if not sub:
        raise ValueError("LinkedIn userinfo missing sub")
    return f"urn:li:person:{sub}"


def persist_linkedin_session(access_token: str, person_urn: str) -> None:
    global LINKEDIN_TOKEN, LINKEDIN_PERSON_URN
    LINKEDIN_TOKEN = access_token
    LINKEDIN_PERSON_URN = person_urn
    path = _token_file_path()
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"access_token": access_token, "person_urn": person_urn}, f)


load_persisted_tokens()

# ── SYSTEM PROMPT ─────────────────────────────────────────
SYSTEM_PROMPT = """
You are Priyansh's Personal LinkedIn AI Agent — a skilled technical writer,
marketing strategist, and job search specialist.

=== ABOUT PRIYANSH ===
Name: Priyansh Saxena | Role: DevOps & Platform Engineer
Company: Deutsche Telekom Digital Labs | Experience: 2+ years
Skills: Kubernetes, Istio, AWS, GCP, Terraform, CI/CD, VictoriaMetrics,
Grafana, MongoDB Operators, RabbitMQ, Docker, Jenkins, Python, Bash
Certs: RHCSA, Red Hat Ansible RH294, Red Hat Containers DO180, IBM Cloud
Key highlights: FIFA 2026 World Cup infra, 3TB MongoDB zero-downtime migration,
Istio service mesh implementation, AWS migration of 42 enterprise apps

=== CONTENT RULES ===
- Write like a MARKETING STRATEGIST selling Priyansh's skills — not a resume bot
- Posts: Hook → Story (Problem/Action/Result) → Insight → CTA → Hashtags
- Hook must make people STOP SCROLLING in the first 2 lines
- Real numbers, real tools, real outcomes — never fabricate anything
- Max 3-4 emojis, 5-7 hashtags, 150-250 words per post
- ALWAYS end every LinkedIn post with: — Posted by Priyansh's Personal AI Agent 🤖

=== JOB PREFERENCES ===
- Product-based companies ONLY — no IT services, no consulting firms
- Target: Hotstar, JP Morgan, Apple, Zscaler, Cloudflare, HashiCorp, Datadog,
  Grafana Labs, MongoDB Inc, Red Hat, Palo Alto Networks, Razorpay, CRED, PhonePe
- Roles: DevOps Engineer, Platform Engineer, SRE, Cloud Engineer
- Location: Remote/Hybrid preferred | Bangalore, Pune, Hyderabad, Delhi NCR
"""

# ── PROVIDER DETECTION ────────────────────────────────────
def get_provider():
    if ANTHROPIC_API_KEY and ANTHROPIC_API_KEY not in ("", "your_anthropic_api_key_here"):
        return "anthropic"
    elif GEMINI_API_KEY and GEMINI_API_KEY not in (
        "",
        "your_new_gemini_api_key_here",
        "your_gemini_api_key_here",
    ):
        return "gemini"
    return None

# ── AI CALLS ──────────────────────────────────────────────
def call_gemini(prompt: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.85, "maxOutputTokens": 4096}
    }
    r = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Gemini error: {r.text}")
    data = r.json()
    cand = data["candidates"][0]
    parts = cand.get("content", {}).get("parts") or []
    if not parts or "text" not in parts[0]:
        raise HTTPException(status_code=502, detail="Gemini returned no text")
    text = parts[0]["text"]
    finish = str(cand.get("finishReason", "") or "")
    if finish == "MAX_TOKENS":
        text += (
            "\n\n—\n⚠️ Output hit the model length limit (response may be truncated). "
            "Try a shorter activity description or regenerate."
        )
    return text

def call_anthropic(prompt: str) -> str:
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 4096,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": prompt}]
    }
    r = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Anthropic error: {r.text}")
    body = r.json()
    text = body["content"][0]["text"]
    if body.get("stop_reason") == "max_tokens":
        text += (
            "\n\n—\n⚠️ Output hit max_tokens (response may be truncated). "
            "Try a shorter prompt or regenerate."
        )
    return text

def ask_ai(prompt: str) -> str:
    provider = get_provider()
    if provider == "anthropic":
        return call_anthropic(prompt)
    elif provider == "gemini":
        return call_gemini(prompt)
    raise HTTPException(status_code=500, detail="No valid AI API key configured in .env")

# ── SCHEMAS ───────────────────────────────────────────────
class GenerateRequest(BaseModel):
    mode: str  # "content" | "brand" | "job"
    input: str

class PostRequest(BaseModel):
    text: str


class RefineRequest(BaseModel):
    current_text: str
    instruction: str


# ── PROMPT BUILDERS ───────────────────────────────────────
def build_prompt(mode: str, user_input: str) -> str:
    if mode == "content":
        return f"""MODE: CONTENT
Convert this activity into a viral LinkedIn post.
Rules:
- Powerful hook — first 2 lines must stop scrolling
- Structure: Problem → What I did → How → Result
- Include real technical details (tools, numbers, outcomes)
- End with a key insight OR question for the community
- 5-7 hashtags, 150-250 words total (stay concise; do not exceed ~280 words)
- Final line MUST be: — Posted by Priyansh's Personal AI Agent 🤖

Activity:
{user_input}"""

    elif mode == "brand":
        return f"""MODE: BRAND
Create a thought-leadership LinkedIn post about this event or achievement.
Rules:
- Tell the STORY — don't just announce it
- Connect it to a bigger industry trend
- Highlight what made Priyansh's contribution unique
- End with a bold insight or thought-provoking question
- Format: Hook → Story → Insight → CTA → Hashtags
- 150-260 words; stay concise (avoid exceeding ~280 words)
- Final line MUST be: — Posted by Priyansh's Personal AI Agent 🤖

Event/Achievement:
{user_input}"""

    elif mode == "job":
        return f"""MODE: JOB HUNT
Analyze this Job Description and generate all 3 items:

1. COVER LETTER (3 paragraphs):
   - Para 1: Technical fit — match my skills directly to the JD
   - Para 2: Culture/mission fit — why this company specifically
   - Para 3: Confident closing with a clear call to action

2. RESUME KEYWORDS:
   List the top 8 keywords from this JD I should add to my resume

3. RECRUITER MESSAGE (LinkedIn DM, max 5 sentences):
   - Mention Deutsche Telekom + FIFA 2026 infra as credibility signal
   - Name the specific role
   - End with a low-friction ask (15-min call or referral)
   - Confident, direct, not copy-paste sounding

My profile: 2+ years DevOps/Platform at Deutsche Telekom. FIFA 2026 infra prep,
3TB MongoDB migration, Istio mesh. RHCSA certified. AWS + GCP experienced.

Job Description:
{user_input}"""

    raise HTTPException(status_code=400, detail=f"Unknown mode: {mode}")


# ── LinkedIn image post (feed share) ─────────────────────────────────
MAX_LINKEDIN_IMAGE_BYTES = 8 * 1024 * 1024
ALLOWED_LINKEDIN_IMAGE_TYPES = frozenset(
    {"image/jpeg", "image/png", "image/gif", "image/webp"}
)


def _linkedin_json_headers() -> dict:
    return {
        "Authorization": f"Bearer {LINKEDIN_TOKEN}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }


def _linkedin_register_feedshare_image(owner_urn: str) -> tuple[str, str, dict]:
    """registerUpload → (upload_url, asset_urn, upload_mechanism_headers)."""
    url = "https://api.linkedin.com/v2/assets?action=registerUpload"
    body = {
        "registerUploadRequest": {
            "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
            "owner": owner_urn,
            "serviceRelationships": [
                {
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent",
                }
            ],
        }
    }
    r = requests.post(url, headers=_linkedin_json_headers(), json=body, timeout=60)
    if r.status_code not in (200, 201):
        raise HTTPException(
            status_code=502,
            detail=f"LinkedIn registerUpload failed: {r.status_code} {r.text[:800]}",
        )
    data = r.json()
    val = data.get("value") or data
    um = val.get("uploadMechanism") or {}
    inner = um.get("com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest") or um
    upload_url = inner.get("uploadUrl")
    asset_urn = val.get("asset")
    extra_headers = inner.get("headers") or {}
    if not upload_url or not asset_urn:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected registerUpload response keys: {list(data.keys())}",
        )
    return str(upload_url), str(asset_urn), extra_headers


def _linkedin_put_upload(upload_url: str, raw: bytes, content_type: str, extra_headers: dict) -> None:
    uh = {str(k): str(v) for k, v in extra_headers.items()}
    uh["Content-Type"] = content_type
    uh["Authorization"] = f"Bearer {LINKEDIN_TOKEN}"
    resp = requests.put(upload_url, headers=uh, data=raw, timeout=120)
    if resp.status_code not in (200, 201, 204):
        raise HTTPException(
            status_code=502,
            detail=f"LinkedIn image upload failed: {resp.status_code} {resp.text[:600]}",
        )


def _linkedin_publish_ugc(text: str, category: str, media: Optional[list]) -> dict:
    share: dict = {
        "shareCommentary": {"text": text},
        "shareMediaCategory": category,
    }
    if media:
        share["media"] = media
    payload = {
        "author": LINKEDIN_PERSON_URN,
        "lifecycleState": "PUBLISHED",
        "specificContent": {"com.linkedin.ugc.ShareContent": share},
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }
    r = requests.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers=_linkedin_json_headers(),
        json=payload,
        timeout=60,
    )
    if r.status_code == 201:
        return {"success": True, "posted_at": datetime.now().isoformat(), "with_media": bool(media)}
    raise HTTPException(status_code=502, detail=f"LinkedIn post failed: {r.text[:1200]}")


def build_refine_prompt(current_text: str, instruction: str) -> str:
    """Iterative edit: model sees full prior draft + user follow-up (ChatGPT-style)."""
    return f"""You are revising assistant output for Priyansh's LinkedIn AI agent.

CURRENT DRAFT (treat as the source of truth for facts — do not invent employers, metrics, or events):
---
{current_text}
---

USER'S FOLLOW-UP / EDIT REQUEST:
{instruction}

Instructions:
- Return ONLY the complete updated draft as plain text (no markdown fences, no preamble like "Here is the revised version").
- Preserve factual accuracy unless the user explicitly asks to change facts.
- Honor requests about length, tone, emojis, hashtags, hooks, or structure.
- If the draft ends with a line like "— Posted by Priyansh's Personal AI Agent 🤖", keep that as the final line unless the user asked to remove or change it.
"""


# ── ROUTES (all under /api for Docker proxy + Kubernetes ingress) ──
api = APIRouter(prefix="/api")


@api.get("/health")
def health():
    provider = get_provider()
    return {
        "status": "ok",
        "provider": provider or "none",
        "linkedin_connected": linkedin_fully_connected(),
        "timestamp": datetime.now().isoformat()
    }


@api.post("/generate")
def generate(req: GenerateRequest):
    prompt = build_prompt(req.mode, req.input)
    result = ask_ai(prompt)
    return {"result": result, "mode": req.mode}


@api.post("/refine")
def refine(req: RefineRequest):
    """Apply a natural-language edit to the last generated output; keeps prior draft in context."""
    if not req.current_text.strip():
        raise HTTPException(status_code=400, detail="current_text is empty")
    if not req.instruction.strip():
        raise HTTPException(status_code=400, detail="instruction is empty")
    prompt = build_refine_prompt(req.current_text.strip(), req.instruction.strip())
    text = ask_ai(prompt)
    return {"result": text}


@api.post("/post-to-linkedin")
async def post_to_linkedin(request: Request):
    """Text-only: JSON `{"text":"..."}`. With image: `multipart/form-data` fields `text` + `media` (JPEG/PNG/GIF/WEBP, max 8MB)."""
    if not LINKEDIN_TOKEN:
        raise HTTPException(
            status_code=400,
            detail="LinkedIn not connected. Use “Connect LinkedIn” in the app or set LINKEDIN_ACCESS_TOKEN.",
        )
    if not LINKEDIN_PERSON_URN:
        raise HTTPException(status_code=400, detail="LinkedIn URN not configured.")

    ct = (request.headers.get("content-type") or "").lower()
    if "multipart/form-data" in ct:
        form = await request.form()
        text_field = form.get("text")
        if text_field is None:
            raise HTTPException(status_code=400, detail="Form field 'text' is required")
        text_str = str(text_field).strip()
        if not text_str:
            raise HTTPException(status_code=400, detail="text is empty")
        up = form.get("media")
        fname = getattr(up, "filename", None) if up is not None else None
        if not fname:
            return _linkedin_publish_ugc(text_str, "NONE", None)
        raw = await up.read()
        if len(raw) > MAX_LINKEDIN_IMAGE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"Image too large (max {MAX_LINKEDIN_IMAGE_BYTES // (1024 * 1024)} MB)",
            )
        mime = getattr(up, "content_type", None) or mimetypes.guess_type(fname)[0] or ""
        mime = mime.split(";")[0].strip().lower() or "application/octet-stream"
        if mime not in ALLOWED_LINKEDIN_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported file type '{mime}'. "
                    "Use JPEG, PNG, GIF, or WEBP. Native video upload is not implemented yet."
                ),
            )
        upload_url, asset_urn, extra = _linkedin_register_feedshare_image(LINKEDIN_PERSON_URN)
        _linkedin_put_upload(upload_url, raw, mime, extra)
        media_items = [{"status": "READY", "media": asset_urn}]
        return _linkedin_publish_ugc(text_str, "IMAGE", media_items)

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Expected JSON body {text} or multipart form")
    req = PostRequest(**body)
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="text is empty")
    return _linkedin_publish_ugc(req.text.strip(), "NONE", None)


@api.get("/status")
def status():
    provider = get_provider()
    return {
        "ai_provider": provider,
        "ai_model": "claude-sonnet-4" if provider == "anthropic" else "gemini-2.5-flash" if provider == "gemini" else None,
        "linkedin_connected": linkedin_fully_connected(),
        "linkedin_oauth_ready": linkedin_oauth_ready(),
        "linkedin_urn": LINKEDIN_PERSON_URN if LINKEDIN_PERSON_URN else None,
    }


@api.get("/linkedin/start")
def linkedin_oauth_start():
    """Begin browser OAuth (same flow as step1_get_token.py). Redirects to LinkedIn."""
    if not linkedin_oauth_ready():
        raise HTTPException(
            status_code=503,
            detail="LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.",
        )
    state = _new_oauth_state()
    return RedirectResponse(url=_linkedin_authorize_url(state), status_code=302)


@api.get("/linkedin/callback")
def linkedin_oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
):
    """LinkedIn redirects here; we exchange the code and persist the session."""
    err_base = LINKEDIN_OAUTH_ERROR_URL
    sep = "&" if "?" in err_base else "?"

    if error:
        msg = error_description or error
        return RedirectResponse(
            url=f"{err_base}{sep}reason={urllib.parse.quote(msg)}",
            status_code=302,
        )

    if not code or not state or not _consume_oauth_state(state):
        return RedirectResponse(
            url=f"{err_base}{sep}reason=invalid_or_expired_state",
            status_code=302,
        )

    if not linkedin_oauth_ready():
        return RedirectResponse(
            url=f"{err_base}{sep}reason=oauth_not_configured",
            status_code=302,
        )

    token_payload = _exchange_code_for_token(code)
    if "access_token" not in token_payload:
        detail = urllib.parse.quote(str(token_payload))
        return RedirectResponse(
            url=f"{err_base}{sep}reason=token_exchange_failed&detail={detail}",
            status_code=302,
        )

    try:
        person_urn = _fetch_person_urn(token_payload["access_token"])
    except (requests.RequestException, ValueError) as e:
        return RedirectResponse(
            url=f"{err_base}{sep}reason={urllib.parse.quote(str(e))}",
            status_code=302,
        )

    persist_linkedin_session(token_payload["access_token"], person_urn)
    return RedirectResponse(url=LINKEDIN_OAUTH_SUCCESS_URL, status_code=302)


app.include_router(api)
