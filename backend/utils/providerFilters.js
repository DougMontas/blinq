// export function getEligibleProviders(providers, tier, zip) {
//   if (!Array.isArray(providers)) {
//     throw new TypeError("Expected an array of providers but got: " + typeof providers);
//   }

//   // return providers.filter((p) =>
//   //   p.billingTier === tier &&
//   //   Array.isArray(p.serviceZipcodes) &&
//   //   p.serviceZipcodes.includes(zip)
//   // );

//   return providers.filter(
//     (p) =>
//       p.billingTier === tier &&
//       Array.isArray(p.serviceZipcode) &&
//       p.serviceZipcode.map(String).includes(zip)
//   );
  
// }

// export function getEligibleProviders(providers, tier, zip) {
//   if (!Array.isArray(providers)) {
//     throw new TypeError("Expected an array of providers but got: " + typeof providers);
//   }

//   return providers.filter((p) => {
//     if (p.billingTier !== tier) return false;

//     if (Array.isArray(p.serviceZipcode)) {
//       return p.serviceZipcode.map(String).includes(zip);
//     }

//     return p.serviceZipcode?.toString().trim() === zip;
//   });
// }

export function getEligibleProviders(providers, tier, zip) {
  const results = [];

  

  for (const p of providers) {
    const tierMatch = p.billingTier === tier;
    const zipNorm = zip.toString().trim();

    const zipMatch = Array.isArray(p.serviceZipcode)
      ? p.serviceZipcode.map(z => z.toString().trim()).includes(zipNorm)
      : p.serviceZipcode?.toString().trim() === zipNorm;

    console.log(
      `🔍 ${p.name}: tier=${p.billingTier} (match=${tierMatch}), zip=${p.serviceZipcode} (match=${zipMatch})`
    );

    if (tierMatch && zipMatch) {
      results.push(p);
    }
  }

  return results;
}
