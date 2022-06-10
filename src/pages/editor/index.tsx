import dynamic from "next/dynamic";

const Route = dynamic(() => import("../../Editor/Home"), {
  loading: () => <p>Loading</p>,
  ssr: false,
});

const EditorHome = () => {
  return <Route />;
};

export default EditorHome;
