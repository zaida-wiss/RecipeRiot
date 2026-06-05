import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthData, getAuthData, getAuthHeaders } from "../../api/authApi";

type AdminAccessStatus = "checking" | "allowed" | "denied";

const AdminPage = () => {
  const navigate = useNavigate();
  const [adminStatus, setAdminStatus] =
    useState<AdminAccessStatus>("checking");

  useEffect(() => {
    const checkAdminAccess = async () => {
      const authData = getAuthData();

      if (!authData) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("/api/v1/auth/admin", {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          clearAuthData();
          navigate("/");
          return;
        }

        if (response.status === 403) {
          navigate("/");
          return;
        }

        if (!response.ok) {
          setAdminStatus("denied");
          return;
        }

        setAdminStatus("allowed");
      } catch {
        setAdminStatus("denied");
      }
    };

    void checkAdminAccess();
  }, [navigate]);

  if (adminStatus === "checking") {
    return <p>Laddar adminpanelen...</p>;
  }

  if (adminStatus === "denied") {
    return <p>Du har inte behörighet att se adminpanelen.</p>;
  }

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      <p>Välkommen admin!</p>
    </div>
  );
};

export default AdminPage;
