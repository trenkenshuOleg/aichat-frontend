import { ISession } from "../ws/types";

export const isSession = (data: string | ISession): data is ISession => {
  return typeof data !== 'string'
}
