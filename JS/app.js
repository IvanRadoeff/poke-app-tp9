import {
  leerPokemones,
  leerUsuarios,
  guardarPokemones,
  guardarUsuarios,
} from "./persistencia.js";
import { crearEstadoBatalla, resolverAccion } from "./db/game.js";

// ==========================================
// ELEMENTOS PRINCIPALES
// ==========================================

const app = document.querySelector("#app");
const formularioBusqueda = document.querySelector("#form-busqueda");
let estadoBatallaActual = null;

function escaparHTML(valor = "") {
  return String(valor).replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[caracter]);
}

function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obtenerTiposHTML(tipos = []) {
  return tipos.map((tipo) => {
    const tipoSeguro = escaparHTML(tipo);
    const claseTipo = normalizarTexto(tipo);
    return `<span class="type type-${claseTipo}">${tipoSeguro}</span>`;
  }).join("");
}

// ==========================================
// 1. INICIO
// ==========================================

const landing = `
  <div class="Titulos">
    <section class="landing">
      <div class="titulo">
        <h1>Bienvenido a la PokéAPP</h1>
      </div>
      <div class="subtitulo">
        <h2>Elige un menú para empezar</h2>
      </div>
      <div class="musica">
        <p>¿QUIERES UN POCO DE AMBIENTACIÓN?</p>
        <audio controls loop>
          <source src="./assets/sound/Cancion menú.mp3" type="audio/mpeg">
        </audio>
      </div>
    </section>
  </div>
`;

function cargarLanding() {
  console.log("Pantalla de inicio cargada.");
}

const logo = document.querySelector(".header-logo img");
logo.addEventListener("click", () => {
  app.innerHTML = landing;
  cargarLanding();
});

// ==========================================
// 2. POKÉDEX Y DETALLES
// ==========================================

const pokedex = `
  <section class="pokedex-section">
    <div class="pokedex-header">
      <h1>Pokédex</h1>
      <p>Todos los Pokémon registrados en la aplicación.</p>
    </div>
    <div id="pokedex-gallery" class="pokedex-gallery"></div>
  </section>
`;

function cargarPokedex(filtro = "") {
  const pokedexGallery = document.querySelector("#pokedex-gallery");
  if (!pokedexGallery) return;

  const busqueda = normalizarTexto(filtro);
  const pokemonesActuales = leerPokemones();

  const pokemonesFiltrados = pokemonesActuales.filter((pokemon) => {
    const tipos = Array.isArray(pokemon.tipo) ? pokemon.tipo.join(" ") : "";
    const contenido = `${pokemon.id} ${pokemon.nombre || ""} ${tipos}`;
    return normalizarTexto(contenido).includes(busqueda);
  });

  if (pokemonesFiltrados.length === 0) {
    pokedexGallery.innerHTML = `<p class="mensaje-vacio">No se encontraron Pokémon.</p>`;
    return;
  }

  pokedexGallery.innerHTML = pokemonesFiltrados.map((pokemon) => `
    <article class="pokemon-card">
      <div class="pokemon-image">
        <img src="${escaparHTML(pokemon.imagen || "")}" alt="${escaparHTML(pokemon.nombre || "Pokémon")}">
      </div>
      <div class="pokemon-info">
        <span class="pokemon-id">N.º ${escaparHTML(pokemon.id)}</span>
        <h2>${escaparHTML(pokemon.nombre || "Sin nombre")}</h2>
        <div class="pokemon-types">
          ${obtenerTiposHTML(Array.isArray(pokemon.tipo) ? pokemon.tipo : [])}
        </div>
        <p class="pokemon-rareza">${escaparHTML(pokemon.rareza || "Sin rareza")}</p>
        <button class="btn-detalle" data-id="${escaparHTML(pokemon.id)}" type="button">
          Ver detalles
        </button>
      </div>
    </article>
  `).join("");

  pokedexGallery.addEventListener("click", manejarClickDetalle);
}

function manejarClickDetalle(event) {
  const boton = event.target.closest(".btn-detalle");
  if (!boton) return;
  mostrarDetallePokemon(Number(boton.dataset.id));
}

function mostrarDetallePokemon(id) {
  const pokemonesActuales = leerPokemones();
  const pokemon = pokemonesActuales.find((elemento) => Number(elemento.id) === Number(id));

  if (!pokemon) {
    app.innerHTML = `${pokedex}<p class="mensaje-vacio">No se encontró ese Pokémon.</p>`;
    cargarPokedex();
    return;
  }

  const tipos = Array.isArray(pokemon.tipo) ? pokemon.tipo : [];
  const imagenShiny = pokemon.shiny && pokemon.imagenShiny
    ? `<div class="detalle-shiny"><h2>Forma Shiny</h2><img src="${escaparHTML(pokemon.imagenShiny)}" alt="${escaparHTML(pokemon.nombre)} Shiny"></div>`
    : "";

  app.innerHTML = `
    <section class="detalle-section">
      <button id="btn-volver" type="button">Volver a la Pokédex</button>
      <h1>${escaparHTML(pokemon.nombre)}</h1>
      <img src="${escaparHTML(pokemon.imagen || "")}" alt="${escaparHTML(pokemon.nombre)}">
      <p><strong>Número:</strong> ${escaparHTML(pokemon.id)}</p>
      <p><strong>Descripción:</strong> ${escaparHTML(pokemon.descripcion || "Sin descripción")}</p>
      <p><strong>Tipo:</strong> ${tipos.map(escaparHTML).join(" / ") || "Sin tipo"}</p>
      <p><strong>Rareza:</strong> ${escaparHTML(pokemon.rareza || "No especificada")}</p>
      <p><strong>Altura:</strong> ${escaparHTML(pokemon.altura ?? "No especificada")} m</p>
      <p><strong>Peso:</strong> ${escaparHTML(pokemon.peso ?? "No especificado")} kg</p>
      <p><strong>Habilidad:</strong> ${escaparHTML(pokemon.habilidad || "No especificada")}</p>
      <p><strong>Generación:</strong> ${escaparHTML(pokemon.generacion ?? "No especificada")}</p>
      <p><strong>HP:</strong> ${escaparHTML(pokemon.hp ?? "—")}</p>
      <p><strong>Ataque:</strong> ${escaparHTML(pokemon.ataque ?? "—")}</p>
      <p><strong>Defensa:</strong> ${escaparHTML(pokemon.defensa ?? "—")}</p>
      <p><strong>Velocidad:</strong> ${escaparHTML(pokemon.velocidad ?? "—")}</p>
      <p><strong>¿Tiene evolución?:</strong> ${pokemon.tieneEvolucion ? "Sí" : "No"}</p>
      ${pokemon.tieneEvolucion ? `<p><strong>Evolución:</strong> ${escaparHTML(pokemon.evolucion || "No especificada")}</p><p><strong>Nivel de evolución:</strong> ${escaparHTML(pokemon.nivelEvolucion ?? "No especificado")}</p>` : ""}
      ${pokemon.sonido ? `<audio controls><source src="${escaparHTML(pokemon.sonido)}" type="audio/mpeg"></audio>` : ""}
      <p><strong>Shiny:</strong> ${pokemon.shiny ? "Sí" : "No"}</p>
      ${imagenShiny}
    </section>
  `;

  document.querySelector("#btn-volver").addEventListener("click", () => {
    app.innerHTML = pokedex;
    cargarPokedex();
  });
}

document.querySelector("#link-pokedex").addEventListener("click", (event) => {
  event.preventDefault();
  app.innerHTML = pokedex;
  cargarPokedex();
});

// ==========================================
// 3. INICIAR SESIÓN
// ==========================================

const login = `
  <section class="login-section">
    <div class="sesion"><h1>INICIAR SESIÓN</h1></div>
    <div class="formulario">
      <form id="form-login">
        <label for="username">Usuario</label>
        <input type="text" id="username" required>
        <label for="password">Contraseña</label>
        <input type="password" id="password" required>
        <button type="submit">Ingresar</button>
      </form>
      <p id="mensaje-login" class="mensaje-formulario" aria-live="polite"></p>
    </div>
  </section>
`;

const perfilEstandar = `
  <section class="user-profile" id="user-profile">
    <h2>Perfil de usuario</h2>
    <div class="user-profile-info">
      <div><img src="./assets/avatar/default.png" alt="Avatar de usuario" class="user-profile-avatar"></div>
      <div>
        <p>Nombre de usuario: <span class="user-profile-username">Usuario</span></p>
        <p>Email: <span class="user-profile-email">usuario@example.com</span></p>
      </div>
    </div>
  </section>
`;

const perfilAdmin = `
  <section class="user-profile" id="user-profile">
    <h2>Perfil de administrador</h2>
    <div class="user-profile-info">
      <div><img src="./assets/avatar/default.png" alt="Avatar de usuario" class="user-profile-avatar"></div>
      <div>
        <p>Nombre de usuario: <span class="user-profile-username">Usuario</span></p>
        <p>Email: <span class="user-profile-email">usuario@example.com</span></p>
      </div>
    </div>
  </section>

  <section class="new-pokemon" id="new-pokemon">
    <h2>Agregar un Pokémon</h2>
    <form id="form-nuevo-pokemon">
      <label for="pokemon-number">Número en la Pokédex</label>
      <input type="number" id="pokemon-number" min="1" step="1" required>

      <label for="pokemon-name">Nombre</label>
      <input type="text" id="pokemon-name" required>

      <label for="pokemon-type">Tipo(s), separados por coma</label>
      <input type="text" id="pokemon-type" placeholder="Ej.: Planta, Veneno" required>

      <label for="pokemon-description">Descripción</label>
      <textarea id="pokemon-description" rows="3" required></textarea>

      <label for="pokemon-height">Altura (m)</label>
      <input type="number" id="pokemon-height" min="0" step="0.1" required>

      <label for="pokemon-weight">Peso (kg)</label>
      <input type="number" id="pokemon-weight" min="0" step="0.1" required>

      <label for="pokemon-generation">Generación</label>
      <input type="number" id="pokemon-generation" min="1" step="1" required>

      <label for="pokemon-hp">HP</label>
      <input type="number" id="pokemon-hp" min="1" step="1" required>

      <label for="pokemon-attack">Ataque</label>
      <input type="number" id="pokemon-attack" min="0" step="1" required>

      <label for="pokemon-speed">Velocidad</label>
      <input type="number" id="pokemon-speed" min="0" step="1" required>

      <label for="pokemon-defense">Defensa</label>
      <input type="number" id="pokemon-defense" min="0" step="1" required>

      <label for="pokemon-ability">Habilidad</label>
      <input type="text" id="pokemon-ability" required>

      <label for="pokemon-has-evolution">¿Tiene evolución?</label>
      <select id="pokemon-has-evolution">
        <option value="false">No</option>
        <option value="true">Sí</option>
      </select>

      <label for="pokemon-evolution">Evolución</label>
      <input type="text" id="pokemon-evolution" placeholder="Dejar vacío si no tiene">

      <label for="pokemon-evolution-level">Nivel de evolución</label>
      <input type="number" id="pokemon-evolution-level" min="1" step="1">

      <label for="pokemon-rarity">Rareza</label>
      <select id="pokemon-rarity" required>
        <option value="Común">Común</option>
        <option value="Poco común">Poco común</option>
        <option value="Raro">Raro</option>
        <option value="Legendario">Legendario</option>
      </select>

      <label for="pokemon-image">Imagen (ruta o URL)</label>
      <input type="text" id="pokemon-image" placeholder="./assets/img/nombre.png" required>

      <label for="pokemon-sound">Sonido (ruta o URL)</label>
      <input type="text" id="pokemon-sound" placeholder="./assets/sound/nombre.mp3">

      <label class="checkbox-label" for="pokemon-shiny">
        <input type="checkbox" id="pokemon-shiny"> Tiene forma Shiny
      </label>

      <label for="pokemon-shiny-image">Imagen Shiny (ruta o URL)</label>
      <input type="text" id="pokemon-shiny-image" placeholder="./assets/img/nombre-shiny.png">

      <button type="submit">Agregar Pokémon</button>
      <p id="resultado-pokemon" class="mensaje-formulario" aria-live="polite"></p>
    </form>
  </section>
`;

function mostrarDatosUsuario(usuario) {
  const nombre = document.querySelector(".user-profile-username");
  const email = document.querySelector(".user-profile-email");
  const avatar = document.querySelector(".user-profile-avatar");

  if (nombre) nombre.textContent = usuario.username;
  if (email) email.textContent = usuario.email;
  if (avatar) {
    avatar.src = usuario.avatar || "./assets/avatar/default.png";
    avatar.alt = `Avatar de ${usuario.username}`;
  }
}

document.querySelector("#link-login").addEventListener("click", (event) => {
  event.preventDefault();
  app.innerHTML = login;

  document.querySelector("#form-login").addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();

    const username = document.querySelector("#username").value.trim();
    const password = document.querySelector("#password").value;
    const usuario = leerUsuarios().find((elemento) =>
      String(elemento.username).toLowerCase() === username.toLowerCase() &&
      elemento.password === password
    );

    if (!usuario) {
      document.querySelector("#mensaje-login").textContent = "Usuario o contraseña incorrectos.";
      document.querySelector("#mensaje-login").classList.add("error");
      return;
    }

    app.innerHTML = usuario.admin ? perfilAdmin : perfilEstandar;
    mostrarDatosUsuario(usuario);

    if (usuario.admin) {
      cargarPerfilAdmin();
    }
  });
});

// ==========================================
// 4. REGISTRO DE USUARIOS
// ==========================================

const registro = `
  <section class="registro-section">
    <div class="Registro"><h1>Registrarse</h1></div>
    <div class="formulario-registro">
      <form id="form-registro">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" required>

        <label for="email">Email</label>
        <input type="email" id="email" required>

        <label for="nuevo-username">Usuario</label>
        <input type="text" id="nuevo-username" required>

        <label for="nueva-password">Contraseña</label>
        <input type="password" id="nueva-password" minlength="4" required>

        <button type="submit">Registrarse</button>
      </form>
      <p id="mensaje-registro" class="mensaje-formulario" aria-live="polite"></p>
    </div>
  </section>
`;

document.querySelector("#link-registro").addEventListener("click", (event) => {
  event.preventDefault();
  app.innerHTML = registro;

  document.querySelector("#form-registro").addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();

    const nombre = document.querySelector("#nombre").value.trim();
    const email = document.querySelector("#email").value.trim();
    const username = document.querySelector("#nuevo-username").value.trim();
    const password = document.querySelector("#nueva-password").value;
    const usuariosActuales = leerUsuarios();

    const usuarioExiste = usuariosActuales.some((usuario) =>
      String(usuario.username).toLowerCase() === username.toLowerCase() ||
      String(usuario.email).toLowerCase() === email.toLowerCase()
    );

    const mensaje = document.querySelector("#mensaje-registro");
    if (usuarioExiste) {
      mensaje.textContent = "Ese nombre de usuario o email ya está registrado.";
      mensaje.classList.add("error");
      return;
    }

    const nuevoUsuario = {
      id: usuariosActuales.reduce((mayor, usuario) => Math.max(mayor, Number(usuario.id) || 0), 0) + 1,
      nombre,
      email,
      username,
      password,
      avatar: "./assets/avatar/default.png",
      admin: false,
    };

    if (guardarUsuarios(nuevoUsuario)) {
      mensaje.classList.remove("error");
      mensaje.textContent = "¡Registro exitoso! Ya podés iniciar sesión.";
      submitEvent.target.reset();
    } else {
      mensaje.textContent = "No se pudo guardar el usuario. Revisá los datos e intentá nuevamente.";
      mensaje.classList.add("error");
    }
  });
});

// ==========================================
// 5. BATALLA POKÉMON
// ==========================================

const batalla = `
  <section class="batalla-section">
    <h1>Batalla Pokémon</h1>
    <p>Elegí uno de tus Pokémon para comenzar el combate.</p>
    <div class="battle-setup">
      <label for="pokemon-jugador">Tu Pokémon</label>
      <select id="pokemon-jugador"></select>
      <button id="btn-comenzar-batalla" type="button">Comenzar batalla</button>
    </div>
    <div id="arena-batalla"></div>
  </section>
`;

function cargarBatalla() {
  estadoBatallaActual = null;
  const pokemonesActuales = leerPokemones();
  const selector = document.querySelector("#pokemon-jugador");
  const arena = document.querySelector("#arena-batalla");

  if (pokemonesActuales.length < 2) {
    selector.innerHTML = "";
    arena.textContent = "Necesitás al menos dos Pokémon registrados para combatir.";
    return;
  }

  selector.innerHTML = pokemonesActuales.map((pokemon) =>
    `<option value="${escaparHTML(pokemon.id)}">${escaparHTML(pokemon.nombre)}</option>`
  ).join("");

  document.querySelector("#btn-comenzar-batalla").addEventListener("click", () => {
    const elegido = pokemonesActuales.find((pokemon) =>
      Number(pokemon.id) === Number(selector.value)
    );
    const rivales = pokemonesActuales.filter((pokemon) =>
      Number(pokemon.id) !== Number(selector.value)
    );
    const rival = rivales[Math.floor(Math.random() * rivales.length)];

    estadoBatallaActual = crearEstadoBatalla(elegido, rival);
    dibujarEstadoBatalla();
  });

  arena.addEventListener("click", (event) => {
    const botonAccion = event.target.closest("[data-accion]");
    if (botonAccion && estadoBatallaActual && !estadoBatallaActual.finalizada) {
      estadoBatallaActual = resolverAccion(estadoBatallaActual, botonAccion.dataset.accion);
      dibujarEstadoBatalla();
      return;
    }

    if (event.target.closest("#btn-nueva-batalla")) {
      estadoBatallaActual = null;
      arena.innerHTML = "";
    }
  });
}

function dibujarEstadoBatalla() {
  const arena = document.querySelector("#arena-batalla");
  if (!arena || !estadoBatallaActual) return;

  const estado = estadoBatallaActual;
  const jugador = estado.pokemonJugador;
  const rival = estado.pokemonRival;
  const hpMaxJugador = Number(jugador.hp) || 50;
  const hpMaxRival = Number(rival.hp) || 50;

  arena.innerHTML = `
    <div class="battle-arena">
      <div class="battle-fighters">
        <article class="battle-card">
          <h2>${escaparHTML(rival.nombre)}</h2>
          <img src="${escaparHTML(rival.imagen || "")}" alt="${escaparHTML(rival.nombre)}">
          <p>Rival</p>
          <progress max="${hpMaxRival}" value="${estado.hpRival}"></progress>
          <p>HP: ${estado.hpRival} / ${hpMaxRival}</p>
        </article>
        <article class="battle-card">
          <h2>${escaparHTML(jugador.nombre)}</h2>
          <img src="${escaparHTML(jugador.imagen || "")}" alt="${escaparHTML(jugador.nombre)}">
          <p>Tu Pokémon</p>
          <progress max="${hpMaxJugador}" value="${estado.hpJugador}"></progress>
          <p>HP: ${estado.hpJugador} / ${hpMaxJugador}</p>
        </article>
      </div>

      <div class="battle-actions">
        <p><strong>Turno ${estado.turno}</strong></p>
        ${estado.finalizada
          ? `<h2 class="battle-result">${estado.resultado === "victoria" ? "¡Victoria!" : "Derrota"}</h2>
             <button id="btn-nueva-batalla" type="button">Volver a elegir Pokémon</button>`
          : `<button type="button" data-accion="atacar">Atacar</button>
             <button type="button" data-accion="pocion" ${estado.pocionUsada ? "disabled" : ""}>Usar poción</button>
             <button type="button" data-accion="defender">Defender</button>
             <p class="battle-help">${estado.pocionUsada ? "Ya usaste la poción." : "Tenés una poción disponible durante la batalla."}</p>`
        }
      </div>

      <div class="battle-log">
        <h3>Registro de la batalla</h3>
        <ul>${estado.historial.map((linea) => `<li>${escaparHTML(linea)}</li>`).join("")}</ul>
      </div>
    </div>
  `;
}

document.querySelector("#link-juego").addEventListener("click", (event) => {
  event.preventDefault();
  app.innerHTML = batalla;
  cargarBatalla();
});

// ==========================================
// 6. PERFIL DE ADMINISTRADOR: AGREGAR POKÉMON
// ==========================================

function cargarPerfilAdmin() {
  const formularioNuevoPokemon = document.querySelector("#form-nuevo-pokemon");
  if (!formularioNuevoPokemon) return;

  formularioNuevoPokemon.addEventListener("submit", (event) => {
    event.preventDefault();

    const obtenerValor = (id) => document.querySelector(`#${id}`).value.trim();
    const obtenerNumero = (id) => document.querySelector(`#${id}`).valueAsNumber;

    const tipos = obtenerValor("pokemon-type")
      .split(",")
      .map((tipo) => tipo.trim())
      .filter(Boolean);

    const tieneEvolucion = obtenerValor("pokemon-has-evolution") === "true";
    const shiny = document.querySelector("#pokemon-shiny").checked;

    const nuevoPokemon = {
      id: obtenerNumero("pokemon-number"),
      nombre: obtenerValor("pokemon-name"),
      tipo: tipos,
      descripcion: obtenerValor("pokemon-description"),
      altura: obtenerNumero("pokemon-height"),
      peso: obtenerNumero("pokemon-weight"),
      generacion: obtenerNumero("pokemon-generation"),
      hp: obtenerNumero("pokemon-hp"),
      ataque: obtenerNumero("pokemon-attack"),
      velocidad: obtenerNumero("pokemon-speed"),
      defensa: obtenerNumero("pokemon-defense"),
      habilidad: obtenerValor("pokemon-ability"),
      tieneEvolucion,
      evolucion: tieneEvolucion ? obtenerValor("pokemon-evolution") : null,
      nivelEvolucion: tieneEvolucion && obtenerValor("pokemon-evolution-level")
        ? obtenerNumero("pokemon-evolution-level")
        : null,
      rareza: obtenerValor("pokemon-rarity"),
      imagen: obtenerValor("pokemon-image"),
      sonido: obtenerValor("pokemon-sound"),
      shiny,
      imagenShiny: shiny ? obtenerValor("pokemon-shiny-image") : "",
    };

    const resultado = document.querySelector("#resultado-pokemon");
    if (tipos.length === 0 || !Number.isFinite(nuevoPokemon.id)) {
      resultado.textContent = "Revisá el número y el tipo del Pokémon.";
      resultado.classList.add("error");
      return;
    }

    if (shiny && !nuevoPokemon.imagenShiny) {
      resultado.textContent = "Agregá la imagen Shiny o desmarcá esa opción.";
      resultado.classList.add("error");
      return;
    }

    if (guardarPokemones(nuevoPokemon)) {
      resultado.classList.remove("error");
      resultado.textContent = `${nuevoPokemon.nombre} se guardó correctamente. Ya aparece en la Pokédex.`;
      formularioNuevoPokemon.reset();
      document.querySelector("#pokemon-number").focus();
    } else {
      resultado.textContent = "Ya existe un Pokémon con ese número. Elegí otro número.";
      resultado.classList.add("error");
    }
  });
}

// ==========================================
// 7. BUSCADOR GENERAL
// ==========================================

formularioBusqueda.addEventListener("submit", (event) => {
  event.preventDefault();
  const consulta = document.querySelector("#busqueda").value.trim();
  app.innerHTML = pokedex;
  cargarPokedex(consulta);
});

// ==========================================
// PANTALLA INICIAL
// ==========================================

app.innerHTML = landing;
cargarLanding();
