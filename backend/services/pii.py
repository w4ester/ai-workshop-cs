"""PII redaction service — strips personal data before storage."""
import re

# Compiled patterns for performance
_PATTERNS = [
    ("email", re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b")),
    ("phone", re.compile(r"\b(?:\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}\b")),
    ("ssn", re.compile(r"\b\d{3}[\s\-]?\d{2}[\s\-]?\d{4}\b")),
    ("credit_card", re.compile(r"\b(?:\d{4}[\s\-]?){3}\d{4}\b")),
]


def redact_pii(text: str) -> tuple[str, list[str]]:
    """Remove PII from text. Returns (redacted_text, list_of_redaction_types)."""
    redacted = text
    found: list[str] = []

    for label, pattern in _PATTERNS:
        if pattern.search(redacted):
            found.append(label)
            redacted = pattern.sub(f"[{label.upper()}_REDACTED]", redacted)

    return redacted, found
