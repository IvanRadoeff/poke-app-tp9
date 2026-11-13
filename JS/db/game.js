// Lógica sencilla de combate por turnos para PokeApp.

export function crearEstadoBatalla(pokemonJugador, pokemonRival) {
  return {
    pokemonJugador,
    pokemonRival,
    hpJugador: Number(pokemonJugador.hp) || 50,
    hpRival: Number(pokemonRival.hp) || 50,
    pocionUsada: false,
    turno: 1,
    finalizada: false,
    resultado: "",
    historial: [`¡Comienza la batalla! ${pokemonJugador.nombre} contra ${pokemonRival.nombre}.`],
  };
}

function calcularDanio(ataque) {
  const valorAtaque = Number(ataque) || 10;
  return Math.max(5, Math.floor(valorAtaque * 0.3) + Math.floor(Math.random() * 6));
}

export function resolverAccion(estado, accion) {
  if (estado.finalizada) return estado;

  const nuevoEstado = {
    ...estado,
    historial: [...estado.historial],
  };

  let defensaReducida = false;

  if (accion === "atacar") {
    const danio = calcularDanio(nuevoEstado.pokemonJugador.ataque);
    nuevoEstado.hpRival = Math.max(0, nuevoEstado.hpRival - danio);
    nuevoEstado.historial.push(
      `${nuevoEstado.pokemonJugador.nombre} atacó e hizo ${danio} puntos de daño.`
    );
  } else if (accion === "pocion") {
    if (nuevoEstado.pocionUsada) {
      nuevoEstado.historial.push("Ya utilizaste la poción de esta batalla.");
      return nuevoEstado;
    }

    const hpAnterior = nuevoEstado.hpJugador;
    const hpMaximo = Number(nuevoEstado.pokemonJugador.hp) || 50;
    nuevoEstado.hpJugador = Math.min(hpMaximo, nuevoEstado.hpJugador + 25);
    nuevoEstado.pocionUsada = true;
    nuevoEstado.historial.push(
      `Usaste una poción y recuperaste ${nuevoEstado.hpJugador - hpAnterior} puntos de HP.`
    );
  } else if (accion === "defender") {
    defensaReducida = true;
    nuevoEstado.historial.push(`${nuevoEstado.pokemonJugador.nombre} se preparó para defenderse.`);
  } else {
    return nuevoEstado;
  }

  if (nuevoEstado.hpRival <= 0) {
    nuevoEstado.finalizada = true;
    nuevoEstado.resultado = "victoria";
    nuevoEstado.historial.push(`¡${nuevoEstado.pokemonRival.nombre} fue derrotado! ¡Ganaste!`);
    return nuevoEstado;
  }

  const danioRival = calcularDanio(nuevoEstado.pokemonRival.ataque);
  const danioRecibido = defensaReducida ? Math.max(1, Math.floor(danioRival / 2)) : danioRival;
  nuevoEstado.hpJugador = Math.max(0, nuevoEstado.hpJugador - danioRecibido);
  nuevoEstado.historial.push(
    `${nuevoEstado.pokemonRival.nombre} respondió e hizo ${danioRecibido} puntos de daño.`
  );

  if (nuevoEstado.hpJugador <= 0) {
    nuevoEstado.finalizada = true;
    nuevoEstado.resultado = "derrota";
    nuevoEstado.historial.push(`¡${nuevoEstado.pokemonJugador.nombre} ya no puede continuar! Ganó ${nuevoEstado.pokemonRival.nombre}.`);
  } else {
    nuevoEstado.turno += 1;
  }

  return nuevoEstado;
}
