import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

const SetRaycasterFromMouse = () => {
  const { raycaster, camera } = useThree();

  useEffect(() => {
    const updateRaycaster = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (camera.position) raycaster.setFromCamera({ x, y }, camera);
    };

    document.addEventListener("mousemove", updateRaycaster);

    return () => {
      document.removeEventListener("mousemove", updateRaycaster);
    };
  }, [camera, raycaster]);

  return null;
};
export default SetRaycasterFromMouse;
