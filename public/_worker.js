// ============================================
// CF Pages Advanced Mode Worker
// Serves static assets on all domains
// ============================================

export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
