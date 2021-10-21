# <p align="center">Customise Jitsi Meet SDK for SoundBird</p>

Jitsi Meet is a set of Open Source projects which empower users to use and deploy
video conferencing platforms with state-of-the-art video quality and features.

<hr />

## Steps

First run yarn install or npm install to install node_modules.
#### yarn install or npm install

After that move to IOS folder and install pods by using install pod in IOS folder

`cd ios`

`pod install`

after that you have to do customisation in react/feature native classes for mobile apps customisation. Once complete customisation and test you have to create SDK and xcfarmeworks

##IOS
`mkdir -p ios/sdk/out`

`xcodebuild clean \
-workspace ios/jitsi-meet.xcworkspace \
-scheme JitsiMeetSDK`

`xcodebuild archive \
-workspace ios/jitsi-meet.xcworkspace \
-scheme JitsiMeetSDK  \
-configuration Release \
-sdk iphonesimulator \
-destination='generic/platform=iOS Simulator' \
-archivePath ios/sdk/out/ios-simulator \
VALID_ARCHS=x86_64 \
ENABLE_BITCODE=NO \
SKIP_INSTALL=NO \
BUILD_LIBRARY_FOR_DISTRIBUTION=YES`

`xcodebuild archive \
-workspace ios/jitsi-meet.xcworkspace \
-scheme JitsiMeetSDK  \
-configuration Release \
-sdk iphoneos \
-destination='generic/platform=iOS' \
-archivePath ios/sdk/out/ios-device \
VALID_ARCHS=arm64 \
ENABLE_BITCODE=NO \
SKIP_INSTALL=NO \
BUILD_LIBRARY_FOR_DISTRIBUTION=YES`

`xcodebuild -create-xcframework \
-framework ios/sdk/out/ios-device.xcarchive/Products/Library/Frameworks/JitsiMeetSDK.framework \
-framework ios/sdk/out/ios-simulator.xcarchive/Products/Library/Frameworks/JitsiMeetSDK.framework \
-output ios/sdk/out/JitsiMeetSDK.xcframework
cp -a node_modules/react-native-webrtc/apple/WebRTC.xcframework ios/sdk/out`


After successfully building Jitsi Meet SDK for iOS, the 2 resulting XCFrameworks will be in the ios/sdk/out directory. copy both XCFrameworks and paste or replace at location 
ios/Pods/JitsiMeetSDK/frameworks/

Run soundbird app again and sdk changes will reflect


##Android
Third-party React Native modules, which Jitsi Meet SDK for Android depends on, are download by NPM in source code or binary form. These need to be assembled into Maven artifacts, and then published to your local Maven repository. A script is provided to facilitate this. From the root of the jitsi-meet project repository, run:

`./android/scripts/release-sdk.sh /tmp/repo`

This will build and publish the SDK, and all of its dependencies to the specified Maven repository (/tmp/repo)

You're now ready to use the artifacts. In your project, add the Maven repository that you used above (/tmp/repo) into your top-level build.gradle file:

`
allprojects { 
    repositories {
        maven { url "file:/tmp/repo" }
        google()
        jcenter()
    }
}`
You can use your local repository to replace the Jitsi repository (maven { url "https://github.com/jitsi/jitsi-maven-repository/raw/master/releases" }) when you published all subprojects. If you didn't do that, you'll have to add both repositories. Make sure your local repository is listed first!

Then, define the dependency org.jitsi.react:jitsi-meet-sdk into the build.gradle file of your module:

implementation ('org.jitsi.react:jitsi-meet-sdk:+') { transitive = true }
Note that there should not be a need to explicitly add the other dependencies, as they will be pulled in as transitive dependencies of jitsi-meet-sdk.


##What is Customise in SDK

###Audio conference

For audio conference, Jitsi default vidoe view size is set as 0 due to which view is not visible. 
