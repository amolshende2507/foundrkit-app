import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabaseClient';

const DashboardPage = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <h1>Welcome to your Dashboard, {user?.email}</h1>
      <p>This is your protected area.</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default DashboardPage;