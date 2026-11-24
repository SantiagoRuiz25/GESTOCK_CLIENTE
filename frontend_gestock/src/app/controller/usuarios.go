import { getUsuarios, setUsuarios, getRoles } from '../data/usuarios-gest.data.js';

export const obtenerUsuarios = (req, res) => {
  res.json(getUsuarios());
};

export const crearUsuario = (req, res) => {
  const usuario = req.body || {};
  const usuarios = getUsuarios();
  const id = usuarios.length === 0 ? 1 : Math.max(...usuarios.map((u) => u.id)) + 1;
  const nuevo = { id, ...usuario };
  setUsuarios([...usuarios, nuevo]);
  res.status(201).json(nuevo);
};

export const actualizarUsuario = (req, res, next) => {
  const id = Number(req.params.id);
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) {
    return next({ message: 'Usuario no encontrado', status: 404 });
  }
  usuarios[index] = { ...usuarios[index], ...req.body };
  setUsuarios([...usuarios]);
  res.json(usuarios[index]);
};

export const eliminarUsuario = (req, res, next) => {
  const id = Number(req.params.id);
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) {
    return next({ message: 'Usuario no encontrado', status: 404 });
  }
  usuarios.splice(index, 1);
  setUsuarios([...usuarios]);
  res.status(204).send();
};

export const obtenerRoles = (req, res) => {
  res.json(getRoles());
};