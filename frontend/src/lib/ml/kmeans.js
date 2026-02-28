/**
 * Enhanced K-Means Clustering with Inertia calculation.
 */

export function kMeans(data, k, maxIterations = 100) {
  if (data.length === 0) return { centroids: [], clusters: [], inertia: 0 };

  const features = Object.keys(data[0]);
  
  // Initialize centroids
  let centroids = [];
  const indices = new Set();
  while (centroids.length < k && centroids.length < data.length) {
    const idx = Math.floor(Math.random() * data.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      centroids.push({ ...data[idx] });
    }
  }

  let clusters = new Array(data.length).fill(-1);
  let iteration = 0;
  let changed = true;

  while (changed && iteration < maxIterations) {
    changed = false;
    iteration++;

    // Assignment Step
    data.forEach((point, pointIdx) => {
      let minDist = Infinity;
      let clusterIdx = -1;

      centroids.forEach((centroid, cIdx) => {
        let dist = 0;
        features.forEach(f => {
          dist += Math.pow(point[f] - centroid[f], 2);
        });

        if (dist < minDist) {
          minDist = dist;
          clusterIdx = cIdx;
        }
      });

      if (clusters[pointIdx] !== clusterIdx) {
        clusters[pointIdx] = clusterIdx;
        changed = true;
      }
    });

    // Update Step
    if (changed) {
      centroids = centroids.map((oldCentroid, cIdx) => {
        const clusterPoints = data.filter((_, pIdx) => clusters[pIdx] === cIdx);
        if (clusterPoints.length === 0) return oldCentroid;

        const newCentroid = {};
        features.forEach(f => {
          const sum = clusterPoints.reduce((acc, p) => acc + p[f], 0);
          newCentroid[f] = sum / clusterPoints.length;
        });
        return newCentroid;
      });
    }
  }

  // Calculate Inertia (WCSS)
  let inertia = 0;
  data.forEach((point, pIdx) => {
    const centroid = centroids[clusters[pIdx]];
    features.forEach(f => {
      inertia += Math.pow(point[f] - centroid[f], 2);
    });
  });

  return { centroids, clusters, inertia };
}
