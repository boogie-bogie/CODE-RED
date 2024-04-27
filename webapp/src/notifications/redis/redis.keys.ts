export const RedisKeys = {
  disasterStream: (area: string) => `disasterStream:${area}`,
  userLocationsStream: (area: string) => `user-locationsStream:${area}`,
  disasterData: (id: string) => `disasterData#${id}`,
  userLocationCache: (userId?: number, client_id?: string) =>
    `user:location:${userId || client_id}`,
  userAreaCache: (userId?: number, client_id?: string) =>
    `user:area:${userId || client_id}`,
  userNotificationsCache: (userId?: number, client_id?: string) =>
    `user:notifications:${userId || client_id}`,
  lastTimestamp: (streamKey: string) => `${streamKey}:lastTimestamp`,
};
