// utils/serviceResolver.js
import { SERVICE_ALIASES } from "../pricing.js";

/**
 * Normalize a service name to its canonical anchor
 * @param {string} svc - raw service from frontend
 * @returns {string} canonical service
 */
export const resolveService = (svc) => SERVICE_ALIASES[svc] || svc;
