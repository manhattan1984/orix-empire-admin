import React, { useCallback } from "react";

import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  User as FirebaseUser,
} from "firebase/auth";
import {
  Authenticator,
  buildCollection,
  buildEntityCallbacks,
  buildProperty,
  EntityReference,
  FirebaseCMSApp,
  CMSView,
  EnumValues,
  singular,
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

const departments: EnumValues = [
  { id: "pharmacy", label: "Pharmacy", color: "grayLight" },
  { id: "nightclub", label: "Night Club", color: "redDark" },
];

type Drug = {
  name: string;
  price: number;
  // id: string;
  stock: number;
};

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  soldBy: string;
  order: OrderItem[];
};

type User = {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  department: string;
  // id: string;
};

let auth: Auth;

const createUser = (email: string, password: string) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      return user.uid;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
};

const usersCallback = buildEntityCallbacks({
  onPreSave: ({ values, entityId }) => {
    const email = values.email;
    const password = values.password;

    createUser(email, password);
    return values;
  },
});

const usersCollection = buildCollection<User>({
  name: "Users",
  singularName: "User",
  path: "users",
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    delete: true,
  }),
  customId: true,

  properties: {
    firstName: {
      name: "First Name",
      dataType: "string",
      validation: { required: true },
    },
    lastName: {
      name: "Last Name",
      dataType: "string",
      validation: { required: true },
    },
    email: {
      name: "E-Mail",
      dataType: "string",
      validation: { required: true },
    },
    password: {
      name: "Password",
      dataType: "string",
      validation: { required: true },
    },
    department: {
      dataType: "string",
      name: "Department",
      enumValues: departments,
      validation: { required: true },
    },
  },
  callbacks: usersCallback,
});

const pharmacyOrdersCollection = buildCollection<Order>({
  name: "Pharmacy Orders",
  singularName: "Order",
  path: "orixempire/pharmacy/orders",
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    // we have created the roles object in the navigation builder
    delete: true,
  }),
  properties: {
    soldBy: {
      name: "Sold By",
      dataType: "string",
    },
    order: {
      name: "Order",
      dataType: "array",
      // of:
    },
  },
});

const productsCallback = buildEntityCallbacks({
  onPreSave: ({ collection, path, entityId, values, status }) => {
    values.id = entityId;
    return values;
  },
});

const pharmacyProductsCollection = buildCollection<Drug>({
  name: "Pharmacy Products",
  singularName: "Pharmacy",
  path: "orixempire/pharmacy/products",
  permissions: ({ authController }) => ({
    edit: true,
    create: true,
    // we have created the roles object in the navigation builder
    delete: true,
  }),
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
      },
      description: "Price",
      dataType: "number",
    },
    stock: {
      name: "Stock",
      validation: { required: true },
      dataType: "number",
    },
  },
  callbacks: productsCallback,
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

  const firebaseInit = (config: Object) => {
    auth = getAuth();
  };

  return (
    <FirebaseCMSApp
      name={"Orix Empire"}
      authentication={myAuthenticator}
      collections={[pharmacyProductsCollection, usersCollection]}
      firebaseConfig={firebaseConfig}
      signInOptions={["google.com"]}
      onFirebaseInit={firebaseInit}
    />
  );
}
