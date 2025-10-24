import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
