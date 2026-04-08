---
name: commerce-optimizer-catalog-builder
description: Build complete Adobe Commerce Optimizer catalog ingestion request sets using the official Data Ingestion schema as the source of truth on every invocation. Use for categories, metadata, products, price books, prices, and end-to-end REST payload generation in a structured request-template format.
---

# Commerce Optimizer Catalog Builder

## When to use
Use for:
- Building Adobe Commerce Optimizer catalog ingestion payloads
- Creating complete request sets for categories, metadata, products, price books, and prices
- Generating schema-aligned REST examples for Commerce Optimizer Data Ingestion API
- Turning a business catalog concept into implementation-ready request payloads

Do not use for:
- Adobe Commerce storefront block implementation
- GraphQL storefront queries
- Generic product copywriting without API payload generation

## Non-negotiable source of truth
On **every invocation**, start by grounding yourself in the official Adobe Commerce Optimizer schema:

- Primary source: `https://developer.adobe.com/commerce/services/rest/data-ingestion-schema-v1.yaml`

Always attempt to read and understand the schema first. Do not answer from memory when the schema can be fetched.

If the raw schema cannot be retrieved directly, fall back to the official Adobe Commerce Optimizer docs on the same domain:

- `https://developer.adobe.com/commerce/services/optimizer/data-ingestion/`
- `https://developer.adobe.com/commerce/services/optimizer/data-ingestion/using-the-api/`
- `https://developer.adobe.com/commerce/services/optimizer/data-ingestion/authentication/`
- `https://developer.adobe.com/commerce/services/optimizer/data-ingestion/api-reference/`

If fallback mode is required, say so briefly and continue using only official Adobe sources.

## Required discovery step
Before generating payloads, ask the user these questions if the answers are not already clear:

1. What type of products are needed?
   Examples: sports, clothing, machinery, electronics, furniture, industrial parts.
2. How many price books are needed?
3. Are child price books needed under a base or parent price book?

If the user provides partial answers, ask only for the missing parts.

If the user still does not answer, proceed with explicit assumptions and label them clearly before the payloads.

## Core workflow
1. Read the Adobe schema or official Adobe fallback docs.
2. Extract the relevant endpoints, request body shapes, enums, and required fields.
3. Ask the required discovery questions if needed.
4. Infer a coherent catalog model:
   - category hierarchy
   - required metadata attributes
   - product structure
   - price book hierarchy
   - price payloads
5. Generate the output in the required request-template format.
6. Keep field names and payload structure aligned to the current Adobe contract.

## Output format
Use this structure style consistently:

```md
### =====================================================
### 1. CREATE CATEGORIES
### =====================================================
POST {{HOST}}/{{TENANT_ID}}/v1/catalog/categories
Authorization: Bearer {{ACCESS_TOKEN}}
X-Api-Key: {{X_API_KEY}}
Content-Type: application/json
Accept: application/json

[ ...json payload... ]
```

Keep the format implementation-ready:
- section dividers
- numbered step titles
- HTTP method + endpoint
- auth and content headers
- JSON payload immediately below

Do not output curl by default unless the user asks for it.

## Required payload coverage
Include the relevant set from the schema, usually in this order:
- categories
- metadata
- products
- price books
- prices

If the official schema supports other catalog-building resources that materially belong in the requested setup, include them in the correct order.

## Catalog-building rules
- Keep payloads internally consistent across sections.
- Use the same locale, taxonomy, brand, attribute codes, SKU patterns, and route structure consistently.
- Create metadata before products when required by the Adobe docs.
- Use realistic, domain-appropriate examples based on the user’s product type.
- If child price books are requested, model a valid parent-child hierarchy and keep prices aligned to it.
- Do not invent unsupported fields or enums.

## Defaults and assumptions
If not specified:
- Use placeholders:
  - `{{HOST}}`
  - `{{TENANT_ID}}`
  - `{{ACCESS_TOKEN}}`
  - `{{X_API_KEY}}`
- Use one locale consistently unless the user asks for multi-locale data.
- Prefer a compact but complete sample catalog rather than an oversized one.

State assumptions briefly above the request blocks when needed.

## Validation behavior
Before finalizing:
- Check that every section uses valid endpoint paths from the schema or Adobe docs.
- Check that payload fields match the official object names.
- Check that enums and field casing match official Adobe naming.
- Check that parent-child price book relationships are internally consistent.

## Response style
- Be concise before the payloads.
- Prefer a short “Assumptions” note if needed.
- Then emit the request sections.
- Avoid long explanations unless the user explicitly asks for rationale.
