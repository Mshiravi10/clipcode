# clipcode API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication via NextAuth session. Requests must include valid session cookies.

## Response Format

All endpoints return JSON with the following structure:

**Success:**
```json
{
  "data": { ... }
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

## Endpoints

### Snippets

#### List / Search Snippets

```http
GET /api/snippets
```

**Query Parameters:**
- `q` (optional): Search query for full-text search
- `language` (optional): Filter by programming language
- `framework` (optional): Filter by framework
- `tags` (optional, multiple): Filter by tag slugs
- `favorite` (optional): Filter favorites (`true` or `false`)
- `dateFrom` (optional): Filter by creation date (ISO 8601)
- `dateTo` (optional): Filter by creation date (ISO 8601)
- `limit` (optional, default: 20): Number of results per page
- `cursor` (optional): Pagination cursor

**Example Request:**
```bash
curl "http://localhost:3000/api/snippets?q=react&language=typescript&tags=hooks&limit=10"
```

**Response:**
```json
{
  "data": {
    "snippets": [
      {
        "id": "clx...",
        "title": "React Custom Hook",
        "slug": "react-custom-hook",
        "language": "typescript",
        "framework": "React",
        "description": "Custom hook for...",
        "code": "...",
        "isFavorite": false,
        "usageCount": 5,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "owner": {
          "id": "user_id",
          "name": "John Doe",
          "image": "https://..."
        },
        "collection": null,
        "tags": [
          {
            "tag": {
              "id": "tag_id",
              "name": "Hooks",
              "slug": "hooks"
            }
          }
        ]
      }
    ],
    "nextCursor": "clx...",
    "total": 42
  }
}
```

#### Create Snippet

```http
POST /api/snippets
```

**Request Body:**
```json
{
  "title": "React Custom Hook",
  "language": "typescript",
  "framework": "React",
  "description": "Custom hook for managing state",
  "code": "export function useCustomHook() { ... }",
  "placeholders": ["HookName", "StateType"],
  "tags": ["react", "hooks", "typescript"],
  "collectionId": "collection_id"
}
```

**Validation Rules:**
- `title`: Required, 1-200 characters
- `language`: Required
- `framework`: Optional
- `description`: Optional, max 1000 characters
- `code`: Required
- `placeholders`: Optional array of strings
- `tags`: Optional array of tag slugs
- `collectionId`: Optional

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "title": "React Custom Hook",
    "slug": "react-custom-hook",
    ...
  }
}
```

#### Get Snippet

```http
GET /api/snippets/:id
```

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "title": "React Custom Hook",
    ...
  }
}
```

#### Update Snippet

```http
PUT /api/snippets/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "isFavorite": true
}
```

All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "title": "Updated Title",
    ...
  }
}
```

#### Delete Snippet

```http
DELETE /api/snippets/:id
```

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

#### Copy Snippet (Increment Usage)

```http
POST /api/snippets/:id/copy
```

Increments the `usageCount` field. Use this when user copies code to clipboard.

**Response:**
```json
{
  "data": {
    "usageCount": 6
  }
}
```

### Favorites

#### Toggle Favorite

```http
POST /api/favorite/:id
```

Toggles favorite status for a snippet.

**Response:**
```json
{
  "data": {
    "isFavorite": true
  }
}
```

### Tags

#### List Tags

```http
GET /api/tags
```

**Response:**
```json
{
  "data": [
    {
      "id": "tag_id",
      "name": "React",
      "slug": "react"
    }
  ]
}
```

### Statistics

#### Get Dashboard Stats

```http
GET /api/stats
```

**Response:**
```json
{
  "data": {
    "totalSnippets": 42,
    "favoriteCount": 8,
    "topLanguages": [
      { "language": "typescript", "count": 15 },
      { "language": "javascript", "count": 12 }
    ],
    "topTags": [
      { "id": "...", "name": "React", "slug": "react", "count": 10 }
    ],
    "mostUsed": [
      {
        "id": "...",
        "title": "JWT Auth",
        "slug": "jwt-auth",
        "usageCount": 25,
        "language": "typescript"
      }
    ],
    "recentActivity": [
      {
        "id": "...",
        "action": "CREATED_SNIPPET",
        "entity": "SNIPPET",
        "entityId": "...",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Import

#### Import Snippets

```http
POST /api/import
Content-Type: multipart/form-data
```

**Request:**
- Form field: `file` (JSON or Markdown file)

**JSON Format:**
```json
{
  "snippets": [
    {
      "title": "Snippet Title",
      "language": "typescript",
      "framework": "React",
      "description": "Description",
      "code": "...",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

**Markdown Format:**
```markdown
---
title: Snippet Title
language: typescript
framework: React
description: Description
tags: [tag1, tag2]
---

```typescript
// code here
```
```

**Response:**
```json
{
  "data": {
    "imported": 5,
    "skipped": 1,
    "snippets": [ ... ]
  }
}
```

### Export

#### Export Snippets

```http
POST /api/export
```

**Request Body:**
```json
{
  "format": "json",
  "snippetIds": ["id1", "id2"]
}
```

- `format`: `"json"` or `"markdown"`
- `snippetIds`: Optional array. If omitted, exports all user snippets.

**Response:**
Downloads file with `Content-Disposition: attachment` header.

**JSON Export:**
```json
{
  "snippets": [ ... ],
  "exportedAt": "2025-01-01T00:00:00.000Z",
  "count": 10
}
```

**Markdown Export:**
```markdown
---
title: Snippet 1
language: typescript
...
---

```typescript
// code
```

---

---
title: Snippet 2
...
```

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production.

## Pagination

The API uses cursor-based pagination:

1. Initial request: `GET /api/snippets?limit=20`
2. Response includes `nextCursor` if more results exist
3. Next page: `GET /api/snippets?limit=20&cursor=clx...`

## Examples

### Create and Copy a Snippet

```bash
curl -X POST http://localhost:3000/api/snippets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World",
    "language": "javascript",
    "code": "console.log('Hello, World!');"
  }'

SNIPPET_ID="clx..."

curl -X POST http://localhost:3000/api/snippets/$SNIPPET_ID/copy
```

### Search with Multiple Filters

```bash
curl "http://localhost:3000/api/snippets?\
q=authentication&\
language=typescript&\
tags=api&\
tags=security&\
favorite=true&\
limit=10"
```

### Export All Snippets as Markdown

```bash
curl -X POST http://localhost:3000/api/export \
  -H "Content-Type: application/json" \
  -d '{"format": "markdown"}' \
  -o snippets.md
```

## Client Libraries

Use standard HTTP clients:

**JavaScript/TypeScript:**
```typescript
const response = await fetch('/api/snippets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '...', code: '...' })
});
const { data } = await response.json();
```

**With React Query:**
```typescript
const { data } = useQuery({
  queryKey: ['snippets', filters],
  queryFn: () => fetch('/api/snippets?' + params).then(r => r.json())
});
```

## Audit Logging

All mutations are automatically logged to the `AuditLog` table with:
- `userId`: Who performed the action
- `action`: What was done (e.g., `CREATED_SNIPPET`)
- `entity`: Type of entity (e.g., `SNIPPET`)
- `entityId`: ID of the affected entity
- `meta`: Additional JSON metadata
- `createdAt`: Timestamp

Query audit logs via database directly or build an admin endpoint.


