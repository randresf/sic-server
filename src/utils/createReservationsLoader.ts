import DataLoader from "dataloader";
import { Reservation } from "../entities/Reservation";

export const createReservationsLoader = () =>
  new DataLoader<{ userId: string }, Reservation | null>(async (keys) => {
    console.log(keys);
    const reservations = await Reservation.find(keys as any);
    const reservationsIdsToUser: Record<string, Reservation> = {};
    reservations.forEach((res) => {
      reservationsIdsToUser[`${res.citizen.id}`] = res;
    });
    console.log(keys, reservationsIdsToUser);
    return keys.map((key) => reservationsIdsToUser[`${key.userId}`]);
  });
