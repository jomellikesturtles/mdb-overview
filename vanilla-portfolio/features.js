// Shared Feature Toggles Configuration
const DEFAULT_FEATURES = {
  mdbProject: true,
  chat: false,
  lighthouseBadge: false,
  blueprint: false,
  workflow: false,
  technologies: false,
  tracking: true,
  spotlight: false,
  lazyLoading: false,
  download: false
};

// Helper to get feature state (checking URL params, falling back to defaults)
function isFeatureEnabled(featureName) {
  const urlParams = new URLSearchParams(window.location.search);
  const paramValue = urlParams.get(`feature:${featureName}`);
  if (paramValue !== null) {
    return paramValue === 'true';
  }
  return DEFAULT_FEATURES[featureName] ?? false;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_FEATURES, isFeatureEnabled };
}
