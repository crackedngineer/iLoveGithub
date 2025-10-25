import json
from pathlib import Path
from collections import defaultdict

TOOLS_JSON = "tools.json"
README_FILE = "README.md"
PLACEHOLDER_START = "<!-- TOOLS_START -->"
PLACEHOLDER_END = "<!-- TOOLS_END -->"


def tools_to_markdown(tools):
    # Group by category
    grouped = defaultdict(list)
    for tool in tools:
        grouped[tool.get("category", "Uncategorized")].append(tool)

    md = []
    for category, items in grouped.items():
        md.append(f"### 🧩 {category}\n\n")
        md.append("| Tool | Description | Launch |\n")
        md.append("| ---- | ----------- | ------ |\n")
        for tool in items:
            name = tool.get("name", "Unnamed")
            url = tool.get("url", "#")
            desc = tool.get("description", "")
            homepage = tool.get("homepage", "")
            md.append(f"| [**{name}**]({homepage}) | {desc} | `{url}` |\n")
        md.append("\n---\n\n")
    return "".join(md)


def update_readme(content, markdown):
    if PLACEHOLDER_START in content and PLACEHOLDER_END in content:
        before = content.split(PLACEHOLDER_START)[0]
        after = content.split(PLACEHOLDER_END)[1]
        return f"{before}{PLACEHOLDER_START}\n{markdown}{PLACEHOLDER_END}{after}"
    else:
        # If placeholder not found, append at end
        return content + f"\n\n{PLACEHOLDER_START}\n{markdown}{PLACEHOLDER_END}\n"


def main():
    tools_path = Path(TOOLS_JSON)
    readme_path = Path(README_FILE)

    if not tools_path.exists():
        print(f"❌ {TOOLS_JSON} not found")
        return

    tools = json.loads(tools_path.read_text(encoding="utf-8"))
    markdown = tools_to_markdown(tools)

    if readme_path.exists():
        content = readme_path.read_text(encoding="utf-8")
    else:
        content = ""

    updated_content = update_readme(content, markdown)
    readme_path.write_text(updated_content, encoding="utf-8")
    print("✅ README.md updated successfully!")


if __name__ == "__main__":
    main()
