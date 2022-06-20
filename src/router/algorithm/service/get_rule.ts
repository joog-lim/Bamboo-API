import { bold13, bold15, rules } from "../../../config";
import { createRes } from "../../../util/http";

const getAlgorithmRules = () =>
  createRes({
    data: {
      content: rules,
      bold13,
      bold15,
    },
  });

export default getAlgorithmRules;
