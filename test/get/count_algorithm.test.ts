import { getAlgorithmCountAtAll } from "../../src/handler";
import { baseRequest } from "../dummy.data";

describe("Test the getAlgorithmCountAtAll", () => {
  test("It should responsecode is 200", async () => {
    const data = await getAlgorithmCountAtAll(baseRequest);
    expect(data).toEqual(
      expect.objectContaining({
        statusCode: 200,
      }),
    );
  });
});
