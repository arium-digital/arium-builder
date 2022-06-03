import { useRouter } from "next/router";
import { useEffect } from "react";

const Admin = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/editor");
  }, [router]);

  return null;
};

export default Admin;
