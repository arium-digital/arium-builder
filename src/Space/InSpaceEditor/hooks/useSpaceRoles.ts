import { store } from "db";
import { useEffect, useState } from "react";
import { SpaceRoles } from "../../../../shared/sharedTypes";

function useSpaceRoles({
  canEdit,
  spaceId,
}: {
  canEdit: boolean;
  spaceId: string | undefined;
}) {
  const [spaceRoles, setSpaceRoles] = useState<SpaceRoles | undefined>();

  useEffect(() => {
    if (!canEdit || !spaceId) return;

    const unsub = store
      .collection("spaceRoles")
      .doc(spaceId)
      .onSnapshot((snap) => {
        if (!snap.exists) setSpaceRoles(undefined);

        const roles = snap.data() as SpaceRoles;

        setSpaceRoles(roles);

        // const allEditors = new Set(roles.editors || []);

        // roles.owners?.forEach(owner => {
        //   allEditors.add(owner);
        // })
        // const editorUsers = Array.from(allEditors).map(editorId => ({
        //   ...roles.profiles[editorId],
        //   id: editorId
        // }));
        // setSpaceRoles(editorUsers)
      });

    return () => unsub();
  }, [canEdit, spaceId]);

  return spaceRoles;
}

export default useSpaceRoles;
