// ============================================
// OneSignalSDK.sw.js — Legacy v16 beta worker name
// OneSignal SDK v16 internally tries both filenames:
//   - OneSignalSDKWorker.js (v15 name, our primary)
//   - OneSignalSDK.sw.js   (v16 beta name, this file)
// This file delegates to the unified worker to avoid
// duplicate service worker registration errors.
// ============================================

importScripts('./OneSignalSDKWorker.js');
