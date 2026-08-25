# Adobe Commerce Storefront End-to-End Test Rules

These instructions apply to every file under `cypress/`. They extend the repository root rules.
The Cypress directory is a separate workspace; run its commands from `cypress/`.

## Environment Selection

This repository has distinct configurations:

- `cypress.paas.config.js` for the PaaS test backend
- `cypress.saas.config.js` for the SaaS/ACO test backend
- `cypress.base.config.js` for shared behavior

Always state which configuration was used. Do not assume a test passing against one backend proves
compatibility with the other.

Standard commands from `cypress/`:

```bash
npm run cypress:run
npm run cypress:saas:run
```

For a focused Chrome run:

```bash
npx cypress run \
  --browser chrome \
  --config-file cypress.paas.config.js \
  --env grepTags=-@skipPaas \
  --spec 'src/tests/e2eTests/example.spec.js'
```

Use the repository's existing tags consistently:

- `@skipPaas`: excluded from PaaS
- `@skipSaas`: excluded from SaaS/ACO
- `@snapPercy`: visual snapshot coverage

Do not remove or invert an environment tag merely to make a failing test disappear. Document the
unsupported environment or fix the underlying contract.

## Test Scope and External State

Classify tests before running them:

| Class | Examples | State expectations |
|---|---|---|
| Read-only smoke | Home, PLP, PDP, search, header, recommendations | No persistent shopper or backend mutation |
| Session state | Cart, store switcher, guest wishlist | Isolated browser/session state; cleanup where supported |
| Account state | Sign-up, login, address, authenticated wishlist | Dedicated non-production test users |
| Transactional | Checkout, order placement, return, gift card | Designated test backend and explicit task authority |
| Authoring/assets | DA/AEM Assets preview, publish, private assets | Correct environment and explicit credentials/authority |

A code-change request does not automatically authorize account creation, order placement, returns,
publishing, or other persistent mutations. Run stateful suites only against the configured test
environment and within the user's requested validation scope.

Never point Cypress at a production Commerce backend for stateful tests.

## Credentials and Fixtures

- Load credentials through environment variables or the established secure CI mechanism.
- Never commit passwords, bearer tokens, private keys, customer tokens, or live payment data.
- Do not print credentials or sensitive API responses in command logs or reporter artifacts.
- Use least-privilege test accounts.
- Make account and transaction fixtures clearly synthetic.
- Keep test SKUs, store codes, order IDs, and gift cards tied to the selected backend configuration.
- Do not copy private credentials from one config into another.
- Redact PII from screenshots, videos, fixtures, and failure output.

When a required secret is absent, skip or fail with a clear infrastructure/configuration message.
Do not replace it with an undocumented personal credential.

## Project-Owned Routes and Content

- Prefer direct, stable project-owned routes for setup.
- Do not depend on demo navigation labels or taxonomy when the route itself is the test subject.
- Keep route fixtures in configuration or shared helpers when multiple specs use them.
- Verify a fixture route returns the expected page type before asserting detailed UI.
- Distinguish fixture/content drift from a drop-in or application regression.
- Do not weaken assertions to accommodate an obsolete fixture; update the fixture or test setup.
- Use `getProductLink()` behavior and lowercase/encoded product routes expected by the storefront.

For author-controlled copy, assert stable semantics, roles, controls, or data contracts rather than
brand copy unless the copy itself is the requirement.

## Route Coverage

For route-critical Commerce changes, cover the affected parts of this matrix:

- Home and global navigation
- Product listing/category page
- Search request, results, filters, and product navigation
- Product detail page, including relevant product types and options
- Add to cart, quantity update, removal, undo, coupons, and gift options as applicable
- Guest checkout and authenticated checkout
- Virtual, zero-total, payment-service, and address-validation paths when applicable
- Authentication and account management
- Guest and authenticated wishlist
- Recommendations
- Store/website switching, locale, and currency
- AEM Assets integration when enabled
- B2B flows only when the corresponding packages/backend features are present
- Error, empty, unauthorized, out-of-stock, and low-stock states

Coverage inventory is not execution evidence. Report the actual specs and tests run.

## Test Design

- Each test should have one clear shopper outcome.
- Use `beforeEach` only for setup genuinely shared by every test in the scope.
- Keep tests independently runnable.
- Avoid relying on execution order or state left by another spec.
- Generate unique test data when persistent records may collide.
- Clean up session or account state when a supported safe cleanup exists.
- Prefer semantic selectors, accessible roles, stable data attributes, and public UI contracts.
- Avoid selectors tied to generated drop-in internals unless the installed drop-in documents them.
- Use block- or component-scoped queries.
- Assert loading completion before interacting.
- Wait on meaningful network aliases or observable UI state rather than arbitrary sleeps.
- Use bounded timeouts only where remote Commerce or content delivery genuinely needs them.
- Do not force clicks to bypass a real visibility, overlay, focus, or disabled-state defect.
- For async Commerce actions, assert both the request/result and the resulting shopper-visible state.
- Test expected errors as first-class outcomes.

Existing tests with older patterns need not be opportunistically rewritten during an unrelated
micro-fix.

## Analytics and Event Tests

When changing events or analytics:

- Verify documented event names and payload shapes.
- Distinguish the in-page drop-in event bus from ACDL/analytics events.
- Assert events are emitted once for one shopper action.
- Verify order when downstream behavior depends on sequence.
- Redact or omit PII, auth data, payment data, and raw backend records.
- Cover re-rendering or repeated initialization when duplicate events are a risk.
- Verify consent behavior where applicable.

## Visual and Responsive Tests

- Use the project viewport list or the block geometry requirements.
- Capture only stable states after fonts, images, and async UI settle.
- Mask or avoid dynamic personal data.
- Treat a Percy/screenshot difference as evidence requiring review, not an automatic defect or pass.
- Keep baseline changes scoped to the intentional visual modification.
- Test focus, zoom, reduced motion, long text, missing optional content, and overflow where relevant.
- Do not update snapshots to hide an unexplained difference.

## Failure Classification

Classify every failure as one of:

1. Application assertion failure
2. Test defect
3. Fixture or authored-content drift
4. Backend/configuration failure
5. Missing credential or authorization
6. Browser/runner infrastructure failure
7. Network or sandbox restriction

A Cypress SIGABRT, browser crash, setup timeout, missing server, or sandbox denial is not a storefront
pass or failure. Preserve the crash output, identify which tests did not execute, and report the
environment.

A direct HTTP probe or manual browser check may supplement a blocked Cypress run, but it does not
replace stateful assertions or count as the unexecuted suite passing.

## Local Server and Browser

- Start the storefront from the repository root with `npm start`.
- Confirm `http://localhost:3000/` is reachable before launching Cypress.
- Avoid starting duplicate local servers.
- Prefer Chrome when the default Electron runner is unstable on the local platform.
- If a runner crash terminates the server, restart it and record the infrastructure issue.
- Do not kill unrelated browser or user processes to recover a test run.

## Artifacts and Reporting

- Keep generated screenshots, videos, coverage, and reports out of commits unless the task requires
  them.
- Do not commit artifacts containing credentials or personal data.
- For each validation pass, report:
  - backend/config;
  - browser and Cypress version;
  - specs and test count;
  - passes, assertion failures, skipped tests, and unexecuted tests;
  - fixture changes;
  - infrastructure blockers;
  - persistent state created.

## Test Change Validation

For Cypress code changes:

1. Run the modified spec in its intended backend configuration.
2. Run closely related specs when shared helpers or fixtures changed.
3. Confirm environment tags behave correctly.
4. Confirm the spec can run independently.
5. Confirm no secrets or sensitive artifacts were added.
6. Run root lint if repository lint includes Cypress files.
7. Run `git diff --check`.
8. Verify route-coverage tooling still recognizes the intended journey.

Do not report a test as fixed based only on static inspection.
