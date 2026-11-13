# PokeApp

Proyecto educativo de una Pokédex web realizado con HTML, CSS y JavaScript (módulos ES).

## Cómo ejecutar

1. Abrí la carpeta `PokeApp-Git` en Visual Studio Code.
2. Abrí `index.html` con la extensión **Live Server**.
3. No abras el archivo directamente con `file://`: la aplicación utiliza módulos JavaScript y `localStorage`.

## Funciones

- Pantalla de inicio y navegación.
- Pokédex cargada desde los datos guardados en `localStorage`.
- Búsqueda por número, nombre o tipo.
- Ficha con los datos de cada Pokémon.
- Inicio de sesión con perfiles comunes y administradores.
- Registro de usuarios, guardado en `localStorage`.
- Formulario de administrador para agregar Pokémon con sus datos.
- Batalla por turnos: atacar, usar una poción o defenderse, hasta obtener un resultado.

## Usuarios de demostración

Administrador:
- Usuario: `Iván`
- Contraseña: `0608`

Usuario común:
- Usuario: `2468`
- Contraseña: `lucas2026`

## Organización

- `index.html`: estructura principal.
- `css/style.css`: estilos.
- `js/app.js`: pantallas, navegación y eventos.
- `js/persistencia.js`: lectura y guardado de Pokémon y usuarios en `localStorage`.
- `js/db/pokemones.js`: datos iniciales de Pokémon.
- `js/db/usuarios.js`: usuarios iniciales.
- `js/db/game.js`: lógica de la batalla.
- `assets/`: imágenes, avatares y sonidos.

Los datos guardados en `localStorage` permanecen en el navegador y en el mismo origen donde se ejecuta la aplicación.
