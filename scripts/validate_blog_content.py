"""
pip install pyyaml langchain-openai langchain-core pydantic
"""

import sys
import os
from typing import List
from pydantic import BaseModel, Field
import yaml
import json
import re
from pathlib import Path

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

# -----------------------
# Severity definitions
# -----------------------
SEVERITY_ORDER = {"info": 1, "warning": 2, "error": 3}
SARIF_LEVEL = {"info": "note", "warning": "warning", "error": "error"}

# -----------------------
# Load config
# -----------------------
with open("blog/blog.config.yml", "r") as f:
    CONFIG = yaml.safe_load(f)

FAIL_THRESHOLD = SEVERITY_ORDER[CONFIG["severity_threshold"]]

RESULTS = []
EXIT_CODE = 0


# -----------------------
# Utilities
# -----------------------
def emit_annotation(severity, message, file, line=1):
    level = "notice"
    if severity == "warning":
        level = "warning"
    elif severity == "error":
        level = "error"

    print(f"::{level} file={file},line={line}::{message}")


def record(rule, severity, message, file, line=1):
    global EXIT_CODE
    RESULTS.append(
        {
            "rule": rule,
            "severity": severity,
            "message": message,
            "file": file,
            "line": line,
        }
    )

    emit_annotation(severity, message, file, line)

    if SEVERITY_ORDER[severity] >= FAIL_THRESHOLD:
        EXIT_CODE = 1


# -----------------------
# Rule: Frontmatter
# -----------------------
def check_frontmatter(content, file):
    rule = "frontmatter_required"
    if not CONFIG["rules"][rule]["enabled"]:
        return

    match = re.match(r"^---\n(.*?)\n---", content, re.S)
    if not match:
        record(rule, "error", "Missing frontmatter block", file)
        return

    frontmatter = yaml.safe_load(match.group(1))
    for field in CONFIG["rules"][rule]["fields"]:
        if field not in frontmatter:
            record(
                rule,
                CONFIG["rules"][rule]["severity"],
                f"Missing frontmatter field: {field}",
                file,
            )


# -----------------------
# Rule: Heading hierarchy
# -----------------------
def check_headings(content, file):
    rule = "heading_hierarchy"
    if not CONFIG["rules"][rule]["enabled"]:
        return

    prev = 0
    for i, line in enumerate(content.splitlines(), 1):
        if line.startswith("#"):
            level = len(line.split(" ")[0])
            if prev and level > prev + 1:
                record(
                    rule,
                    CONFIG["rules"][rule]["severity"],
                    f"Heading jumps from H{prev} to H{level}",
                    file,
                    i,
                )
            prev = level


# -----------------------
# Rule: Trailing whitespace
# -----------------------
def check_trailing_whitespace(content, file):
    rule = "trailing_whitespace"
    if not CONFIG["rules"][rule]["enabled"]:
        return

    for i, line in enumerate(content.splitlines(), 1):
        if line.rstrip("\n") != line.rstrip("\n").rstrip(" "):
            record(
                rule, CONFIG["rules"][rule]["severity"], "Trailing whitespace", file, i
            )


# -----------------------
# AI Review
# -----------------------
class Issue(BaseModel):
    """An issue found in the blog content."""

    message: str = Field(description="Description of the issue found")
    line: int = Field(1, description="Line number where the issue occurs")


class Review(BaseModel):
    """Review of the blog content."""

    issues: List[Issue] = Field(description="List of issues found in the content")


def ai_review(content, file):
    api_key = os.getenv("API_KEY")
    if not api_key:
        print("API_KEY not set; skipping AI review")
        return
    ai_cfg = CONFIG["ai_review"]
    if not ai_cfg["enabled"]:
        return

    parser = PydanticOutputParser(pydantic_object=Review)
    llm = ChatOpenAI(
        model=ai_cfg["model"],
        temperature=0.2,
        max_completion_tokens=ai_cfg.get("max_tokens", 300),
        base_url=os.getenv("BASE_URL"),
        api_key=api_key,
    )
    prompt = PromptTemplate(
        template="You are a technical content reviewer.\n\nReview the following blog post for:\n{checks}\n\nContent:\n--------\n{code}\n--------\n\n{format_instructions}.",
        input_variables=["code", "checks"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    chain = prompt | llm | parser
    try:
        review: Review = chain.invoke(
            {"code": content[:4000], "checks": ", ".join(ai_cfg["checks"])}
        )
        for issue in review.issues:
            record("ai_review", ai_cfg["severity"], issue.message, file, issue.line)
    except Exception as e:
        record("ai_review", "warning", f"AI review failed: {e}", file)


# -----------------------
# GitHub Actions outputs
# -----------------------
def write_github_outputs():
    path = os.getenv("GITHUB_OUTPUT")
    if not path:
        return
    warnings = sum(1 for r in RESULTS if r["severity"] == "warning")
    errors = sum(1 for r in RESULTS if r["severity"] == "error")
    with open(path, "a") as f:
        f.write(f"warnings={warnings}\n")
        f.write(f"errors={errors}\n")
        f.write(f"total={len(RESULTS)}\n")


def write_github_summary():
    path = os.getenv("GITHUB_STEP_SUMMARY")
    if not path:
        return

    errors = [r for r in RESULTS if r["severity"] == "error"]
    warnings = [r for r in RESULTS if r["severity"] == "warning"]
    infos = [r for r in RESULTS if r["severity"] == "info"]

    lines = ["## Blog Content Validation\n\n"]
    if not RESULTS:
        lines.append("✅ All checks passed — no issues found.\n")
    else:
        lines.append(
            "| Severity | Count |\n"
            "|---|---|\n"
            f"| 🔴 Error | {len(errors)} |\n"
            f"| 🟡 Warning | {len(warnings)} |\n"
            f"| ℹ️ Info | {len(infos)} |\n\n"
        )
        for heading, bucket in [("Errors", errors), ("Warnings", warnings), ("Info", infos)]:
            if bucket:
                lines.append(f"### {heading}\n\n")
                for r in bucket:
                    lines.append(
                        f"- **{r['file']}** line {r['line']}: "
                        f"`{r['rule']}` — {r['message']}\n"
                    )
                lines.append("\n")

    with open(path, "a") as f:
        f.writelines(lines)


# -----------------------
# SARIF Generation
# -----------------------
def write_sarif():
    sarif = {
        "version": "2.1.0",
        "runs": [
            {"tool": {"driver": {"name": "BlogLint", "rules": []}}, "results": []}
        ],
    }

    for r in RESULTS:
        sarif["runs"][0]["results"].append(
            {
                "ruleId": r["rule"],
                "level": SARIF_LEVEL.get(r["severity"], "note"),
                "message": {"text": r["message"]},
                "locations": [
                    {
                        "physicalLocation": {
                            "artifactLocation": {"uri": r["file"]},
                            "region": {"startLine": r["line"]},
                        }
                    }
                ],
            }
        )

    with open("bloglint.sarif", "w") as f:
        json.dump(sarif, f, indent=2)


# -----------------------
# JSON Report
# -----------------------
def write_json():
    with open("bloglint.json", "w") as f:
        json.dump(RESULTS, f, indent=2)


# -----------------------
# Main
# -----------------------
def main():
    files = Path(sys.argv[1]).read_text().split()

    for file in files:
        content = Path(file).read_text(encoding="utf-8")

        check_frontmatter(content, file)
        check_headings(content, file)
        check_trailing_whitespace(content, file)
        ai_review(content, file)

    write_json()
    write_sarif()
    write_github_outputs()
    write_github_summary()
    sys.exit(EXIT_CODE)


if __name__ == "__main__":
    main()
