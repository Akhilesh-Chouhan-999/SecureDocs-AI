const compareFingerprints = (left = {}, right = {}) => {
  const sharedKeys = Object.keys(left).filter((key) => right[key]);

  if (sharedKeys.length === 0) {
    return 0;
  }

  const score = sharedKeys.reduce(
    (total, key) => total + Math.min(left[key], right[key]),
    0,
  );

  return Number((score / sharedKeys.length).toFixed(2));
};

module.exports = {
  compareFingerprints,
};
