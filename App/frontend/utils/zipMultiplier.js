import axios from 'axios';

export async function fetchZipMultiplier(zip) {
  const API_URL = 'https://zylalabs.com/api/226/cities+cost+of+living+and+average+prices+api/3775/cost+of+living+by+city+v2';

  // Mapping of ZIP codes to city names
  const zipToCityMap = {
    '33101': 'Miami',
    '10001': 'New York',
    '90001': 'Los Angeles',
    // Add more mappings as needed
  };

  const city = zipToCityMap[zip];
  if (!city) {
    console.warn(`No city mapping found for ZIP code: ${zip}`);
    return 1.0;
  }

  try {
    const response = await axios.get(API_URL, {
      params: {
        country: 'USA',
        city: city,
      },
      headers: {
        Authorization: `Bearer ${process.env.ZYLA_API_KEY}`,
      },
    });

    const data = response.data;
    // Assuming the API returns a 'cost_index' field
    const costIndex = parseFloat(data?.cost_index);
    if (isNaN(costIndex)) {
      console.warn(`Invalid cost index received for city: ${city}`);
      return 1.0;
    }

    // Normalize the cost index to a multiplier between 0.8 and 1.5
    const multiplier = Math.max(0.8, Math.min(1.5, costIndex / 100));
    return multiplier;
  } catch (error) {
    console.error('Cost index API error:', error?.response?.data || error.message);
    return 1.0;
  }
}
