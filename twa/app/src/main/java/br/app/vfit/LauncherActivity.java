/*
 * Copyright 2020 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package br.app.vfit;

import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;



public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {
    

    

    // Dark background color (#050A12) parsed once for reuse
    private static final int DARK_BG = Color.parseColor("#050A12");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // ── Force dark navigation bar to match app theme ──
        // This MUST run before super.onCreate() to affect the splash screen window.
        Window window = getWindow();

        // Ensure we draw behind system bars
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);

        // Force dark system bars (#050A12) — matches bg-primary dark.
        // Using solid color instead of transparent for maximum Chrome compatibility
        // (transparent may be ignored on 3-button nav in some Chrome versions).
        window.setNavigationBarColor(DARK_BG);
        // Status bar MUST be dark during splash/loading to avoid white flash.
        // Chrome Custom Tab will sync it with <meta name="theme-color"> once HTML loads.
        window.setStatusBarColor(DARK_BG);

        // Disable contrast enforcement so Chrome doesn't lighten/scrim the dark color (API 29+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setNavigationBarContrastEnforced(false);
            window.setStatusBarContrastEnforced(false);
        }

        super.onCreate(savedInstanceState);

        // Keep screen on while the app is in foreground (like Flutter's Wakelock)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Setting an orientation crashes the app due to the transparent background on Android 8.0
        // Oreo and below. We only set the orientation on Oreo and above. This only affects the
        // splash screen and Chrome will still respect the orientation.
        // See https://github.com/GoogleChromeLabs/bubblewrap/issues/496 for details.
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.O) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
    }

    @Override
    protected Uri getLaunchingUrl() {
        // Get the original launch Url.
        Uri uri = super.getLaunchingUrl();

        

        return uri;
    }
}
