import { useEffect, useState } from "react";
import { auth, store, User } from "db";

export const useUserProfile = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userId, setUserId] = useState<string>();
  const [user, setUser] = useState<User>();
  const [photoUrl] = useState<string>("");
  const [spaceIds, setSpaceIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const newSpaceIds: string[] = [];
    // get all spaces for given user:
    store
      .collection("spaces")
      .where("ownerId", "==", user.uid)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          newSpaceIds.push(doc.id);
          // doc.data() is never undefined for query doc snapshots
        });
      })
      .then(() => {
        setSpaceIds(newSpaceIds);
      })
      .catch(function (error) {});
  }, [user]);

  useEffect(() => {
    auth().onAuthStateChanged(function (user) {
      if (user) {
        setAuthenticated(true);
        setUserId(user.uid);
        setUser(user);
        setIsAnonymous(user.isAnonymous);
      } else {
        setAuthenticated(false);
        setUserId(undefined);
        setIsAnonymous(false);
      }
    });
  }, []);

  return {
    authenticated,
    userId,
    isAnonymous,
    user,
    photoUrl,
    spaceIds,
  };
};
