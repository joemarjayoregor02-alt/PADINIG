import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { parseIntParam } from '../lib/query.js';
import { ok, fail } from '../lib/responses.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth, requireRole(['ADMIN']));

router.get('/', async (req, res, next) => {
  try {
    const page = parseIntParam(req.query.page, 1, { min: 1 });
    const pageSize = parseIntParam(req.query.pageSize, 20, { min: 1, max: 100 });
    const skip = (page - 1) * pageSize;

    const role = typeof req.query.role === 'string' ? req.query.role : undefined;
    const isActive =
      req.query.isActive === undefined ? undefined : req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const where = {
      ...(role ? { role } : {}),
      ...(isActive === undefined ? {} : { isActive }),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { purok: { contains: q } },
              { contactNumber: { contains: q } },
            ],
          }
        : {}),
    } as const;

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          purok: true,
          contactNumber: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return res.json(ok({ items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) }));
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        purok: true,
        contactNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return res.status(404).json(fail('User not found', { code: 'NOT_FOUND' }));
    return res.json(ok(user));
  } catch (err) {
    return next(err);
  }
});

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['ADMIN', 'RESIDENT']).optional(),
});

router.patch('/:id', validateBody(patchSchema), async (req, res, next) => {
  try {
    const id = req.params.id;
    const { isActive, role } = req.body as z.infer<typeof patchSchema>;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(isActive === undefined ? {} : { isActive }),
        ...(role ? { role } : {}),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        purok: true,
        contactNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(ok(updated));
  } catch (err) {
    return next(err);
  }
});

export default router;

