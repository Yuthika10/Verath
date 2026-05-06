"""
Verath LLM Service
Provides text generation using Groq (primary) with Gemini fallback.
"""
import requests
import json
from typing import Optional, List, Dict, Any

from app.config import settings
from app.core.logging_config import logger


def _call_groq(messages: List[Dict[str, str]], temperature: float = 0.7) -> Optional[str]:
    """Call Groq API for chat completion."""
    if not settings.groq_api_key:
        logger.warning("Groq API key not configured")
        return None
    
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": settings.groq_model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": 2048,
                "stream": False
            },
            timeout=settings.llm_timeout
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.Timeout:
        logger.warning("Groq API timeout")
        return None
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            logger.warning("Groq rate limit hit, will fallback")
        else:
            logger.error(f"Groq API error: {e}")
        return None
    except Exception as e:
        logger.error(f"Groq call failed: {e}")
        return None


def _call_gemini(prompt: str, temperature: float = 0.7) -> Optional[str]:
    """Call Google Gemini API as fallback."""
    if not settings.gemini_api_key:
        logger.warning("Gemini API key not configured")
        return None
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent"
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            params={"key": settings.gemini_api_key},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": 2048
                }
            },
            timeout=settings.llm_timeout
        )
        response.raise_for_status()
        data = response.json()
        
        if "candidates" in data and len(data["candidates"]) > 0:
            candidate = data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                return candidate["content"]["parts"][0]["text"]
        
        logger.warning("Gemini returned empty response")
        return None
    except requests.exceptions.Timeout:
        logger.warning("Gemini API timeout")
        return None
    except Exception as e:
        logger.error(f"Gemini call failed: {e}")
        return None


def _call_ollama(prompt: str) -> Optional[str]:
    """Legacy Ollama fallback for local development."""
    try:
        response = requests.post(
            f"{settings.ollama_url}/api/generate",
            json={"model": settings.model_name, "prompt": prompt, "stream": False},
            timeout=60,
        )
        response.raise_for_status()
        payload = response.json()
        return payload.get("response")
    except Exception as e:
        logger.debug(f"Ollama fallback failed: {e}")
        return None


def generate_text(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    use_fallback: bool = True
) -> str:
    """
    Generate text using Groq (primary) with Gemini and Ollama fallback.
    
    Args:
        prompt: The user prompt
        system_prompt: Optional system instructions
        temperature: Sampling temperature (0-1)
        use_fallback: Whether to try fallback providers on failure
    
    Returns:
        Generated text or error message
    """
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    # Try primary provider based on settings
    primary = settings.llm_provider.lower()
    result = None
    
    if primary == "groq":
        result = _call_groq(messages, temperature)
    elif primary == "gemini":
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        result = _call_gemini(full_prompt, temperature)
    
    if result:
        logger.info(f"LLM success via {primary}")
        return result
    
    if not use_fallback:
        return "Error: Primary LLM provider failed and fallback is disabled."
    
    # Fallback chain: Groq -> Gemini -> Ollama
    logger.info("Trying fallback LLM providers...")
    
    if primary != "groq":
        result = _call_groq(messages, temperature)
        if result:
            logger.info("LLM success via Groq fallback")
            return result
    
    if primary != "gemini":
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        result = _call_gemini(full_prompt, temperature)
        if result:
            logger.info("LLM success via Gemini fallback")
            return result
    
    # Final fallback to Ollama (local)
    result = _call_ollama(prompt)
    if result:
        logger.info("LLM success via Ollama fallback")
        return result
    
    logger.error("All LLM providers failed")
    return "Error: All LLM providers failed. Please check your API keys and internet connection."


def ask_llm(prompt: str) -> str:
    """Simple LLM query (backward compatible)."""
    return generate_text(prompt)


def ask_llm_with_context(prompt: str, context: str = "") -> str:
    """Ask LLM with additional context."""
    system_prompt = "You are Verath, an AI memory assistant. Use the provided context to answer accurately and concisely."
    full_prompt = f"Context:\n{context}\n\nQuestion:\n{prompt}\n\nAnswer:"
    return generate_text(full_prompt, system_prompt=system_prompt)


def summarize_text(text: str, max_length: int = 200) -> str:
    """Summarize text using the LLM."""
    system_prompt = "You are a concise summarizer. Create brief, informative summaries."
    prompt = f"Summarize the following in {max_length} characters or less:\n\n{text}"
    return generate_text(prompt, system_prompt=system_prompt)


def extract_insights(text: str) -> List[str]:
    """Extract insights from text."""
    system_prompt = "Extract key insights, action items, and important facts. Return as a bulleted list."
    prompt = f"Analyze this text and extract key insights:\n\n{text}\n\nInsights:"
    response = generate_text(prompt, system_prompt=system_prompt)
    
    # Parse bulleted list
    insights = []
    for line in response.split("\n"):
        line = line.strip()
        if line.startswith(("-", "*", "•")) or line.startswith(("1.", "2.", "3.")):
            insights.append(line.lstrip("- *•123456789. ").strip())
    
    return insights if insights else [response]
