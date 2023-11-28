/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {HttpsError} from "firebase-functions/v2/https";
// import {config} from "firebase-functions";
// import * as logger from "firebase-functions/logger";
// import {initializeApp} from "firebase-admin";
import * as admin from "firebase-admin";
const app = admin.initializeApp();
import {getFirestore} from "firebase-admin/firestore";
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const beforecreated = beforeUserCreated(async (event) => {
  const user = event.data;
  let email = user?.email;
  if (email) email = email.toLowerCase();
  // console.log("email", email);
  const db = getFirestore(app);
  // console.log("retrieving record");
  let result;
  try {
    result = await db.collection("invitations")
      .where("email", "==", email).get();
  } catch (error) {
    // console.log("query error", error);
    // throw new HttpsError("internal",
    //   "Internal error: " + error.message,
    //   email + " is not found in invitations");
  }
  // .then((snapshot) => {
  //   console.log("finished query: snapshot.docs[0]", snapshot.docs[0]);
  //   return snapshot.docs[0];
  // })
  // console.log("query result", result?.docs[0]);
  if (!result?.docs[0]) {
    throw new HttpsError("permission-denied",
      "An invitation is required to sign in to Tribalopolis.",
      email + " was not found in invitations.");
  }
});

export const beforesignedin = beforeUserSignedIn((event) => {
  // TODO
});
