"""Explicit, local-only security helpers for ONEL1T JARVIS.

No remote page fetches, active subnet scans, downloaded attachments or shell
execution. Git publication requires an exact remote and visual confirmation.
"""
from __future__ import annotations
from email import policy
from email.parser import BytesParser
from pathlib import Path
from urllib.parse import urlsplit
import ipaddress
import re
import subprocess


def inspect_email_bytes(raw: bytes) -> str:
    """Inspect untrusted .eml headers and URLs without opening any links."""
    if len(raw) > 2_000_000:
        raise ValueError("Лист завеликий для локального аналізу (ліміт 2 МБ).")
    msg = BytesParser(policy=policy.default).parsebytes(raw)
    findings = []
    sender = str(msg.get("From", ""))[:220]
    reply = str(msg.get("Reply-To", ""))[:220]
    subject = str(msg.get("Subject", ""))[:180]
    if reply and reply.casefold() != sender.casefold():
        findings.append("Reply-To відрізняється від From — перевір адресу відповіді.")
    auth = " ".join(str(msg.get(h, "")) for h in ("Authentication-Results", "Received-SPF")).casefold()
    for item in ("spf=fail", "dkim=fail", "dmarc=fail", "spf=softfail"):
        if item in auth:
            findings.append("Заголовок автентифікації містить " + item + ".")
    attachment_names = []
    chunks = []
    for part in msg.walk():
        if part.get_filename():
            attachment_names.append(str(part.get_filename())[:100])
        if part.get_content_type() == "text/plain" and len(chunks) < 6:
            try:
                chunks.append(str(part.get_content())[:25000])
            except (LookupError, UnicodeError, ValueError, TypeError):
                pass
    urls = re.findall(r"https?://[^\s<>\"']+", "\n".join(chunks), re.I)[:30]
    hosts = []
    for url in urls:
        try:
            host = (urlsplit(url.rstrip(".,);")).hostname or "").casefold()
        except ValueError:
            continue
        if not host:
            continue
        hosts.append(host)
        if "xn--" in host or "@" in urlsplit(url).netloc:
            findings.append("Підозріле доменне ім’я або @ в адресі посилання.")
        try:
            ipaddress.ip_address(host)
            findings.append("Посилання веде безпосередньо на IP-адресу.")
        except ValueError:
            pass
    if attachment_names:
        findings.append("Вкладення не відкривались: " + ", ".join(attachment_names[:5]))
    safe_hosts = ", ".join(sorted(set(hosts))[:10]) if hosts else "не виявлено у текстовій частині"
    state = "Знайдено сигнали для ручної перевірки" if findings else "Очевидних сигналів у перевірених полях не виявлено"
    return (f"Локальний аналіз .eml: {state}.\nТема: {subject or '—'}\n"
            f"From: {sender or '—'}\nДомени в тексті: {safe_hosts}\n"
            + ("\n".join("• " + x for x in findings[:12]) if findings else "")
            + "\nВисновок не гарантує безпечність листа; посилання та вкладення не відкривались.")


def choose_and_inspect_email() -> str:
    from tkinter import Tk, filedialog
    root = Tk()
    root.withdraw()
    try:
        path = filedialog.askopenfilename(
            parent=root, title="Оберіть .eml для перевірки фішингу",
            filetypes=[("Email (*.eml)", "*.eml")])
    finally:
        root.destroy()
    if not path:
        return "Перевірку скасовано: файл не обрано."
    p = Path(path)
    if p.suffix.casefold() != ".eml" or not p.is_file() or p.stat().st_size > 2_000_000:
        return "Оберіть локальний .eml до 2 МБ."
    return inspect_email_bytes(p.read_bytes())


def local_network_report() -> str:
    """Passive Windows network inventory only; no host probing or port scan."""
    import os
    if os.name != "nt":
        return "Діагностика локальної мережі доступна у Windows."
    sections = []
    for label, command in (("Мережеві інтерфейси", ["ipconfig"]),
                           ("Відомі локальні сусіди (ARP)", ["arp", "-a"]),
                           ("Прослуховувані локальні TCP-порти", ["netstat", "-ano", "-p", "tcp"])):
        try:
            result = subprocess.run(command, shell=False, capture_output=True,
                                    text=True, errors="replace", timeout=10,
                                    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            lines = result.stdout.splitlines()
            if label.startswith("Прослуховувані"):
                lines = [line.strip() for line in lines if "LISTENING" in line.upper()]
            sections.append(label + ":\n" + "\n".join(lines[:18])[:2400])
        except (OSError, subprocess.TimeoutExpired):
            sections.append(label + ": команда недоступна.")
    return ("Пасивний звіт вашого ПК (без Nmap та сканування інших пристроїв):\n"
            + "\n\n".join(sections)[:6500]
            + "\nВідкритий порт не означає вразливість. Перевіряйте невідомі служби окремо.")


def deploy_portfolio() -> str:
    """Publish only tracked changes in an explicitly chosen ONEL1T checkout."""
    from tkinter import Tk, filedialog, messagebox
    root = Tk()
    root.withdraw()
    try:
        folder = filedialog.askdirectory(parent=root, title="Оберіть локальну папку репозиторію ONEL1T")
        if not folder:
            return "Деплой скасовано: папку не обрано."
        base = Path(folder).resolve()
        def git(*args: str) -> subprocess.CompletedProcess[str]:
            return subprocess.run(["git", "-C", str(base), *args], shell=False,
                                  capture_output=True, text=True, errors="replace", timeout=45)
        remote = git("remote", "get-url", "origin")
        expected = re.compile(r"^(?:https://github\.com/|git@github\.com:)"
                              r"onel1t111252-bit/onel1t(?:\.git)?/?$", re.I)
        if remote.returncode or not expected.fullmatch(remote.stdout.strip()):
            return "Відмова: origin не збігається з onel1t111252-bit/onel1t."
        branch = git("branch", "--show-current")
        if branch.returncode or branch.stdout.strip() != "main":
            return "Відмова: публікація дозволена лише з гілки main."
        status = git("status", "--porcelain")
        if status.returncode:
            return "Не вдалось перевірити git status."
        tracked = [x for x in status.stdout.splitlines() if not x.startswith("??")]
        if not tracked:
            return "Немає змін у відстежуваних файлах для коміту."
        if not messagebox.askyesno(
                "JARVIS • Deploy ONEL1T",
                f"Опублікувати {len(tracked)} змін(и) у відстежуваних файлах ONEL1T?\n"
                "Перегляньте git diff перед підтвердженням. Нові файли НЕ додаватимуться.",
                parent=root):
            return "Деплой скасовано користувачем."
        for args in (("add", "-u"), ("commit", "-m", "Update ONEL1T portfolio via JARVIS"),
                     ("push", "origin", "main")):
            result = git(*args)
            if result.returncode:
                return "Git " + args[0] + " не виконано: " + (result.stderr or result.stdout)[-650:]
        return "ONEL1T: зміни в наявних файлах закомічено і відправлено в origin/main. Перевірте GitHub Pages Actions."
    except (OSError, subprocess.TimeoutExpired) as exc:
        return "Не вдалось виконати деплой: " + str(exc)[:160]
    finally:
        root.destroy()
