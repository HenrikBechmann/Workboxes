/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

import * as admin from "firebase-admin";

import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const beforecreated = beforeUserCreated(async (event) => {
  const db = admin.firestore();
  db.collection("invitations")
    .where("email", "==", "something".toLowerCase())
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        // fail!
      }
    })
    .catch((error) => {
      // fail with error
    });

  return;
});

export const beforesignedin = beforeUserSignedIn((event) => {
  // TODO
});
