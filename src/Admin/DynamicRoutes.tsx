import dynamic from "next/dynamic";

const DynamicRoutes = dynamic(() => import("./Routes"), {
  loading: () => <p>Loading</p>,
  ssr: false,
});

export default DynamicRoutes;
