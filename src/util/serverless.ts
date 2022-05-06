import { ReturnResHTTPData } from "../DTO/http.dto";
import { HttpErrorException } from "../middleware/error";
import { Event } from "../middleware/type";

export const eventPipe = (event: Event, ...fns: Function[]) => {
  fns = [HttpErrorException, ...fns];
  return fns.reduceRight((x, f) => f(x))(event);
};

export type APIFunction = (event: Event) => Promise<ReturnResHTTPData>;
