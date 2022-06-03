import { AnimatedAriumLogo } from "components/AnimatedAriumLogo";
import dynamic from "next/dynamic";

const DynamicRoute = dynamic(() => import("../../website/login"), {
  loading: () => <AnimatedAriumLogo />,
  ssr: false,
});

const LoginPage = () => {
  return <DynamicRoute />;
};

export default LoginPage;
