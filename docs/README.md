# ConcretePay Documentation

* [Backend](#backend)
* [Rates API](#rates-api)
* [Build Desktop](#build-desktop)
* [Build Android](#build-android)
* [Build iOS](#build-ios)

## Backend

## Rates API

## Building Desktop

To build for desktop, you simply need to run the initial capacitor build

```
npm run capacitor:build
````

Once it has build capacitor you can run the electron on developer mode with 

```
npm run capacitor:electron
```

To build binaries first you need to enter the electron folder

```
cd electron
```

Now you can build for the OS you want:

Windows
```
npm run build:win
```

Mac
```
npm run build:mac
```

Linux
```
npm run build:linux
```

## Building Android

Before starting building for android, make sure you have your development environment ready: https://capacitor.ionicframework.com/docs/android/#getting-started

To build for android, you simply need to run the initial capacitor build

```
npm run capacitor:build
````

And open the app on Android Studio to finish the build process

```
npm run capacitor:android
````

## Building iOS

Before starting building for ios, make sure you have your development environment ready: https://capacitor.ionicframework.com/docs/ios/#getting-started

To build for iOS, you simply need to run the initial capacitor build

```
npm run capacitor:build
````

And open the app on Xcode to finish the build process

```
npm run capacitor:ios
````
