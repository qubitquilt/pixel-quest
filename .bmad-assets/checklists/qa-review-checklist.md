# QA Review Checklist

This checklist ensures code quality, functionality, and adherence to standards before approval.

## Code Quality
- [ ] Code is readable with clear variable/function names
- [ ] Comments explain complex logic (not obvious parts)
- [ ] Functions are single-responsibility and reasonably sized
- [ ] No code duplication (DRY principle followed)
- [ ] Adheres to project coding standards (see docs/coding-standards.md)

## Testing
- [ ] All new code has unit tests with >80% coverage
- [ ] Integration tests for API endpoints and components
- [ ] Tests pass without errors (run npm test)
- [ ] Edge cases and error conditions tested
- [ ] No regressions in existing functionality

## Functionality
- [ ] Implements all acceptance criteria from story
- [ ] Handles user inputs and edge cases correctly
- [ ] UI/UX matches front-end-spec.md where applicable
- [ ] API responses follow expected format and error handling

## Security & Performance
- [ ] No hardcoded secrets or vulnerable patterns
- [ ] Input validation and sanitization
- [ ] Authorization checks for user data (userId matching)
- [ ] Efficient queries (no N+1 problems in Prisma)
- [ ] Page load and interactions are responsive

## Documentation
- [ ] Updated README or relevant docs if needed
- [ ] Inline comments for non-obvious code
- [ ] Story file updated with file list and change log

## Deployment & Compatibility
- [ ] Works with SQLite (default DB)
- [ ] No breaking changes to existing APIs
- [ ] Docker Compose builds and runs without issues

**Overall Decision:** PASS / CONCERNS / FAIL / WAIVED

**Notes:** [Any additional comments or concerns]