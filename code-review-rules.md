# Code Review Rules and Guidelines

This file defines the rules and guidelines for automated code reviews. Customize these rules based on your team's standards and project requirements.

---

## Review Objectives

The code review should evaluate the following areas with specific focus and severity levels:

### 1. Critical Issues (Severity: HIGH)

These issues **MUST** be addressed before merging:

#### Security Vulnerabilities
- **SQL Injection**: Check for unsanitized database queries
- **XSS (Cross-Site Scripting)**: Verify proper input sanitization and output encoding
- **CSRF (Cross-Site Request Forgery)**: Ensure CSRF tokens are implemented
- **Authentication & Authorization**: Verify proper access controls and permission checks
- **Sensitive Data Exposure**: Check for hardcoded credentials, API keys, or secrets
- **Insecure Dependencies**: Flag outdated libraries with known vulnerabilities
- **Path Traversal**: Verify file path validation
- **Command Injection**: Check for unsanitized shell command execution
- **Insecure Deserialization**: Review data deserialization processes
- **XML External Entity (XXE)**: Check XML parsing for external entity injection

#### Critical Bugs
- **Null Pointer/Undefined Errors**: Check for potential null/undefined references
- **Race Conditions**: Identify potential concurrency issues
- **Memory Leaks**: Look for unclosed resources, circular references
- **Infinite Loops**: Verify loop termination conditions
- **Data Loss**: Check for operations that could cause data corruption or loss
- **Error Handling**: Ensure critical operations have proper error handling

---

### 2. Important Issues (Severity: MEDIUM)

These issues should be addressed but may not block the merge:

#### Performance Concerns
- **Inefficient Algorithms**: Flag O(n²) or worse when better alternatives exist
- **N+1 Query Problems**: Identify database query patterns that can be optimized
- **Unnecessary Loops**: Check for redundant iterations
- **Large Object Copies**: Look for unnecessary deep copies of large data structures
- **Synchronous Operations**: Identify blocking operations that should be async
- **Resource-Intensive Operations**: Check for operations in loops that could be cached
- **Memory Usage**: Flag potential excessive memory consumption
- **Database Indexing**: Verify proper index usage in queries

#### Code Quality
- **Code Duplication**: Identify duplicated logic that should be extracted
- **Function Length**: Flag functions longer than 50 lines (configurable)
- **Complexity**: Warn about high cyclomatic complexity (> 10)
- **Magic Numbers**: Check for hardcoded values that should be constants
- **Inconsistent Naming**: Verify naming conventions are followed
- **Missing Documentation**: Flag complex functions without comments/docstrings
- **Dead Code**: Identify unused variables, imports, or functions
- **Nested Conditionals**: Warn about deeply nested if/else statements (> 3 levels)

#### API & Interface Design
- **Breaking Changes**: Identify changes that break backward compatibility
- **Inconsistent APIs**: Check for inconsistent parameter ordering or naming
- **Missing Validation**: Verify input validation on public APIs
- **Poor Abstractions**: Identify leaky abstractions or tight coupling

---

### 3. Best Practices (Severity: LOW)

These are recommendations for improvement:

#### Design Patterns
- **SOLID Principles**: Check adherence to Single Responsibility, Open/Closed, etc.
- **DRY (Don't Repeat Yourself)**: Suggest refactoring for repeated code
- **KISS (Keep It Simple)**: Recommend simplification of overly complex logic
- **Separation of Concerns**: Verify proper layering and modularity
- **Dependency Injection**: Suggest DI where appropriate for testability

#### Maintainability
- **Readability**: Suggest improvements for code clarity
- **Consistent Formatting**: Check for style consistency (handled by linters)
- **Meaningful Names**: Verify descriptive variable and function names
- **Small Functions**: Encourage single-purpose functions
- **Comments**: Suggest comments for complex business logic
- **Test Coverage**: Recommend tests for untested code paths

#### Language-Specific Best Practices
See language-specific sections below for detailed guidelines.

---

## Language-Specific Rules

### JavaScript/TypeScript

#### Must Check
- **Type Safety** (TypeScript): Avoid `any` types, use proper interfaces
- **Async/Await**: Prefer async/await over promise chains
- **Error Handling**: Always catch promise rejections
- **Strict Mode**: Ensure strict mode is enabled
- **Const/Let**: Use `const` by default, `let` when needed, never `var`
- **Arrow Functions**: Use arrow functions for callbacks to preserve `this`
- **Template Literals**: Use template literals instead of string concatenation
- **Destructuring**: Utilize destructuring for cleaner code
- **Optional Chaining**: Use `?.` for null-safe property access
- **Nullish Coalescing**: Prefer `??` over `||` for default values

#### Common Issues
- **Memory Leaks**: Check for unremoved event listeners
- **Callback Hell**: Suggest async/await for nested callbacks
- **Mutating State**: Warn about direct state mutations (React/Redux)
- **Missing Dependencies**: Check useEffect/useCallback dependency arrays (React)

### Python

#### Must Check
- **Type Hints**: Encourage type annotations for function signatures
- **PEP 8**: Follow Python style guide
- **Exception Handling**: Use specific exception types, avoid bare `except:`
- **Context Managers**: Use `with` statements for file/resource handling
- **List Comprehensions**: Prefer comprehensions over map/filter for simple cases
- **String Formatting**: Use f-strings for string interpolation
- **Pathlib**: Use `pathlib` instead of `os.path`
- **Dataclasses**: Use dataclasses for data containers
- **Type Checking**: Avoid mutable default arguments

#### Common Issues
- **Global Variables**: Minimize global state
- **Import Order**: Follow standard import ordering (stdlib, third-party, local)
- **Docstrings**: Include docstrings for public functions and classes
- **Virtual Environments**: Ensure dependencies are properly specified

### Java

#### Must Check
- **Null Safety**: Check for potential NullPointerExceptions
- **Resource Management**: Use try-with-resources for AutoCloseable
- **Generics**: Avoid raw types, use proper generic types
- **Exceptions**: Don't catch generic Exception unless necessary
- **Immutability**: Prefer immutable objects where possible
- **Stream API**: Use streams for collection operations (Java 8+)
- **Optional**: Use Optional instead of null returns where appropriate
- **Serialization**: Be cautious with Serializable objects

#### Common Issues
- **String Concatenation**: Use StringBuilder for loops
- **Equality**: Override equals() and hashCode() together
- **Thread Safety**: Check synchronization for shared mutable state
- **Memory Leaks**: Verify cache implementations have proper eviction

### Go

#### Must Check
- **Error Handling**: Always check error returns
- **Defer**: Use defer for cleanup operations
- **Goroutine Leaks**: Ensure goroutines can exit properly
- **Context**: Use context for cancellation and timeouts
- **Mutex**: Proper synchronization for shared state
- **Interfaces**: Keep interfaces small and focused
- **Nil Checks**: Verify nil pointer checks
- **Buffer Sizes**: Check channel buffer sizes are appropriate

#### Common Issues
- **Error Wrapping**: Use fmt.Errorf with %w for error wrapping
- **Shadowing**: Watch for variable shadowing with :=
- **Pointers**: Use pointers appropriately for large structs
- **JSON Tags**: Verify JSON tags for exported fields

### Python/Django

#### Must Check
- **ORM N+1**: Use select_related/prefetch_related appropriately
- **SQL Injection**: Use parameterized queries, avoid raw SQL
- **CSRF Protection**: Ensure CSRF tokens in forms
- **Authentication**: Verify @login_required decorators
- **Migrations**: Check for proper migration files
- **Settings**: No secrets in settings.py, use environment variables
- **QuerySet Evaluation**: Be aware of when QuerySets are evaluated
- **Transactions**: Use transaction.atomic for data consistency

### React

#### Must Check
- **Keys**: Proper key props in lists
- **State Updates**: Use functional updates for state based on previous state
- **Effect Dependencies**: Complete dependency arrays in useEffect
- **Prop Types**: Define PropTypes or TypeScript interfaces
- **Memoization**: Use useMemo/useCallback for expensive operations
- **Component Size**: Keep components focused and small
- **Hooks Rules**: Follow hooks rules (top level, React functions only)
- **Accessibility**: Include ARIA attributes where needed

---

## Testing Requirements

### Unit Tests
- New functions should have corresponding unit tests
- Edge cases should be tested
- Mocking should be used appropriately
- Test coverage should not decrease

### Integration Tests
- API endpoints should have integration tests
- Database operations should be tested
- External service integrations should have tests

### Security Tests
- Input validation should be tested
- Authentication/authorization should be tested
- Rate limiting should be verified

---

## Documentation Requirements

### Code Comments
- Complex algorithms should be explained
- Non-obvious business logic should be documented
- TODOs should include issue references
- API endpoints should have descriptions

### README Updates
- New features should be documented in README
- Setup instructions should be updated if changed
- Configuration options should be documented

### API Documentation
- Public APIs should have complete documentation
- Request/response formats should be specified
- Error codes should be documented

---

## File and Structure Guidelines

### File Size
- Files should generally be under 500 lines
- Consider splitting large files into modules
- Each file should have a single, clear purpose

### Directory Structure
- Follow project conventions consistently
- Keep related files together
- Separate concerns (models, views, controllers, etc.)

### Imports/Dependencies
- Remove unused imports
- Order imports consistently
- Avoid circular dependencies
- Pin dependency versions

---

## Commit Message Guidelines

Good commits should:
- Have clear, descriptive messages
- Reference issue numbers where applicable
- Separate concerns into different commits
- Have atomic changes (one logical change per commit)

---

## Custom Rules for This Project

[Add your project-specific rules here]

### Example:
```
- All API responses must follow the standard envelope format
- Database migrations must be reviewed by a DBA
- All user-facing strings must support i18n
- Error messages must not expose internal implementation details
- All async operations must have timeout handling
```

---

## Exclusions

The following should **NOT** be flagged:

- Test files with longer functions (setup/teardown)
- Generated code (migrations, protobuf, etc.)
- Third-party library code
- Configuration files
- Documentation files (unless they contain code examples)

---

## Review Output Format

The code review should be structured as follows:

```markdown
## Code Review Summary

**Overall Assessment**: [APPROVE / REQUEST CHANGES / COMMENT]

### Critical Issues (🔴 Must Fix)
[List all severity: HIGH issues]

### Important Issues (🟡 Should Fix)
[List all severity: MEDIUM issues]

### Suggestions (🟢 Nice to Have)
[List all severity: LOW issues]

### Positive Observations
[Highlight good practices and improvements]

### Security Analysis
[Dedicated section for security findings]

### Performance Analysis
[Dedicated section for performance concerns]

### Test Coverage
[Comments on test coverage and quality]

---

### Detailed File Reviews

#### `path/to/file.py`
**Lines X-Y**: Issue description and recommendation
**Lines A-B**: Another issue or positive observation

[Repeat for each file with findings]
```

---

## Severity Definitions

- **🔴 CRITICAL (HIGH)**: Security vulnerabilities, data loss risks, critical bugs that could break production
- **🟡 IMPORTANT (MEDIUM)**: Performance issues, code quality problems, maintainability concerns
- **🟢 SUGGESTION (LOW)**: Best practice recommendations, style improvements, minor optimizations

---

## Review Philosophy

1. **Be Constructive**: Focus on improvement, not criticism
2. **Be Specific**: Point to exact lines and provide examples
3. **Explain Why**: Don't just say what's wrong, explain the impact
4. **Suggest Solutions**: Offer concrete alternatives
5. **Recognize Good Work**: Highlight well-written code and good practices
6. **Consider Context**: Understand the trade-offs made by the developer
7. **Prioritize**: Focus on high-impact issues first
8. **Be Consistent**: Apply rules uniformly across all reviews

---

## Notes for Reviewers (AI)

- Always reference specific line numbers or file paths when giving feedback
- Provide code examples for suggested improvements
- Balance critique with positive feedback
- Consider the PR scope - don't suggest massive rewrites outside the PR's purpose
- Be aware of false positives - use judgment
- If uncertain about an issue, frame it as a question rather than a statement
- Respect the codebase's existing patterns unless they're clearly problematic
