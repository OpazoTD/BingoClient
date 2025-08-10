// Estado del juego
let cartonActual = [];
let estadoMarcado = [];

// Configuración de rangos para cada columna del Bingo
const RANGOS_BINGO = {
    B: { min: 1, max: 15 },
    I: { min: 16, max: 30 },
    N: { min: 31, max: 45 },
    G: { min: 46, max: 60 },
    O: { min: 61, max: 75 }
};

/**
 * @param {number} min - Número mínimo del rango
 * @param {number} max - Número máximo del rango
 * @param {number} cantidad - Cantidad de números a generar
 * @returns {Array} Array de números únicos
 */
// Genera números aleatorios
function generarNumerosUnicos(min, max, cantidad) {
    const numeros = [];
    const numerosDisponibles = [];
    // Crear array con todos los números posibles
    for (let i = min; i <= max; i++) {
        numerosDisponibles.push(i);}
    // Selecciona números aleatorios
    for (let i = 0; i < cantidad; i++) {
        const indiceAleatorio = Math.floor(Math.random() * numerosDisponibles.length);
        numeros.push(numerosDisponibles.splice(indiceAleatorio, 1)[0]);}
    return numeros;
}

/*** @returns {Array} Matriz 5x5 con los números del cartón*/
// Genera el cartón de bingo
function generarCarton() {
    const carton = [];
    const columnas = ['B', 'I', 'N', 'G', 'O'];
    
    // Genera 5 números para cada columna
    for (let col = 0; col < 5; col++) {
        const columna = columnas[col];
        const rango = RANGOS_BINGO[columna];
        let cantidad = 5;
        // La columna N solo tiene 4 números (el centro es GRATIS)
        if (columna === 'N') {
            cantidad = 4;}
        const numerosColumna = generarNumerosUnicos(rango.min, rango.max, cantidad);
        // Llenar la columna en el cartón
        for (let fila = 0; fila < 5; fila++) {
            if (!carton[fila]) {
                carton[fila] = [];}
            // El centro (posición 2,2) es GRATIS en la columna N
            if (columna === 'N' && fila === 2) {
                carton[fila][col] = 'GRATIS';} else {
                // Ajusta el índice para la columna N después del espacio "GRATIS"
                let indiceNumero = fila;
                if (columna === 'N' && fila > 2) {
                    indiceNumero = fila - 1;
                }
                carton[fila][col] = numerosColumna[indiceNumero];
            }
        }
    }
    return carton;
}


//Renderiza el cartón en el DOM
function renderizarCarton() {
    const contenedorCarton = document.querySelector('#bingo-card');
    
    // Limpiar contenedor
    contenedorCarton.innerHTML = '';
    
    // Crear casillas
    for (let fila = 0; fila < 5; fila++) {
        for (let col = 0; col < 5; col++) {
            const casilla = document.createElement('div');
            casilla.className = 'casilla';
            
            const valor = cartonActual[fila][col];
            casilla.textContent = valor;
            
            // Marcar casilla GRATIS
            if (valor === 'GRATIS') {
                casilla.classList.add('gratis');
                estadoMarcado[fila][col] = true; // GRATIS está siempre marcado
            }
            
            // Aplicar estado marcado si corresponde
            if (estadoMarcado[fila][col]) {
                casilla.classList.add('marcado');
            }
            
            // Añadir evento de clic
            casilla.addEventListener('click', (event) => marcarNumero(event, fila, col));
            
            contenedorCarton.appendChild(casilla);
        }
    }
}

/**
 * Maneja el clic en una casilla para marcarla/desmarcarla
 * @param {Event} event - Evento del clic
 * @param {number} fila - Fila de la casilla
 * @param {number} col - Columna de la casilla
 */
function marcarNumero(event, fila, col) {
    const casilla = event.target;
    // Alternar estado marcado
    estadoMarcado[fila][col] = !estadoMarcado[fila][col];
    // Actualizar clase CSS
    casilla.classList.toggle('marcado');
    // Guardar estado en localStorage
    guardarEstado();
}

//Verifica si hay linea Hor, Diag, Vert, o Bingo.
/*** @returns {boolean} True si hay Bingo*/
function verificarBingo() {
    // Verificar filas
    for (let fila = 0; fila < 5; fila++) {
        if (estadoMarcado[fila].every(marcado => marcado)) {
            return true;
        }
    }
    // Verificar columnas
    for (let col = 0; col < 5; col++) {
        if (estadoMarcado.every(fila => fila[col])) {
            return true;
        }
    }
    // Verificar diagonal principal (izquierda a derecha)
    if (estadoMarcado.every((fila, index) => fila[index])) {
        return true;
    }
    // Verificar diagonal secundaria (derecha a izquierda)
    if (estadoMarcado.every((fila, index) => fila[4 - index])) {
        return true;
    }
    return false;
}

//Maneja la verificación de Bingo
function manejarVerificarBingo() {
    if (verificarBingo()) {
        alert('¡FELICITACIONES! ¡Tienes BINGO! 🎉');
    } else {
        alert('Aún no tienes Bingo. ¡Sigue intentando! 🎯');
    }
}

//Inicializa un nuevo cartón
function nuevoCarton() {
    cartonActual = generarCarton();
    estadoMarcado = Array(5).fill().map(() => Array(5).fill(false));
    // Marcar GRATIS automáticamente
    estadoMarcado[2][2] = true;
    renderizarCarton();
    guardarEstado();
}

// Guarda el estado actual en localStorage
function guardarEstado() {
    const estado = {
        carton: cartonActual,
        marcado: estadoMarcado
    };
    localStorage.setItem('bingoEstado', JSON.stringify(estado));
}

 //Carga el estado desde localStorage
/*** @returns {boolean} True si se cargó un estado previo*/

function cargarEstado() {
    const estadoGuardado = localStorage.getItem('bingoEstado');
    if (estadoGuardado) {
        const estado = JSON.parse(estadoGuardado);
        cartonActual = estado.carton;
        estadoMarcado = estado.marcado;
        return true;
    }
    return false;
}

// Inicializa la app al cargar la página
function inicializar() {
    // Intentar cargar estado previo
    if (!cargarEstado()) {
        // Si no hay estado previo, crear nuevo cartón
        nuevoCarton();
    } else {
        // Renderizar cartón guardado
        renderizarCarton();
    }
    
    // Configurar eventos de botones
    document.querySelector('#nuevo-carton').addEventListener('click', nuevoCarton);
    document.querySelector('#verificar-bingo').addEventListener('click', manejarVerificarBingo);
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', inicializar);