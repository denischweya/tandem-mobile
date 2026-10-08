const preset = require('jest-expo/jest-preset');

const [packagesPattern, ...rest] = preset.transformIgnorePatterns;

module.exports = {
  ...preset,
  // transformIgnorePatterns REPLACES the preset's array; it does not extend it. So the only
  // safe way to allow @tandem through is to derive from the preset's own value rather than
  // restate it. A hand-written copy of this pattern silently stopped transforming every
  // hyphenated expo-* package, which breaks the entire suite rather than just the import
  // this entry exists to permit.
  transformIgnorePatterns: [packagesPattern.replace('(?!(', '(?!(@tandem|'), ...rest],
};
