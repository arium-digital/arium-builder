import { storage } from "db";
import randomString from "random-string";

const profileImagePath = (userId: string, fileName: string) =>
  `/profileImages/${userId}/${fileName}`;

export const uploadProfilePhoto = async ({
  userId,
  photoDataUri,
  extension,
}: {
  userId: string;
  photoDataUri: string;
  extension: "jpg" | "png";
}) => {
  const randomId = randomString({ length: 3 });

  const fileName = `${randomId}.${extension}`;

  const path = profileImagePath(userId, fileName);

  await storage().ref(path).putString(photoDataUri, "data_url");
  const url = await storage().ref(path).getDownloadURL();

  return {
    fileName,
    path,
    url,
  };
};

// const toFullProfileUrl = (profileUrl: string) => {

// }

// export const useFullProfileUrl = (profileUrl: string) => {
//   const fullProfileUrl=
// }

// const oldCode = ({ setPeerMetadata }: {
//   setPeerMetadata: React.Dispatch<React.SetStateAction<StringDict | undefined>>;
// }) => {
//   const [name, setName] = useState(user.displayName || "");

//   const updatePeerMetadataFromName = useCallback(
//     (name: string | undefined) => {
//       setPeerMetadata((existing) => {
//         if (!name) return existing;
//         if (!existing) {
//           return { name };
//         } else {
//           if (existing.name === name) return existing;
//           return {
//             ...existing,
//             name,
//           };
//         }
//       });
//     },
//     [setPeerMetadata]
//   );
//   const updateUserName = useCallback(
//     (name: string | undefined) => {
//       user.updateProfile({
//         displayName: name,
//       });
//       if (handleNameSet) handleNameSet(name);
//       updatePeerMetadataFromName(name);
//     },
//     [handleNameSet, updatePeerMetadataFromName, user]
//   );

//   const updatePeerMetadata = useCallback(() => {
//     setName((name) => {
//       updatePeerMetadataFromName(name);
//       return name;
//     });
//   }, [updatePeerMetadataFromName]);
//   useEffect(() => {
//     if (!editing) {
//       updatePeerMetadata();
//     }
//   }, [editing, updatePeerMetadata]);

//   const nameChanges$ = useBehaviorSubjectFromCurrentValue(name);

//   useEffect(() => {
//     const sub = nameChanges$
//       .pipe(
//         skip(1),
//         throttleTime(400, asyncScheduler, { leading: true, trailing: true }),
//         distinctUntilChanged()
//       )
//       .subscribe({
//         next: (name) => {
//           handleUpdateName(name);
//         },
//       });

//     return () => {
//       setTimeout(() => {
//         sub.unsubscribe();
//       }, 500);
//     };
//   }, [nameChanges$, handleUpdateName]);
// }
