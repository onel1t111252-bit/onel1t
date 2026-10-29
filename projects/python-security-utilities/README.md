# Python Security Utilities

A small, dependency-free educational CLI with three local utilities:
- `password`: gives a rough strength estimate and improvement tips
- `hash`: calculates a file's SHA-256 digest
- `logs`: filters a text log for common error and warning indicators

## Run
Requires Python 3.10+.
```bash
python security_tools.py password "Example-Only-123!"
python security_tools.py hash ./sample.txt
python security_tools.py logs ./sample.log --limit 30
```

Use only example passwords in command-line demos: command arguments may be saved in shell history or visible to other local processes. The log parser is intentionally simple and is not a substitute for a SIEM.
