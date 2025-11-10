import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabaseClient';
import type { Task } from '../types'; // Import our new Task type
import { Link } from 'react-router-dom';
const DashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Function to fetch tasks for the current user
  const fetchTasks = async () => {
    try {
      setLoading(true);
      if (!user) return;

      // Fetch tasks from the 'tasks' table
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false }); // Show newest tasks first

      if (error) throw error;

      if (data) {
        setTasks(data);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks when the component first loads
  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to handle adding a new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() === '' || !user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle.trim(),
          user_id: user.id, // Associate the task with the logged-in user
        });

      if (error) throw error;

      // Refresh the task list and clear the input field
      await fetchTasks();
      setNewTaskTitle('');

    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Your Tasks</h1>
        <div>
          <span>{user?.email}</span>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Log Out</button>
        </div>
      </header>
      <nav>
        <Link to="/proposal-generator">Go to Proposal Generator</Link>
      </nav>

      <main>
        <form onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            style={{ width: '300px', padding: '8px' }}
          />
          <button type="submit" style={{ padding: '8px' }}>Add Task</button>
        </form>

        <div style={{ marginTop: '20px' }}>
          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <ul>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <li key={task.id}>{task.title}</li>
                ))
              ) : (
                <p>You have no tasks yet. Add one!</p>
              )}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;