// utils/serviceCatalog.js
import coveredDescriptions from "./coveredDescriptions.js";
import { questions, pricing, getBasePrice } from "./serviceMatrix.js";

const serviceCatalog = Object.keys(coveredDescriptions).reduce((acc, svc) => {
  acc[svc] = {
    description: coveredDescriptions[svc],
    basePrice: getBasePrice(svc),
    questions: questions[svc] || [],
    pricing: pricing[svc] || {},
  };
  return acc;
}, {});

export default serviceCatalog;
