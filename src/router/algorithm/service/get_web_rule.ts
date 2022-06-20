import { ruleForWeb } from "../../../config";
import { createRes } from "../../../util/http";

const getAlgorithmRulesForWeb = () =>
  createRes({
    data: {
      content: ruleForWeb,
    },
  });
export default getAlgorithmRulesForWeb;
