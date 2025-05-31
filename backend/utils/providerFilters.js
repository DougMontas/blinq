export function getEligibleProviders(providers, tier, zip) {
  const results = [];

  for (const p of providers) {
    const tierMatch = p.billingTier === tier;
    const zipNorm = zip.toString().trim();

    const zipMatch = Array.isArray(p.serviceZipcode)
      ? p.serviceZipcode.map((z) => z.toString().trim()).includes(zipNorm)
      : p.serviceZipcode?.toString().trim() === zipNorm;

    if (tierMatch && zipMatch) {
      results.push(p);
    }
  }

  return results;
}
