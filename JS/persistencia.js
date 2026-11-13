import { pokemones as pokemonesDefecto } from "./db/pokemones.js";
import { usuarios as usuariosDefecto } from "./db/usuarios.js";

const CLAVE_POKEMONES = "pokemones";
const CLAVE_USUARIOS = "usuarios";

// Crea las bases iniciales una sola vez. Si ya existen datos guardados,
// no los reemplaza: así se conservan los cambios del usuario.
function inicializarBase(clave, datosDefecto) {
  const datosGuardados = localStorage.getItem(clave);

  if (datosGuardados === null) {
    localStorage.setItem(clave, JSON.stringify(datosDefecto));
    console.log(`Base de datos "${clave}" creada en localStorage.`);
    return;
  }

  // Si el contenido guardado está dañado, recupera la base inicial.
  try {
    const datos = JSON.parse(datosGuardados);
    if (!Array.isArray(datos)) {
      throw new Error("El contenido guardado no es una lista.");
    }
  } catch (error) {
    console.warn(`La base "${clave}" no era válida. Se restauraron los datos iniciales.`, error);
    localStorage.setItem(clave, JSON.stringify(datosDefecto));
  }
}

inicializarBase(CLAVE_POKEMONES, pokemonesDefecto);
inicializarBase(CLAVE_USUARIOS, usuariosDefecto);

function leerLista(clave, datosDefecto) {
  try {
    const contenido = localStorage.getItem(clave);
    if (contenido === null) {
      localStorage.setItem(clave, JSON.stringify(datosDefecto));
      return [...datosDefecto];
    }

    const datos = JSON.parse(contenido);
    if (Array.isArray(datos)) {
      return datos;
    }
  } catch (error) {
    console.error(`No se pudo leer "${clave}" desde localStorage.`, error);
  }

  localStorage.setItem(clave, JSON.stringify(datosDefecto));
  return [...datosDefecto];
}

export function leerPokemones() {
  return leerLista(CLAVE_POKEMONES, pokemonesDefecto);
}

export function leerUsuarios() {
  return leerLista(CLAVE_USUARIOS, usuariosDefecto);
}

export function guardarPokemones(pokemon) {
  const pokemonesActuales = leerPokemones();

  if (pokemonesActuales.some((pokemonGuardado) => Number(pokemonGuardado.id) === Number(pokemon.id))) {
    return false;
  }

  pokemonesActuales.push(pokemon);
  localStorage.setItem(CLAVE_POKEMONES, JSON.stringify(pokemonesActuales));
  console.log(`Pokémon ${pokemon.nombre} guardado en localStorage.`);
  return true;
}

export function guardarUsuarios(usuario) {
  const usuariosActuales = leerUsuarios();

  const usuarioExiste = usuariosActuales.some((usuarioGuardado) =>
    String(usuarioGuardado.username || "").toLowerCase() === String(usuario.username || "").toLowerCase() ||
    String(usuarioGuardado.email || "").toLowerCase() === String(usuario.email || "").toLowerCase()
  );

  if (usuarioExiste) {
    return false;
  }

  usuariosActuales.push(usuario);
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuariosActuales));
  console.log(`Usuario ${usuario.username} guardado en localStorage.`);
  return true;
}
