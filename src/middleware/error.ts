import { HttpException } from "../exception/http.exception";

export function HttpErrorException(
  _: any,
  __: string,
  desc: PropertyDescriptor,
) {
  const originMethod = desc.value;

  desc.value = async function (...args: any[]) {
    try {
      const result = await originMethod.apply(this, args);
      return result;
    } catch (e) {
      if (e instanceof HttpException) {
        return e.createRes();
      } else {
        throw e;
      }
    }
  };
}
