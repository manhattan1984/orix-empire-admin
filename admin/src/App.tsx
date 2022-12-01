import React, { useCallback } from "react";

import { User as FirebaseUser } from "firebase/auth";
import {
  Authenticator,
  buildCollection,
  buildProperty,
  EntityReference,
  FirebaseCMSApp,
} from "@camberi/firecms";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";

// TODO: Replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyAREPjaFXKjaCCU-9HW8jUtu9pXj3yb2LQ",
  authDomain: "orixempire-a4d65.firebaseapp.com",
  projectId: "orixempire-a4d65",
  storageBucket: "orixempire-a4d65.appspot.com",
  messagingSenderId: "591597792341",
  appId: "1:591597792341:web:2465f70c89d1621b36b8dc",
  measurementId: "G-LJNBGFC32E",
};

const locales = {
  "en-US": "English (United States)",
  "es-ES": "Spanish (Spain)",
  "de-DE": "German",
};

type Drug = {
  name: string;
  price: number;
  id: number;
};

const localeCollection = buildCollection({
  path: "locale",
  customId: locales,
  name: "Locales",
  singularName: "Locales",
  properties: {
    name: {
      name: "Title",
      validation: { required: true },
      dataType: "string",
    },
    selectable: {
      name: "Selectable",
      description: "Is this locale selectable",
      dataType: "boolean",
    },
    video: {
      name: "Video",
      dataType: "string",
      validation: { required: false },
      storage: {
        storagePath: "videos",
        acceptedFiles: ["video/*"],
      },
    },
  },
});

const drugsCollection = buildCollection<Drug>({
  name: "Drugs",
  singularName: "Drug",
  path: "drugs",
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    // we have created the roles object in the navigation builder
    delete: false,
  }),
  subcollections: [localeCollection],
  properties: {
    name: {
      name: "Name",
      validation: { required: true },
      dataType: "string",
    },
    price: {
      name: "Price",
      validation: {
        required: true,
        requiredMessage: "You must set a price between 0 and 1000",
        min: 0,
        max: 1000,
      },
      description: "Price with range validation",
      dataType: "number",
    },
    id: {
      name: "ID",
      validation: { required: true },
      dataType: "number",
    },
  },
});

export default function App() {
  const myAuthenticator: Authenticator<FirebaseUser> = useCallback(
    async ({ user, authController }) => {
      if (user?.email?.includes("flanders")) {
        throw Error("Stupid Flanders!");
      }

      console.log("Allowing access to", user?.email);
      // This is an example of retrieving async data related to the user
      // and storing it in the user extra field.
      const sampleUserRoles = await Promise.resolve(["admin"]);
      authController.setExtra(sampleUserRoles);

      return true;
    },
    []
  );

  return (
    <FirebaseCMSApp
      name={"My Online Shop"}
      authentication={myAuthenticator}
      collections={[drugsCollection]}
      firebaseConfig={firebaseConfig}
    />
  );
}
