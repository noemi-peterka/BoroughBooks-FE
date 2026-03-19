# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Using google API key to query the google database with Scanner.

Please a plain .env file with the following inside:
EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY=["YOUR GOOGLE API KEY HERE]

This works in conjunction with out add-book.tsk file on line 172:
const GOOGLE_BOOKS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

## To set up messaging on Front end.
