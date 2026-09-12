import { v7 as uuid } from "uuid";

export const newRoomId = (): string => uuid();
export const newHostKey = (): string => uuid();
export const newMessageId = (): string => uuid();
