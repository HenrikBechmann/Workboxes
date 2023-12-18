// tribalopolis cloud functions
// copyright (c) 2023-present Henrik Bechmann, Toronto, Licence: GPL-3.0

/**
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {getFirestore} from "firebase-admin/firestore";
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

const app = admin.initializeApp();

export const setAdminClaim = onCall( async (request) =>{
  // validate the caller
  let email = request.auth?.token.email || null;
  if (email) email = email.toLowerCase();
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("sysadmins")
      .where("properties.email", "==", email).get();
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      message: error.message,
    };
  }
  if (!result?.docs[0]) {
    return {
      status: false,
      message: "sender email not found",
    };
  }

  // make sure candidate email is provided
  let candidateemail = request.data.email;
  if (!candidateemail) {
    return {
      status: false,
      message: "candidate email required",
    };
  }

  // validate the candidate email
  if (candidateemail) candidateemail = candidateemail.toLowerCase();
  try {
    result = await db.collection("sysadmins")
      .where("properties.email", "==", candidateemail).get();
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      message: error.message,
    };
  }

  if (!result?.docs[0]) {
    return {
      status: false,
      message: "candidate email not found",
    };
  }
  let user;
  try {
    user = await admin.auth().getUserByEmail(candidateemail);
    if (user.customClaims && user.customClaims.admin === true) {
      return {
        status: true,
        message: "candidate already has admin claim",
      };
    }
    admin.auth().setCustomUserClaims(user.uid, {admin: true});
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      message: error.message,
    };
  }
  return {
    status: true,
    message: "candidate admin claim is set",
  };
});

export const revokeAdminClaim = onCall( async (request) =>{
  // validate the caller
  let email = request.auth?.token.email || null;
  if (email) email = email.toLowerCase();
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("sysadmins")
      .where("properties.email", "==", email).get();
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      message: error.message,
    };
  }
  if (!result?.docs[0]) {
    return {
      status: false,
      message: "caller email not found",
    };
  }

  // make sure candidate email is provided
  const candidateemail = request.data.email;
  if (!candidateemail) {
    return {
      status: false,
      message: "candidate email required",
    };
  }
  candidateemail.toLowerCase();

  let user;
  try {
    user = await admin.auth().getUserByEmail(candidateemail);
    if (user.customClaims && !user.customClaims.admin) {
      return {
        status: true,
        message: "candidate did not have admin claim",
      };
    }
    admin.auth().setCustomUserClaims(user.uid, {admin: null});
  } catch (e) {
    const error:Error = e as Error;
    return {
      status: false,
      message: error.message,
    };
  }
  return {
    status: true,
    message: "candidate admin claim revoked",
  };
});

export const isAdminUser = onCall(async (request) => {
  const isAdmin = !!request.auth?.token.admin === true;
  return {
    status: isAdmin,
    message: "current user admin status",
  };
});

export const isSuperUser = onCall(async (request) => {
  let email = request.auth?.token.email || null;
  if (email) email = email.toLowerCase();
  const isAdmin = {
    isSuperUser: false,
    errorCondition: false,
    role: undefined,
  };
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("sysadmins")
      .where("properties.email", "==", email).get();
  } catch (e) {
    isAdmin.errorCondition = true;
  }
  if (result?.docs[0]) {
    isAdmin.role = result.docs[0].data().role;
    isAdmin.isSuperUser = true;
  }
  return isAdmin;
});

export const beforecreated = beforeUserCreated(async (event) => {
  const user = event.data;
  let email = user?.email;
  if (email) email = email.toLowerCase();
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("invitations")
      .where("properties.email", "==", email).get();
  } catch (e) {
    const error:Error = e as Error;
    throw new HttpsError("internal",
      "Internal error: " + error?.message);
  }
  if (!result?.docs[0]) {
    throw new HttpsError("permission-denied",
      "An invitation is required to sign in to Tribalopolis.",
      email + " was not found in invitations.");
  }
});

export const beforesignedin = beforeUserSignedIn(async (event) => {
  const user = event.data;
  let email = user?.email;
  if (email) email = email.toLowerCase();
  const db = getFirestore(app);
  let result;
  try {
    result = await db.collection("suspensions")
      .where("properties.email", "==", email).get();
  } catch (e) {
    const error:Error = e as Error;
    throw new HttpsError("internal",
      "Internal error: " + error?.message);
  }
  if (result?.docs[0]) {
    throw new HttpsError("permission-denied",
      "Accounts must be in good standing to sign in to Tribalopolis.",
      email + " was found in suspensions.");
  }
});
