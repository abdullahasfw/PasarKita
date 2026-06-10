import prisma from '../config/database.js';
import { paginate, paginatedResponse } from '../utils/helpers.js';

export async function getNotifications(userId, query) {
  const { page, limit, skip } = paginate(query);

  const where = { userId };
  if (query.unread === 'true') {
    where.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    ...paginatedResponse(notifications, total, page, limit),
    unreadCount,
  };
}

export async function markAsRead(notificationId, userId) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function createNotification(data) {
  return prisma.notification.create({ data });
}
