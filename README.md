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

Please create a `.env` file in the project root with the following:

```
EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY=["YOUR GOOGLE API KEY HERE]
```

This works in conjunction with "add-book.tsk" file on line 172:
const GOOGLE_BOOKS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

## To set up messaging on Front end.

To set up messaging on front end first please ensure you've installed the express cors dependencies. If unsure run the
following commands.

npm install @supabase/supabase-js

To set up messaging you will be required to get your supabase ANON public key.
To find this, go to your supabase project dashboard. From there click on "project settings"(appears with cog/gear icon), then head to API keys. Once there click on the "Legacy anon, service_role API keys" tab to see your ANON and SERVICE key.

Next you need to update and add to your .env file with your supabase ANON_KEY.

Note: You don't need quotes for these values.

```
EXPO_PUBLIC_SUPABASE_ANON_KEY=[Add ANON key here]
EXPO_PUBLIC_SUPABASE_URL=[Add your supabase url here]
```

After this head back to your supabase project dashboard and on the lefthand menu enter database and select "Publications"
You should see, supabase_realtime.
From here click the tables button on the right to access the table list.
Toggle the messages(public) and conversations(public) on to enable replication on those tables.
Enabling replication tells Supabase Realtime to broadcast changes from those tables to connected clients.

Next we need to disable Row Level Security.

To do this select the Database again from the left hand menu of your project dashboard and select Tables.

Select the "..." button next to "messages" table and enter "edit" table. Ensure that the "Enable Row Level Security (RLS)" is OFF(unticked) and Realtime is ON(ticked). Repeat the same process for "conversations" table and ensure that the "Enable Row Level Security (RLS)" is OFF
