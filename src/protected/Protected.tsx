
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/userStore";

interface ProtectedProps {
    children: ReactNode
}

const Protected = ({ children }: ProtectedProps) => {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  return <div>{children}</div>;
}

export default Protected;
