import { useState, useCallback, useEffect, MouseEvent } from "react";
import { uploadProfilePhoto } from "hooks/useUpdateUserProfile";
import { METADATA_KEYS } from "hooks/usePeersMetadata";
import { store, User } from "db";
import { Optional, PossiblyNullStringDict, StringDict } from "types";
import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";
import { exhaustMap, map, withLatestFrom, startWith } from "rxjs/operators";
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
  Subject,
} from "rxjs";
import { userProfilesDoc } from "shared/documentPaths";
import { UserProfile } from "../../../../shared/sharedTypes";

export const usePhotoCapture = ({
  handleProfilePhotoUrlUpdated,
  userId,
}: {
  handleProfilePhotoUrlUpdated: (profileImageUrl: string | null) => void;
  userId: string;
}) => {
  const [captureState, setCaptureState] = useState<{
    capture: boolean;
    newImage:
      | {
          dataUri: string;
          extension: "jpg" | "png";
        }
      | undefined;
  }>({
    capture: false,
    newImage: undefined,
  });

  const handleProfileImageSet = useCallback(
    async (
      profileImage: { dataUri: string; extension: "jpg" | "png" } | undefined
    ) => {
      if (profileImage) {
        const profileUpdateResult = await uploadProfilePhoto({
          userId: userId,
          photoDataUri: profileImage.dataUri,
          extension: profileImage.extension,
        });
        handleProfilePhotoUrlUpdated(profileUpdateResult.url);
      } else {
        handleProfilePhotoUrlUpdated(null);
      }
    },
    [userId, handleProfilePhotoUrlUpdated]
  );

  const handleChangeProfileImage = useCallback(() => {
    setCaptureState({
      capture: true,
      newImage: undefined,
    });
    handleProfileImageSet(undefined);
  }, [handleProfileImageSet]);
  const handleCloseUploadPhotoDialog = useCallback(() => {
    setCaptureState((existing) => ({
      ...existing,
      capture: false,
    }));
  }, []);

  const handlePhotoUploaded = useCallback(
    (image: string) => {
      handleProfileImageSet({ dataUri: image, extension: "png" });
      handleCloseUploadPhotoDialog();
    },
    [handleCloseUploadPhotoDialog, handleProfileImageSet]
  );

  return {
    captureState,
    handleChangeProfileImage,
    handlePhotoUploaded,
    handleCloseUploadPhotoDialog,
  };
};

const isProfileImage = (
  profileImage: ProfileImage | string
): profileImage is ProfileImage => {
  return typeof profileImage !== "string";
};

const updateOrCreateProfile = async (
  userId: string,
  update: Partial<UserProfile>
) => {
  const ref = userProfilesDoc(userId);

  await store.runTransaction(async (t) => {
    const existingDoc = await t.get(ref);

    if (existingDoc.exists) {
      t.update(ref, update);
    } else {
      t.set(ref, update);
    }
  });
};

const updateProfileAndMetadata = async ({
  newProfileImage,
  // savedPhotoUrl,
  userId,
  userProfile,
  setPeerMetadata,
  userName,
}: {
  newProfileImage: string | ProfileImage | null | undefined;
  // savedPhotoUrl: string | null;
  userId: string;
  userProfile: Optional<UserProfile>;
  userName: string | null | undefined;
  setPeerMetadata: React.Dispatch<React.SetStateAction<StringDict | undefined>>;
}) => {
  // const updates: StringDict = {};
  const profileUpdate: Partial<UserProfile> = {};
  let url: string | null = null;

  if (newProfileImage) {
    if (isProfileImage(newProfileImage)) {
      const profileUpdateResult = await uploadProfilePhoto({
        userId,
        photoDataUri: newProfileImage.dataUri,
        extension: newProfileImage.extension,
      });
      url = profileUpdateResult.url;
    } else {
      url = newProfileImage;
    }

    // updates[METADATA_KEYS.photo] = url;
    profileUpdate.photoURL = url;
  }

  if (userName && userName !== userProfile?.displayName) {
    // updates[METADATA_KEYS.name] = userName;
    profileUpdate.displayName = userName;
  }

  if (Object.entries(profileUpdate).length > 0) {
    const updates: StringDict = {};

    if (url) {
      updates[METADATA_KEYS.photo] = url;
    }
    if (userName) {
      updates[METADATA_KEYS.name] = userName;
    }

    updateOrCreateProfile(userId, profileUpdate);
    setPeerMetadata((existing = {}) => ({
      ...existing,
      // todo: fix empty strings
      ...updates,
    }));
  }

  return {
    name: userName,
    photoUrl: url,
  };
};

interface ProfileImage {
  dataUri: string;
  extension: "jpg" | "png";
}

export interface ProfileSetter {
  setNewProfileImage: (profileImage: string | null) => void;
  savedPhotoUrl$: Observable<string | null>;
  metaDataWithUpdates$: Observable<PossiblyNullStringDict>;
  name$: Observable<string | null>;
  setName: (name: string | null) => void;
  handleContinueClicked: (e: MouseEvent) => void;
  updatingProfile: boolean;
  saved$: Observable<void>;
}

export const useUserProfile = (user: Optional<User>) => {
  const [userProfile, setUserProfile] = useState<UserProfile>();

  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;
    const ref = userProfilesDoc(userId);

    ref.onSnapshot((snap) => {
      if (snap.exists) {
        const profile = snap.data() as UserProfile;

        setUserProfile(profile);
      }
    });
  }, [userId]);

  return userProfile;
};

export const useProfileSetter = ({
  userId,
  userProfile,
  setPeerMetadata,
}: {
  userId: Optional<string>;
  userProfile: Optional<UserProfile>;
  setPeerMetadata: React.Dispatch<React.SetStateAction<StringDict | undefined>>;
}): ProfileSetter => {
  // const nameFromUser$ = useBehaviorSubjectFromCurrentValue(userProfile?.displayName);

  // const photoFromUser$ = useBehaviorSubjectFromCurrentValue(userProfile?.photoURL);

  const [name$] = useState(new ReplaySubject<string | null>());
  const [profilePhoto$] = useState(new ReplaySubject<string | null>());

  // const nameChanges$$ = useMemo(
  //   () => merge([nameFromUser$, nameChanges$.pipe(filterUndefined())]),
  //   [nameChanges$, nameFromUser$]
  // );
  const storedDisplayName = userProfile?.displayName;

  useEffect(() => {
    name$.next(storedDisplayName);
  }, [name$, storedDisplayName]);

  const storedProfileImage = userProfile?.photoURL;

  const savedPhotoUrl$ = useBehaviorSubjectFromCurrentValue(
    storedProfileImage || null
  );

  useEffect(() => {
    profilePhoto$.next(storedProfileImage);
  }, [profilePhoto$, storedProfileImage]);

  const setName = useCallback(
    (name: string | null) => {
      name$.next(name);
    },
    [name$]
  );

  const setProfileImage = useCallback(
    (profileImage: string | null) => {
      profilePhoto$.next(profileImage);
    },
    [profilePhoto$]
  );

  const [saveCalls$] = useState(new Subject<void>());

  const [saved$] = useState(new Subject<void>());

  useEffect(() => {
    return () => {
      saved$.complete();
    };
  }, [saved$]);

  const [localMetadata$] = useState(
    new BehaviorSubject<PossiblyNullStringDict>({})
  );

  useEffect(() => {
    const sub = combineLatest([
      name$.pipe(startWith(null)),
      profilePhoto$.pipe(startWith(null)),
    ])
      .pipe(
        map(([name, profilePhoto]) => ({
          [METADATA_KEYS.name]: name,
          [METADATA_KEYS.photo]: profilePhoto,
        }))
      )
      .subscribe(localMetadata$);

    return () => sub.unsubscribe();
  }, [name$, profilePhoto$, localMetadata$]);

  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const currentNameAndPhoto$ = combineLatest([name$, profilePhoto$]);
    const sub = saveCalls$
      .pipe(
        withLatestFrom(currentNameAndPhoto$),
        exhaustMap(async ([, [name, photo]]) => {
          setUpdatingProfile(true);

          await updateProfileAndMetadata({
            newProfileImage: photo,
            setPeerMetadata,
            userId,
            userProfile,
            userName: name,
          });

          setUpdatingProfile(false);
        })
      )
      .subscribe(saved$);

    return () => sub.unsubscribe();
  }, [
    name$,
    profilePhoto$,
    saveCalls$,
    saved$,
    setPeerMetadata,
    userId,
    userProfile,
  ]);

  const handleContinueClicked = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      saveCalls$.next();
    },
    [saveCalls$]
  );

  return {
    setNewProfileImage: setProfileImage,
    savedPhotoUrl$,
    metaDataWithUpdates$: localMetadata$,
    name$,
    setName,
    handleContinueClicked,
    updatingProfile,
    saved$,
  };
};
