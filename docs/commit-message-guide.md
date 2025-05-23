# Commit Message Guidelines

## Format

```
<type>(<scope>): <short summary>

<body - optional>

<footer - optional>
```

## Rules

### Type (required)

Describes the kind of change:

- `fix`: Bug fixes or error corrections
- `feat`: New features or enhancements
- `refactor`: Code changes that neither fix bugs nor add features
- `style`: Changes that don't affect code meaning (formatting, spacing)
- `docs`: Documentation changes
- `test`: Adding or correcting tests
- `perf`: Performance improvements
- `chore`: Maintenance tasks, dependency updates, etc.

### Scope (optional)

Area of codebase affected:

- Examples: ui, api, db, auth, drag-drop
- Use lowercase
- Use hyphens for multi-word scopes: `user-management`

### Summary (required)

- Begin with lowercase
- No period at the end
- Be concise (50 chars or less)
- Use imperative mood ("add" not "added" or "adds")

### Body (optional)

- Separated from summary by blank line
- Explain "what" and "why" not "how"
- Can use bullet points with hyphens

### Footer (optional)

- Reference issue numbers: "Fixes #123"
- Breaking changes noted with "BREAKING CHANGE:"

## Examples

```
fix(ui): correct task card layout in kanban view

- Fix alignment of title and description
- Ensure PR metadata renders correctly
- Improve spacing between elements

Fixes #45
```

```
feat(drag-drop): implement optimistic updates for smoother UX

Cards now stay in target column during API requests
```

```
refactor(api): simplify task status update endpoint
```

## Automatic Commit Generation

When using automated tools to generate commit messages, these guidelines should be used to ensure consistency.
