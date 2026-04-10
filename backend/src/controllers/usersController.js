// src/controllers/usersController.js
// Logiken för user-endpoints
// Enkel lista ersätter databasen tills vidare - samma mönster som studiematerialet

const users = [
  { id: 1, username: 'anna_kocker', email: 'anna@example.com' },
  { id: 2, username: 'erik_mat', email: 'erik@example.com' },
];

// GET /api/v1/users
const getAllUsers = (req, res) => {
  res.json(users);
};

// GET /api/v1/users/:id
const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: 'Användaren hittades inte' });
  }

  res.json(user);
};

// POST /api/v1/users
const createUser = (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'username och email krävs' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    email,
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

// PUT /api/v1/users/:id
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Användaren hittades inte' });
  }

  users[index] = { id, ...req.body };
  res.json(users[index]);
};

// DELETE /api/v1/users/:id
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Användaren hittades inte' });
  }

  users.splice(index, 1);
  res.status(204).send();
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
