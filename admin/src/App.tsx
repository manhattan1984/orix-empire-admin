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
  EntityOnSaveProps,
} from "@camberi/firecms";

import "typeface-rubik";
import "@fontsource/ibm-plex-mono";
import { getApp, initializeApp, FirebaseApp } from "firebase/app";

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
  { id: "medical-shop", label: "Medical Shop", color: "grayLight" },
  { id: "nightclub", label: "Night Club", color: "redDark" },
];

type Product = {
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


const createUser = async (email: string, password: string) => {
  try {
    const currentUser = getAuth().currentUser;

    const newUser = await createUserWithEmailAndPassword(
      getAuth(),
      email,
      password
    );
    console.log("newUser", true);

    getAuth().updateCurrentUser(currentUser);

    return true;
  } catch (e) {
    console.log(e);
  }
};
const usersCallback = buildEntityCallbacks({
  onPreSave: ({ values, entityId }) => {
    // const email = values.email;
    // const password = values.password;

    // createUser(email, password, entityId);
    return values;
  },
  onSaveSuccess: (props: EntityOnSaveProps<User>) => {
    console.log(props);
    const { collection } = props;
    const { email, password } = props.values;
    if (email && password) {
      createUser(email, password);
    }
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

const productsCallback = buildEntityCallbacks({
  onPreSave: ({ collection, path, entityId, values, status }) => {
    values.id = entityId;
    return values;
  },
});

const departmentsList = ["medical-shop", "nightclub"];

const getDepartmentsCollections = (department: string) => {
  return buildCollection<Product>({
    name: `${department} Products`,
    singularName: `${department} Product`,
    path: `orixempire/${department}/products`,
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
};

export default function App() {
  const myAuthenticator: Authenticator<FirebaseUser> = useCallback(
    async ({ user, authController }) => {
      if (user?.email !== "orixempirex@gmail.com") {
        throw Error("You're not allowed to access admin!");
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
      name={"Orix Empire"}
      authentication={myAuthenticator}
      collections={[
        ...departmentsList.map(getDepartmentsCollections),
        usersCollection,
      ]}
      firebaseConfig={firebaseConfig}
      signInOptions={["password"]}
      // onFirebaseInit={firebaseInit}
    />
  );
}
