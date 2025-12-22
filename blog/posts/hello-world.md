---
title: Building Accessible React Components
excerpt: A comprehensive guide to building React components that are accessible to all users, including those using assistive technologies.
author: Dev Team
series: Awesome Tools
created: 2024-01-05
tags: React, Accessibility, A11y
coverImage: https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60
published: true
---

# Building Accessible React Components

Accessibility (a11y) is not just a nice-to-have—it's essential for creating inclusive web applications.

## Why Accessibility Matters

- **Legal requirements** - Many countries have accessibility laws
- **Better UX for everyone** - Accessible designs often improve usability for all users
- **SEO benefits** - Screen reader friendly content is also search engine friendly

## Semantic HTML

Always start with semantic HTML:

```tsx
// ❌ Avoid
<div onClick={handleClick}>Click me</div>

// ✅ Use semantic elements
<button onClick={handleClick}>Click me</button>
```

## ARIA Labels

Use ARIA attributes when semantic HTML isn't enough:

```tsx
<button aria-label="Close modal" aria-pressed={isPressed} onClick={handleClose}>
  <XIcon />
</button>
```

## Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```tsx
function Modal({isOpen, onClose, children}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  return isOpen ? (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  ) : null;
}
```

## Focus Management

Manage focus appropriately:

```tsx
function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="search" aria-label="Search" placeholder="Search..." />;
}
```

## Color Contrast

Ensure sufficient color contrast (WCAG 2.1 requires at least 4.5:1 for normal text):

```css
/* ✅ Good contrast */
.button {
  background-color: #0366d6;
  color: #ffffff;
}
```

## Testing Accessibility

Use these tools to test your components:

1. **axe DevTools** - Browser extension for accessibility testing
2. **React Testing Library** - Has built-in accessibility queries
3. **Lighthouse** - Includes accessibility audits

## Conclusion

Building accessible components requires intentional design and development practices. Start with semantic HTML, add ARIA when needed, and always test with keyboard navigation and screen readers.
