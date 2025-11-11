import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from 'react-toastify';
import { Toaster } from "react-hot-toast";  

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" reverseOrder={false} />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;


