#!/usr/bin/env python3
"""Small defensive security utilities for learning and local use."""
from __future__ import annotations
import argparse
import hashlib
import re
from pathlib import Path

COMMON_PASSWORDS = {"password", "password123", "12345678", "qwerty123", "letmein"}

def check_password(password: str) -> tuple[int, list[str]]:
    """Return a rough score (0-5) and actionable feedback; never stores the password."""
    score = 0
    tips = []
    if len(password) >= 12: score += 1
    else: tips.append("Use at least 12 characters.")
    if re.search(r"[a-z]", password): score += 1
    else: tips.append("Add lowercase letters.")
    if re.search(r"[A-Z]", password): score += 1
    else: tips.append("Add uppercase letters.")
    if re.search(r"\d", password): score += 1
    else: tips.append("Add numbers.")
    if re.search(r"[^A-Za-z0-9]", password): score += 1
    else: tips.append("Add symbols.")
    if password.lower() in COMMON_PASSWORDS:
        score = min(score, 1)
        tips.append("Avoid common or predictable passwords.")
    return score, tips

def sha256_file(path: Path) -> str:
    """Hash a file in chunks so large files do not need to fit in memory."""
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()

def summarize_log(path: Path, limit: int = 20) -> list[str]:
    """Show lines containing common warning/error indicators (simple demo parser)."""
    indicators = ("error", "failed", "failure", "warning", "denied", "critical")
    matches = []
    with path.open("r", encoding="utf-8", errors="replace") as file:
        for number, line in enumerate(file, 1):
            if any(word in line.lower() for word in indicators):
                matches.append(f"{number}: {line.rstrip()}")
                if len(matches) >= limit: break
    return matches

def main() -> None:
    parser = argparse.ArgumentParser(description="ONEL1T Python Security Utilities")
    sub = parser.add_subparsers(dest="command", required=True)
    password = sub.add_parser("password", help="check password strength")
    password.add_argument("value", help="password to evaluate (avoid using a real password)")
    hashing = sub.add_parser("hash", help="calculate a file's SHA-256")
    hashing.add_argument("file", type=Path)
    logs = sub.add_parser("logs", help="find warning/error lines in a text log")
    logs.add_argument("file", type=Path)
    logs.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    if args.command == "password":
        score, tips = check_password(args.value)
        print(f"Estimated strength: {score}/5")
        print("Good baseline." if score == 5 else "\n".join(f"- {tip}" for tip in tips))
    elif args.command == "hash":
        if not args.file.is_file(): parser.error("file does not exist")
        print(f"SHA-256  {args.file}: {sha256_file(args.file)}")
    elif args.command == "logs":
        if not args.file.is_file(): parser.error("file does not exist")
        if args.limit < 1: parser.error("--limit must be positive")
        matches = summarize_log(args.file, args.limit)
        print("\n".join(matches) if matches else "No matching lines found.")

if __name__ == "__main__":
    main()
