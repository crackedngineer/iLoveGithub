# 🧑‍💻 Contributing to GitHub Tools Directory

Thanks for taking the time to contribute! 🎉 Whether you're fixing a typo, improving code, or adding a new tool — your help is appreciated.

---

## 🛠️ How to Contribute

### 1. 🐛 Reporting Issues

- Use the **"Code Issue"** template to report bugs or improvements.
- Clearly explain the issue with steps to reproduce it.
- Include screenshots or error messages if applicable.

### 2. 🧩 Suggesting or Adding a Tool

- Use the **"Add New Tool"** issue template.
- Make sure the tool is accessible and relevant to GitHub developers.
- Include the name, link, description, and category (e.g. DevTools, Insights, Widgets).

### 3. ♻️ Improving Code or Docs

- Refactor, optimize, or improve readability without breaking functionality.
- Keep code formatting consistent and easy to read.
- Document your changes where necessary (especially for complex logic).

---

## ✅ Code & PR Guidelines

- Keep PRs focused on a single change or related changes.
- Add tests or checks if introducing new logic.
- Mention the issue your PR fixes (`Fixes #issue_number`).
- Maintain alphabetical or logical ordering when adding to lists.
- Be respectful in discussions and responsive to feedback.

---

## 📝 Commit Message Guidelines (Conventional Commits)

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.  
This ensures clear commit history and enables automatic changelog generation.

### 🔑 Format

```
<type>(optional scope): <short description>

[optional body]
[optional footer(s)]
```

### ✅ Common Types

- **feat**: a new feature (`feat(auth): add GitHub OAuth login`)
- **fix**: a bug fix (`fix(ui): correct dark mode toggle`)
- **docs**: documentation only changes (`docs: update contributing guide`)
- **style**: changes that don’t affect logic (e.g. formatting, spacing)
- **refactor**: code changes that neither fix a bug nor add a feature
- **perf**: improve performance (`perf(api): cache user profile lookups`)
- **test**: add or fix tests
- **chore**: maintenance tasks (configs, dependencies, CI/CD)

### ⚡ Examples

```
feat(tool-list): add filtering by category
fix(search): handle empty queries gracefully
docs: update README with installation steps
```

### 🚨 Breaking Changes

If your change breaks existing functionality, add a `BREAKING CHANGE` note in the commit body:

```
feat(auth): update token validation
```

BREAKING CHANGE: the login API now requires a session_id parameter

---

## 💡 Tips for First-Time Contributors

- Check for existing issues or discussions before opening a new one.
- You can ask for help in the issue thread if you're stuck.
- Every contribution, big or small, matters — thank you!

---

Thank you for helping improve this project 🙌  
**Happy contributing! 🚀**
