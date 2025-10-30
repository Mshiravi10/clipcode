# 🔧 Collection Foreign Key Fix

## Problem

When creating or updating snippets, the following error occurred:
```
Invalid `prisma.snippet.create()` invocation: 
Foreign key constraint violated: `Snippet_collectionId_fkey (index)`
```

## Root Cause

The issue occurred when the `collectionId` field was sent as an **empty string** (`""`) instead of `null` or `undefined`. Since `collectionId` is a foreign key that references the `Collection` table, an empty string is not a valid reference.

## Solution

### 1. **Validator Updates** (`lib/validators.ts`)

Added `.transform()` to both `createSnippetSchema` and `updateSnippetSchema` to automatically convert empty strings to `null`:

```typescript
collectionId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === '' || !val ? null : val))
```

This ensures that:
- Empty strings (`""`) → `null`
- Undefined values → `null`
- Valid IDs → kept as-is

### 2. **API Route Validation** (`app/api/snippets/route.ts`)

Added server-side validation to check if the collection exists and belongs to the user:

```typescript
if (data.collectionId) {
    const collection = await prisma.collection.findUnique({
        where: { id: data.collectionId },
    });
    if (!collection) {
        return handleApiError(new Error('Collection not found'));
    }
    if (collection.ownerId !== user.id) {
        return handleApiError(new Error('You do not have permission...'));
    }
}
```

This provides:
- **Better error messages** when a collection doesn't exist
- **Security check** to prevent adding snippets to other users' collections

### 3. **Form Schema Update** (`components/snippet-form.tsx`)

Updated the client-side form schema to transform empty strings:

```typescript
collectionId: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val))
```

And changed the default value from `''` to `undefined`:

```typescript
collectionId: initialData?.collectionId || undefined
```

## Testing

To verify the fix works:

1. **Create snippet without collection:**
   - Leave collection field empty
   - Should save successfully with `collectionId = null`

2. **Create snippet with valid collection:**
   - Select an existing collection
   - Should save successfully with the collection ID

3. **Try invalid collection ID (if manually testing API):**
   - Should receive clear error: "Collection not found"

## Files Modified

- ✅ `apps/web/lib/validators.ts`
- ✅ `apps/web/app/api/snippets/route.ts`
- ✅ `apps/web/components/snippet-form.tsx`
- ✅ `apps/web/app/(dashboard)/snippets/[slug]/edit/page.tsx`

## Benefits

✅ **No more foreign key errors** when creating snippets  
✅ **Better error messages** for invalid collections  
✅ **Security improvement** - users can't add snippets to others' collections  
✅ **Consistent data** - empty values are always `null`, not `""`  

---

**Status:** ✅ Fixed and tested

