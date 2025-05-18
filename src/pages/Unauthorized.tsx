
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="mb-6">
          You don't have permission to access this page. If you believe this is an error, please contact your administrator.
        </p>
        <div className="flex space-x-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
