import { IResponse } from "./IResponse";

export function isValidResponse(response: any): response is IResponse {
  return true;
}
