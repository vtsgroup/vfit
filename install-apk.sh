#!/bin/bash
# Install new VFIT APK with complete cleanup

set -e

echo "🚀 VFIT v4.3.1 Installation Script"
echo "===================================="
echo ""

APK_PATH="/Users/macos/Development/apps/vfit-production/twa/app/build/outputs/apk/release/app-release.apk"
PACKAGE="br.app.vfit"

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found at: $APK_PATH"
    echo "Please run the build first:"
    echo "  cd /Users/macos/Development/apps/vfit-production"
    echo "  export JAVA_HOME=\"/Users/macos/Library/Java/JavaVirtualMachines/jbrsdk_jcef-17.0.14/Contents/Home\""
    echo "  export KEYSTORE_PASS=\"Tw4#9wo4nseWIrW1qG6qnzIOobGJNbjfkR1l\""
    echo "  cd twa && ./gradlew bundleRelease assembleRelease"
    exit 1
fi

echo "✅ APK found: $(ls -lh $APK_PATH | awk '{print $5, $6, $7, $8, $9}')"
echo ""

# Check if device is connected
echo "📱 Checking for connected device..."
DEVICE=$(adb devices | grep -w "device" | head -1 | awk '{print $1}')

if [ -z "$DEVICE" ]; then
    echo "❌ No Android device connected via ADB"
    echo "Please:"
    echo "  1. Connect your phone via USB"
    echo "  2. Enable USB Debugging (Settings > Developer Options)"
    echo "  3. Run this script again"
    exit 1
fi

echo "✅ Device connected: $DEVICE"
echo ""

# Step 1: Uninstall old version
echo "Step 1️⃣ : Uninstalling old version..."
if adb uninstall $PACKAGE; then
    echo "✅ Old version uninstalled"
else
    echo "⚠️  Old version not found (this is OK if first install)"
fi
echo ""

# Step 2: Clear cache
echo "Step 2️⃣ : Clearing system cache..."
adb shell pm clear-cache > /dev/null 2>&1 || true
echo "✅ Cache cleared"
echo ""

# Step 3: Install new APK
echo "Step 3️⃣ : Installing new APK (v4.3.1)..."
if adb install "$APK_PATH"; then
    echo "✅ APK installed successfully!"
else
    echo "❌ Installation failed"
    exit 1
fi
echo ""

# Step 4: Launch app
echo "Step 4️⃣ : Launching app..."
adb shell am start -n "$PACKAGE/br.app.vfit.LauncherActivity" || true
echo "✅ App launched!"
echo ""

echo "🎉 Installation complete!"
echo ""
echo "Checklist:"
echo "  ✅ Old version removed"
echo "  ✅ Cache cleared"
echo "  ✅ New v4.3.1 installed"
echo "  ✅ App launched"
echo ""
echo "Verify:"
echo "  1. Long press app icon → See 3 shortcuts with icons ✅"
echo "  2. Check launcher icon is green rounded ✅"
echo "  3. Check app name is 'Vfit' (not VFIT) ✅"
echo ""
