const express = require('express');
const cors = require('cors');

const { v4: uuidv4, validate } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

const users = [];


// Função Middleware para verificar se o usúario existe ou não, através do username.
function checksExistsUserAccount(req, res, next) {

  const { username } = req.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {

    return res.status(404).json({error: 'Username not exists'});
  }

  req.user = req;

  return next();

}


// Função Middleware para verificar se o usúario é (Pro), ou se não é Pro, e se os (todos) já passaram de 10 para o tal usúario.
function checksCreateTodosUserAvailability(req, res, next) {

  const { user } = req;

  if(! user.pro && user.todos < 10 || user.pro === true) {

    return next();

  }else if(! user.pro && user.todos === 10) {

    return res.status(403).json({error: "user is not a pro user, or has passed the limit of all available !"});

  } else {

    return next();
  }



}


// Funçaõ Middleware para verificar se o usúario existe, se o Id existe é um (Uuid), se o (TODO) pertence a este usúario.
function checksTodoExists(req, res, next) {

  const { username } = req.headers;
  const { uuidv4 } = req.params;

  const user = users.find((user) => user.username === username);
  const todo = user.find((todos) => todos.uuidv4 === uuidv4);

  if(! user) {

    return res.status(404).json({error: "Username is not the same !"});

  } else if(! todo) {

    return res.status(400).json({error: "The user id is not the same !"});

  }else if(! todo &&  ! user) {

    return res.status(404).json({error: "The id does not belong to this user !"});

  }else {

    req.todo = todo;
    req.user = user;

  }

  return next();

}

function findUserById(req, res, next) {
  // Complete aqui
}

app.post('/users', (req, res) => {

  const { name, username } = req.body;

  const usernameAlreadyExists = users.some((user) => user.username === username);

  if (usernameAlreadyExists) {

    return res.status(400).json({ error: 'Username already exists' });
  }

  const user = {

    id: uuidv4(),
    name,
    username,
    pro: false,
    todos: []

  };

  users.push(user);

  return response.status(201).json(user);

});

app.get('/users/:id', findUserById, (req, res) => {

  const { user } = req;

  return res.json(user);

});

app.patch('/users/:id/pro', findUserById, (req, res) => {

  const { user } = req;

  if (user.pro) {

    return res.status(400).json({ error: 'Pro plan is already activated.' });
  }

  user.pro = true;

  return res.json(user);
  
});

app.get('/todos', checksExistsUserAccount, (req, res) => {

  const { user } = req;

  return res.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, checksCreateTodosUserAvailability, (req, res) => {

  const { title, deadline } = req.body;
  const { user } = req;

  const newTodo = {

    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()

  };

  user.todos.push(newTodo);

  return res.status(201).json(newTodo);
});

app.put('/todos/:id', checksTodoExists, (req, res) => {

  const { title, deadline } = req.body;
  const { todo } = req;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.json(todo);

});

app.patch('/todos/:id/done', checksTodoExists, (req, res) => {

  const { todo } = req;

  todo.done = true;

  return res.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, checksTodoExists, (req, res) => {

  const { user, todo } = req;

  const todoIndex = user.todos.indexOf(todo);

  if (todoIndex === -1) {

    return res.status(404).json({ error: 'Todo not found' });
  }

  user.todos.splice(todoIndex, 1);

  return res.status(204).send();

});

module.exports = {

  app,
  users,
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  checksTodoExists,
  findUserById
  
};