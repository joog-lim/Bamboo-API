import { getVerifyQuestion } from "../../src/handler";
import { baseRequest } from "../dummy.data";

describe("Test the get verify question", () => {
  test("It should be statudCode is 200", async () => {
    const result = await getVerifyQuestion(baseRequest);
    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 200,
      }),
    );
  });

  test("It should be id matches regex", async () => {
    const result = await getVerifyQuestion(baseRequest);
    const idRegex = /^[a-z0-9]+\-([a-z0-9]{4}\-){3}[a-z0-9]+$/;
    expect(idRegex.test(JSON.parse(result.body).data.id)).toBe(true);
  });
});
