/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {HttpsError} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

import {getFirestore} from "firebase-admin/firestore";

import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const beforecreated = beforeUserCreated((event) => {
  const user = event.data;
  let email = user?.email;
  if (email) email = email.toLowerCase();
  const db = getFirestore();
  console.log("retrieving record");
  db.collection("invitations")
    .where("email", "==", email)
    .get()
    .then((snapshot) => {
      console.log("finished query");
      if (snapshot.empty) {
        throw new HttpsError("permission-denied",
          "An invitation is required to sign in to Tribalopolis",
          email + " is not found in invitations");
      }
    })
    .catch((error) => {
      console.log("query error");
      throw new HttpsError("internal",
        "Internal error: " + error.message,
        email + " is not found in invitations");
    });
});

export const beforesignedin = beforeUserSignedIn((event) => {
  // TODO
});
