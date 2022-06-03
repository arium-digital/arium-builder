import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const Route = dynamic(() => import("website/invites"), {
  loading: () => <p>Loading</p>,
  ssr: false,
});

const Invite = () => {
  const router = useRouter();

  const { inviteId } = router.query;

  return <Route inviteId={inviteId as string | undefined} />;
};

export default Invite;
