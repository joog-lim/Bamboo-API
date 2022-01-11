import "reflect-metadata";
import { getAlgorithmCountAtAll } from "../src/handler";
import { baseRequest } from "./dummy.data";

describe('Test the getAlgorithmCountAtAll', () => {
    test('It should responsecode is 200', async () => {
        expect(await getAlgorithmCountAtAll(baseRequest)).toEqual(
                expect.objectContaining({
                    statusCode : 200
                })
        )
    })
}
)