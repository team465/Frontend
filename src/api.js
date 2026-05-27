const BASE_URL = '/api/users';

export const getUsers = () => fetch(BASE_URL).then(r => r.json());

export const createUser = (data) =>
  fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const updateUser = (id, data) =>
  fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const deleteUser = (id) =>
  fetch(`${BASE_URL}/${id}`, { method: 'DELETE' }).then(r => r.json());
