# Activity Explorer flow fix

This revision separates the transition between Fantasy Profile and Activity Explorer into a proper landing step.

## Changed

- Activity Explorer now opens on a category-start landing page instead of mixing recommendations into an active category screen.
- The landing page surfaces up to eight strong Fantasy Profile matches first, while still allowing any category to be chosen as the starting point.
- Choosing a category starts the Activity Explorer there and builds a focused first-pass path from all Fantasy Profile category matches plus the category the user explicitly chose.
- Categories outside that focused path are hidden initially, not treated as unanswered, and can be restored at any time with **Show all categories**, **Show everything**, or **Show hidden / skipped things**.
- **Start with everything** bypasses the adaptive hiding and opens the complete catalog.
- The explorer now has a **Continue** step from one visible category to the next, preserving the chosen starting point and wrapping the category order around it.
- Manually skipped categories and hidden activities are excluded from unanswered counts unless the user has chosen to show hidden content.
- Results now report unanswered activities only within the current path, so adaptive-hidden questions do not make the test look incomplete.

## Validation

- All JS/JSX source files pass a TypeScript JSX syntax/transpile check.
- JSON data files parse successfully.
- Adaptive filtering/result-count behavior was exercised with a Node-based functional check.
- A full Vite build could not be run in this environment because the uploaded prototype does not include `node_modules` and package installation was unavailable during validation.
