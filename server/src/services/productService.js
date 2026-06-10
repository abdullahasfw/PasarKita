import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, paginatedResponse, calculateDistance, generateSlug } from '../utils/helpers.js';

export async function getProducts(query) {
  const { page, limit, skip } = paginate(query);

  const where = { status: 'ACTIVE' };

  // Category filter
  if (query.category) {
    where.category = { slug: query.category };
  }

  // Price filter
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
    if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
  }

  // Condition filter
  if (query.condition) {
    where.condition = query.condition;
  }

  // Full-text search
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }

  // Sorting
  let orderBy = { createdAt: 'desc' };
  switch (query.sort) {
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        auction: { select: { id: true, status: true, currentPrice: true, endTime: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Distance-based filtering and sorting
  let result = products;
  if (query.latitude && query.longitude) {
    const lat = parseFloat(query.latitude);
    const lng = parseFloat(query.longitude);
    const radius = parseFloat(query.radius) || 50; // default 50km

    result = products
      .map(p => ({
        ...p,
        distance: calculateDistance(lat, lng, p.latitude, p.longitude),
      }))
      .filter(p => p.distance <= radius);

    if (query.sort === 'nearest') {
      result.sort((a, b) => a.distance - b.distance);
    }
  }

  return paginatedResponse(result, total, page, limit);
}

export async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
          phone: true,
          address: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          _count: { select: { products: true, reviewsReceived: true } },
        },
      },
      auction: {
        include: {
          bids: {
            orderBy: { amount: 'desc' },
            take: 10,
            include: { bidder: { select: { id: true, name: true, avatar: true } } },
          },
        },
      },
      reviews: {
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  return product;
}

export async function createProduct(sellerId, data, files) {
  let slug = generateSlug(data.name);

  // Check slug uniqueness
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: parseFloat(data.price),
      condition: data.condition || 'new',
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      address: data.address,
      sellerId,
      categoryId: data.categoryId,
      images: files && files.length > 0 ? {
        create: files.map((file, index) => ({
          url: `/uploads/products/${file.filename}`,
          isPrimary: index === 0,
        })),
      } : undefined,
    },
    include: {
      images: true,
      category: true,
      seller: { select: { id: true, name: true } },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'Product',
      entityId: product.id,
      userId: sellerId,
      details: { name: product.name },
    },
  });

  return product;
}

export async function updateProduct(productId, userId, userRole, data) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  if (product.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Anda tidak memiliki akses untuk mengubah produk ini', 403);
  }

  const updateData = { ...data };
  if (data.price) updateData.price = parseFloat(data.price);
  if (data.latitude) updateData.latitude = parseFloat(data.latitude);
  if (data.longitude) updateData.longitude = parseFloat(data.longitude);

  if (data.name && data.name !== product.name) {
    let slug = generateSlug(data.name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug && existingSlug.id !== productId) {
      slug = `${slug}-${Date.now()}`;
    }
    updateData.slug = slug;
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: {
      images: true,
      category: true,
    },
  });

  return updated;
}

export async function deleteProduct(productId, userId, userRole) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  if (product.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Anda tidak memiliki akses untuk menghapus produk ini', 403);
  }

  await prisma.product.delete({ where: { id: productId } });

  await prisma.auditLog.create({
    data: {
      action: 'DELETE',
      entity: 'Product',
      entityId: productId,
      userId,
      details: { name: product.name },
    },
  });
}

export async function uploadProductImages(productId, userId, files) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  if (product.sellerId !== userId) {
    throw new AppError('Anda tidak memiliki akses', 403);
  }

  const existingImages = await prisma.productImage.count({ where: { productId } });

  const images = await Promise.all(
    files.map((file, index) =>
      prisma.productImage.create({
        data: {
          url: `/uploads/products/${file.filename}`,
          isPrimary: existingImages === 0 && index === 0,
          productId,
        },
      })
    )
  );

  return images;
}

export async function getMapProducts(query) {
  const lat = parseFloat(query.latitude);
  const lng = parseFloat(query.longitude);
  const radius = parseFloat(query.radius) || 50;

  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      latitude: true,
      longitude: true,
      condition: true,
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
      seller: { select: { name: true } },
      auction: { select: { status: true, currentPrice: true } },
    },
  });

  if (lat && lng) {
    return products
      .map(p => ({
        ...p,
        distance: calculateDistance(lat, lng, p.latitude, p.longitude),
      }))
      .filter(p => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  return products;
}

export async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
}
