# **Coding Standards**

This document outlines the coding standards and conventions to be followed for the "Pixel Quest" project. Adhering to these standards is crucial for maintaining code quality, readability, and consistency across the monorepo.

## **General Principles**

*   **Clarity and Readability:** Write code that is easy for other developers (and our future selves) to understand. Prioritize clarity over concise but cryptic code.
*   **Consistency:** Adhere to the established style and patterns within the codebase. If you see a pattern used in a file, follow it.
*   **Modularity:** Keep functions and classes focused on a single responsibility. Avoid monolithic files that do too many things.

## **JavaScript Style Guide**

We will use **Prettier** for automatic code formatting and **ESLint** for enforcing code quality rules. The specific rules will be defined in the `.prettierrc` and `.eslintrc.json` files at the root of the project.

### **Key Formatting Rules (Enforced by Prettier)**

*   **Indentation:** 2 spaces.
*   **Semicolons:** Yes, always use semicolons at the end of statements.
*   **Quotes:** Use single quotes (`'`) for strings, unless a string contains a single quote, in which case use double quotes (`"`).
*   **Trailing Commas:** Use trailing commas for multi-line arrays and objects.
*   **Line Length:** Aim for a maximum line length of 120 characters.

### **Key Linting Rules (Enforced by ESLint)**

*   **Variable Declarations:** Prefer `const` over `let`. Only use `let` if the variable's value needs to be reassigned. Avoid `var` entirely.
*   **Arrow Functions:** Prefer arrow functions (`=>`) over traditional function expressions, especially for callbacks.
*   **Modules:** Use ES6 Modules (`import`/`export`) exclusively. Do not use CommonJS (`require`/`module.exports`).
*   **Equality:** Use strict equality (`===` and `!==`) instead of loose equality (`==` and `!=`).

## **Naming Conventions**

*   **Files:** Use kebab-case for file names (e.g., `player-character.js`, `quest-manager.js`).
*   **Classes:** Use PascalCase for class names (e.g., `class Player`, `class GameSession`).
*   **Functions and Variables:** Use camelCase for function and variable names (e.g., `function calculateDamage()`, `let playerScore`).
*   **Constants:** Use SCREAMING_SNAKE_CASE for top-level constants that are hard-coded and widely used (e.g., `const MAX_PLAYERS = 4;`).
*   **Private Members:** While JavaScript does not have true private members, use a leading underscore (`_`) to indicate that a method or property is intended for internal use within a class (e.g., `this._updateHealth()`).

## **Comments**

*   **When to Comment:** Comment on the *why*, not the *what*. Assume the reader understands the language. Use comments to explain complex logic, business rules, or the reasoning behind a particular implementation choice.
*   **Format:** Use `//` for single-line comments and `/** ... */` for multi-line JSDoc-style comments for functions and classes.

```javascript
/**
 * Calculates the total damage dealt, applying armor and resistance modifiers.
 * @param {number} baseDamage - The initial damage before mitigation.
 * @param {object} target - The entity receiving the damage.
 * @returns {number} The final calculated damage.
 */
function calculateDamage(baseDamage, target) {
  // The resistance formula provides diminishing returns.
  const resistanceModifier = 100 / (100 + target.resistance);
  return baseDamage * resistanceModifier - target.armor;
}
```

## **Git and Version Control**

*   **Branching:** Use a feature-branching workflow. Create a new branch for each new feature, bugfix, or story (e.g., `feature/player-movement`, `bugfix/combat-freeze`).
*   **Commit Messages:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps in automating changelogs and understanding the history of changes.
    *   **Example:** `feat: add player character movement with WASD keys`
    *   **Example:** `fix: prevent player from moving outside the canvas boundaries`
    *   **Example:** `docs: update coding standards with naming conventions`

By following these standards, we will create a codebase that is clean, maintainable, and a pleasure to work on.
