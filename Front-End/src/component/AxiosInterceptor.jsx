import { useContext, useEffect } from 'react';
import axiosInstance from '../ReusableFolder/axioxInstance';
import { AuthContext } from '../contexts/AuthContext';

const AxiosInterceptor = () => {
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;

        if (status === 401) {
          console.log('401 Unauthorized - Logging out...');
          logout();
        }

        if (status === 500 || !error.response) {
          console.log('Server Error or Network Issue - Redirecting...');
          window.location.href = "/connection-issue"; // ✅ SAFE
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return null;
};

export default AxiosInterceptor;