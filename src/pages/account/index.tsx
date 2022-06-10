import dynamic from "next/dynamic";

const DynamicallyLoadedAccountManagement = dynamic(
  () => import("../../website/account"),
  {
    loading: () => <p>Loading</p>,
    ssr: false,
  }
);

const AccountPage = () => {
  return <DynamicallyLoadedAccountManagement />;
};

export default AccountPage;
