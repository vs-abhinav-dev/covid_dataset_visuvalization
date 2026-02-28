/**
 * Principal Component Analysis (PCA) for 2D visualization.
 */

export function PCA(data) {
  if (data.length === 0) return [];

  // Convert objects to matrix (array of arrays)
  const features = Object.keys(data[0]);
  const matrix = data.map(row => features.map(f => row[f]));
  
  // 1. Calculate Covariance Matrix
  const numObs = matrix.length;
  const numFeatures = features.length;
  const cov = Array.from({ length: numFeatures }, () => new Array(numFeatures).fill(0));

  for (let i = 0; i < numFeatures; i++) {
    for (let j = 0; j < numFeatures; j++) {
      let sum = 0;
      for (let k = 0; k < numObs; k++) {
        sum += matrix[k][i] * matrix[k][j];
      }
      cov[i][j] = sum / (numObs - 1);
    }
  }

  // 2. Power Iteration to find top 2 Eigenvectors (Simplified PCA)
  function getTopEigenvector(targetCov, iterations = 100) {
    let v = new Array(numFeatures).fill(0).map(() => Math.random());
    
    for (let it = 0; it < iterations; it++) {
      let nextV = new Array(numFeatures).fill(0);
      for (let i = 0; i < numFeatures; i++) {
        for (let j = 0; j < numFeatures; j++) {
          nextV[i] += targetCov[i][j] * v[j];
        }
      }
      // Normalize
      const mag = Math.sqrt(nextV.reduce((a, b) => a + b * b, 0));
      v = nextV.map(x => x / (mag || 1));
    }
    return v;
  }

  // PC1
  const ev1 = getTopEigenvector(cov);

  // Deflate Covariance matrix to find PC2
  // cov_next = cov - (lambda1 * ev1 * ev1T)
  // Simplified deflation logic for 2nd vector
  const pc1Scores = matrix.map(row => row.reduce((acc, val, i) => acc + val * ev1[i], 0));
  
  const cov2 = Array.from({ length: numFeatures }, () => new Array(numFeatures).fill(0));
  for (let i = 0; i < numFeatures; i++) {
    for (let j = 0; j < numFeatures; j++) {
      let sum = 0;
      for (let k = 0; k < numObs; k++) {
        sum += (matrix[k][i] - pc1Scores[k] * ev1[i]) * (matrix[k][j] - pc1Scores[k] * ev1[j]);
      }
      cov2[i][j] = sum / (numObs - 1);
    }
  }
  const ev2 = getTopEigenvector(cov2);

  // 3. Project data onto PC1 and PC2
  return matrix.map(row => ({
    pc1: row.reduce((acc, val, i) => acc + val * ev1[i], 0),
    pc2: row.reduce((acc, val, i) => acc + val * ev2[i], 0)
  }));
}
