import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import StudentBookingsPage from './StudentBookingsPage';
import InstructorBookingsPage from './InstructorBookingsPage';

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  if (authLoading)
    return (
      <div>
        <Spinner size="lg" text="Checking authentication..." />
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  
  const role = user.role;

  return (
    <div className="w-full">
      {role === 'Student' ? <StudentBookingsPage/> : <InstructorBookingsPage/>}
    </div>
  );
}
