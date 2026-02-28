/**
 * Z-score Standardization (StandardScaler).
 * Ensures each feature has mean = 0 and std = 1.
 */

export function standardize(data) {
  if (data.length === 0) return { scaledData: [], means: {}, stds: {} };

  const features = Object.keys(data[0]);
  const means = {};
  const stds = {};

  // Calculate means
  features.forEach(f => {
    const vals = data.map(d => d[f]);
    means[f] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  // Calculate standard deviations
  features.forEach(f => {
    const vals = data.map(d => d[f]);
    const variance = vals.reduce((acc, v) => acc + Math.pow(v - means[f], 2), 0) / vals.length;
    stds[f] = Math.sqrt(variance) || 1; // Avoid division by zero
  });

  // Scale data
  const scaledData = data.map(d => {
    const scaled = {};
    features.forEach(f => {
      scaled[f] = (d[f] - means[f]) / stds[f];
    });
    return scaled;
  });

  return { scaledData, means, stds };
}
