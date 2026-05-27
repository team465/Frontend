import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from './api';
import './App.css';

const emptyForm = { name: '', email: '' };

export default function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const data = await getUsers();
    setUsers(Array.isArray(data) ? data : []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    try {
      if (editingId) {
        await updateUser(editingId, form);
      } else {
        await createUser(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadUsers();
    } catch {
      setError('Something went wrong.');
    }
  }

  function handleEdit(user) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email });
    setError('');
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id);
    loadUsers();
  }

  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  return (
    <div className="container">
      <h1>User Management</h1>

      <form className="form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit User' : 'Add User'}</h2>
        {error && <p className="error">{error}</p>}
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <div className="form-actions">
          <button type="submit" className="btn primary">
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" className="btn secondary" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty">No users found.</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className="actions">
                  <button className="btn edit" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="btn delete" onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
