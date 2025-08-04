import { db } from "@/lib/db";
import { NotificationType, EntityType } from "@prisma/client";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
  relatedEntityType?: EntityType;
  expiresAt?: Date;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  relatedEntityId,
  relatedEntityType,
  expiresAt,
}: CreateNotificationParams) {
  return db.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      relatedEntityId,
      relatedEntityType,
      expiresAt,
    },
  });
}

export async function createSystemAnnouncement({
  title,
  message,
  userIds,
}: {
  title: string;
  message: string;
  userIds: string[];
}) {
  const notifications = userIds.map((userId) => ({
    userId,
    title,
    message,
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    relatedEntityType: EntityType.SYSTEM,
  }));

  return db.notification.createMany({
    data: notifications,
  });
}

export async function getUserNotifications(userId: string) {
  return db.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUnreadNotificationsCount(userId: string) {
  return db.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

export async function markNotificationAsRead(id: string) {
  return db.notification.update({
    where: {
      id,
    },
    data: {
      read: true,
    },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return db.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

export async function deleteNotification(id: string) {
  return db.notification.delete({
    where: {
      id,
    },
  });
}
