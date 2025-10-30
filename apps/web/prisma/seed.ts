import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'john@example.com' },
            update: {},
            create: {
                email: 'john@example.com',
                name: 'John Doe',
                image: 'https://i.pravatar.cc/150?u=john',
            },
        }),
        prisma.user.upsert({
            where: { email: 'jane@example.com' },
            update: {},
            create: {
                email: 'jane@example.com',
                name: 'Jane Smith',
                image: 'https://i.pravatar.cc/150?u=jane',
            },
        }),
        prisma.user.upsert({
            where: { email: 'bob@example.com' },
            update: {},
            create: {
                email: 'bob@example.com',
                name: 'Bob Johnson',
                image: 'https://i.pravatar.cc/150?u=bob',
            },
        }),
    ]);

    console.log(`✓ Created ${users.length} users`);

    const tags = await Promise.all([
        prisma.tag.upsert({
            where: { slug: 'database' },
            update: {},
            create: { name: 'Database', slug: 'database' },
        }),
        prisma.tag.upsert({
            where: { slug: 'api' },
            update: {},
            create: { name: 'API', slug: 'api' },
        }),
        prisma.tag.upsert({
            where: { slug: 'authentication' },
            update: {},
            create: { name: 'Authentication', slug: 'authentication' },
        }),
        prisma.tag.upsert({
            where: { slug: 'graphql' },
            update: {},
            create: { name: 'GraphQL', slug: 'graphql' },
        }),
        prisma.tag.upsert({
            where: { slug: 'react' },
            update: {},
            create: { name: 'React', slug: 'react' },
        }),
        prisma.tag.upsert({
            where: { slug: 'typescript' },
            update: {},
            create: { name: 'TypeScript', slug: 'typescript' },
        }),
        prisma.tag.upsert({
            where: { slug: 'dotnet' },
            update: {},
            create: { name: '.NET', slug: 'dotnet' },
        }),
        prisma.tag.upsert({
            where: { slug: 'entity-framework' },
            update: {},
            create: { name: 'Entity Framework', slug: 'entity-framework' },
        }),
        prisma.tag.upsert({
            where: { slug: 'sql' },
            update: {},
            create: { name: 'SQL', slug: 'sql' },
        }),
        prisma.tag.upsert({
            where: { slug: 'hooks' },
            update: {},
            create: { name: 'Hooks', slug: 'hooks' },
        }),
    ]);

    console.log(`✓ Created ${tags.length} tags`);

    const collections = await Promise.all([
        prisma.collection.upsert({
            where: { slug: 'backend-patterns' },
            update: {},
            create: {
                name: 'Backend Patterns',
                slug: 'backend-patterns',
                ownerId: users[0].id,
            },
        }),
        prisma.collection.upsert({
            where: { slug: 'frontend-utilities' },
            update: {},
            create: {
                name: 'Frontend Utilities',
                slug: 'frontend-utilities',
                ownerId: users[1].id,
            },
        }),
    ]);

    console.log(`✓ Created ${collections.length} collections`);

    const snippets = await Promise.all([
        prisma.snippet.create({
            data: {
                title: 'EF Core Pagination',
                slug: 'ef-core-pagination',
                language: 'csharp',
                framework: 'Entity Framework',
                description: 'Generic pagination extension method for EF Core queries',
                code: `public static async Task<PagedResult<T>> ToPagedAsync<T>(
    this IQueryable<T> query,
    int page,
    int pageSize)
{
    var count = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
    
    return new PagedResult<T>
    {
        Items = items,
        TotalCount = count,
        Page = page,
        PageSize = pageSize
    };
}`,
                placeholders: JSON.stringify(['T']),
                ownerId: users[0].id,
                collectionId: collections[0].id,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'database' } } },
                        { tag: { connect: { slug: 'dotnet' } } },
                        { tag: { connect: { slug: 'entity-framework' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'GraphQL Query Template',
                slug: 'graphql-query-template',
                language: 'graphql',
                description: 'Standard GraphQL query with variables and fragments',
                code: `query GetEntityName($id: ID!) {
  entityName(id: $id) {
    ...EntityNameFields
  }
}

fragment EntityNameFields on EntityName {
  id
  createdAt
  updatedAt
}`,
                placeholders: JSON.stringify(['EntityName', 'entityName']),
                ownerId: users[0].id,
                usageCount: 5,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'graphql' } } },
                        { tag: { connect: { slug: 'api' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'ServiceResponse Pattern',
                slug: 'service-response-pattern',
                language: 'csharp',
                framework: '.NET',
                description: 'Generic service response wrapper with success/error handling',
                code: `public class ServiceResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Error { get; set; }
    
    public static ServiceResponse<T> Ok(T data) => new()
    {
        Success = true,
        Data = data
    };
    
    public static ServiceResponse<T> Fail(string error) => new()
    {
        Success = false,
        Error = error
    };
}`,
                placeholders: JSON.stringify(['T']),
                ownerId: users[0].id,
                collectionId: collections[0].id,
                usageCount: 12,
                isFavorite: true,
                tags: {
                    create: [{ tag: { connect: { slug: 'dotnet' } } }],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'React Custom Hook useDebounce',
                slug: 'react-custom-hook-usedebounce',
                language: 'typescript',
                framework: 'React',
                description: 'Custom hook for debouncing values',
                code: `import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
                placeholders: JSON.stringify(['T']),
                ownerId: users[1].id,
                collectionId: collections[1].id,
                usageCount: 8,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'react' } } },
                        { tag: { connect: { slug: 'typescript' } } },
                        { tag: { connect: { slug: 'hooks' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'SQL Complex Join Query',
                slug: 'sql-complex-join-query',
                language: 'sql',
                description: 'Multi-table join with aggregation',
                code: `SELECT 
    u.id,
    u.name,
    COUNT(DISTINCT o.id) as order_count,
    SUM(oi.quantity * oi.price) as total_spent,
    MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE u.status = 'active'
    AND o.created_at >= NOW() - INTERVAL '1 year'
GROUP BY u.id, u.name
HAVING COUNT(DISTINCT o.id) > 0
ORDER BY total_spent DESC
LIMIT 100;`,
                ownerId: users[2].id,
                usageCount: 3,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'sql' } } },
                        { tag: { connect: { slug: 'database' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'JWT Token Validation',
                slug: 'jwt-token-validation',
                language: 'typescript',
                framework: 'Node.js',
                description: 'Middleware for validating JWT tokens',
                code: `import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export async function validateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}`,
                ownerId: users[0].id,
                usageCount: 15,
                isFavorite: true,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'authentication' } } },
                        { tag: { connect: { slug: 'api' } } },
                        { tag: { connect: { slug: 'typescript' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'React useLocalStorage Hook',
                slug: 'react-uselocalstorage-hook',
                language: 'typescript',
                framework: 'React',
                description: 'Custom hook for syncing state with localStorage',
                code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}`,
                placeholders: JSON.stringify(['T']),
                ownerId: users[1].id,
                collectionId: collections[1].id,
                usageCount: 6,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'react' } } },
                        { tag: { connect: { slug: 'typescript' } } },
                        { tag: { connect: { slug: 'hooks' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'LINQ GroupBy and Aggregate',
                slug: 'linq-groupby-and-aggregate',
                language: 'csharp',
                framework: '.NET',
                description: 'Complex LINQ query with grouping and aggregation',
                code: `var result = orders
    .Where(o => o.Status == OrderStatus.Completed)
    .GroupBy(o => new { o.CustomerId, o.ProductId })
    .Select(g => new
    {
        CustomerId = g.Key.CustomerId,
        ProductId = g.Key.ProductId,
        TotalQuantity = g.Sum(o => o.Quantity),
        TotalAmount = g.Sum(o => o.Amount),
        OrderCount = g.Count(),
        AverageAmount = g.Average(o => o.Amount),
        LastOrderDate = g.Max(o => o.OrderDate)
    })
    .OrderByDescending(x => x.TotalAmount)
    .Take(100)
    .ToList();`,
                ownerId: users[0].id,
                collectionId: collections[0].id,
                usageCount: 4,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'dotnet' } } },
                        { tag: { connect: { slug: 'database' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'API Error Handler Middleware',
                slug: 'api-error-handler-middleware',
                language: 'typescript',
                framework: 'Express',
                description: 'Centralized error handling middleware',
                code: `import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error('ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}`,
                ownerId: users[2].id,
                usageCount: 7,
                isFavorite: true,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'api' } } },
                        { tag: { connect: { slug: 'typescript' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'React Form with Validation',
                slug: 'react-form-with-validation',
                language: 'typescript',
                framework: 'React',
                description: 'Form component with react-hook-form and zod validation',
                code: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type FormData = z.infer<typeof schema>;

export function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Sign Up</button>
    </form>
  );
}`,
                ownerId: users[1].id,
                collectionId: collections[1].id,
                usageCount: 10,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'react' } } },
                        { tag: { connect: { slug: 'typescript' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'PostgreSQL Full-Text Search',
                slug: 'postgresql-full-text-search',
                language: 'sql',
                description: 'Full-text search with ranking and highlighting',
                code: `SELECT 
    id,
    title,
    ts_rank(tsv, query) AS rank,
    ts_headline('english', content, query, 'MaxWords=50') AS snippet
FROM documents,
     to_tsquery('english', 'database & search') AS query
WHERE tsv @@ query
ORDER BY rank DESC
LIMIT 20;`,
                ownerId: users[2].id,
                usageCount: 2,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'sql' } } },
                        { tag: { connect: { slug: 'database' } } },
                    ],
                },
            },
        }),
        prisma.snippet.create({
            data: {
                title: 'API Rate Limiter',
                slug: 'api-rate-limiter',
                language: 'typescript',
                framework: 'Node.js',
                description: 'Simple in-memory rate limiter middleware',
                code: `import { Request, Response, NextFunction } from 'express';

const requests = new Map<string, number[]>();

export function rateLimiter(
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);
    next();
  };
}`,
                placeholders: JSON.stringify(['maxRequests', 'windowMs']),
                ownerId: users[0].id,
                collectionId: collections[0].id,
                usageCount: 9,
                tags: {
                    create: [
                        { tag: { connect: { slug: 'api' } } },
                        { tag: { connect: { slug: 'typescript' } } },
                    ],
                },
            },
        }),
    ]);

    console.log(`✓ Created ${snippets.length} snippets`);

    await prisma.auditLog.create({
        data: {
            action: 'SEED_DATABASE',
            entity: 'SYSTEM',
            meta: JSON.stringify({
                users: users.length,
                tags: tags.length,
                collections: collections.length,
                snippets: snippets.length,
            }),
        },
    });

    console.log('✅ Seeding completed!');
}

main()
    .catch(e => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

