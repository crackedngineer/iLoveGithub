"""
pip install pyyaml markdown langchain openai requests
"""

import sys
import os
from pydantic import BaseModel, Field
import yaml
import json
import re
from datetime import datetime
from pathlib import Path

from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy

from langchain_openai import ChatOpenAI
from langchain.messages import HumanMessage
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

# -----------------------
# Severity definitions
# -----------------------
SEVERITY_ORDER = {"info": 1, "warning": 2, "error": 3}

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

from typing import List
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
        api_key=lambda: api_key,
    )
    prompt = PromptTemplate(
        template="""\nYou are a technical content reviewer.\n\nReview the following blog post for:\n{checks}\n\nContent:\n--------\n{code}\n--------\n\n{format_instructions}.""",
        input_variables=["code", "checks"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    chain = prompt | llm | parser
    response = chain.invoke({"code": content[:4000], "checks": ', '.join(ai_cfg["checks"])})

    # agent = create_agent(
    #     llm,
    #     tools=[],
    #     response_format=ToolStrategy(
    #         schema=Review,
    #         tool_message_content="Issues and line number as JSON array",
    #     ),
    #     system_prompt="You are a technical content reviewer.",
    # )
    try:
        # response = agent.invoke(
        #     {
        #         "messages": [
        #             {
        #                 "role": "user",
        #                 "content": f"Please review the following blog post content for: {', '.join(ai_cfg['checks'])}.\n\nContent:\n--------\n{content[:4000]}\n--------",
        #             }
        #         ]
        #     }
        # )
        for issue in response["structured_response"].issues:
            record(
                "ai_review",
                ai_cfg["severity"],
                issue["message"],
                file,
                issue.get("line", 1),
            )
    except Exception as e:
        record(
            "ai_review", "warning", "AI review failed or returned invalid JSON", file
        )


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
                "level": r["severity"],
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
        # ai_review(content, file)

    write_json()
    write_sarif()
    sys.exit(EXIT_CODE)


if __name__ == "__main__":
    main()
