"""LLM interface for coach-style explanation (optional). Uses metrics only."""
import os
from typing import Any, Dict, Optional
from .prompt_templates import COACH_SYSTEM_PROMPT, format_window_summary_for_llm

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    genai = None


def generate_explanation(window: Dict[str, Any]) -> Optional[str]:
    """
    Generate coach-style explanation text from window metrics only.
    Returns None if API key missing or LLM unavailable.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key or not GEMINI_AVAILABLE or genai is None:
        return None
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        summary = format_window_summary_for_llm(window)
        response = model.generate_content(
            [COACH_SYSTEM_PROMPT, summary],
            generation_config=genai.types.GenerationConfig(max_output_tokens=128, temperature=0),
        )
        if response and response.text:
            return response.text.strip()
    except Exception:
        pass
    return None
