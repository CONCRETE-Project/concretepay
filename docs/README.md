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
npm run electron:win
```

Mac
```
npm run electron:mac
```

Linux
```
npm run electron:linux
```

## Building Android

## Building iOS