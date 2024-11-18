const fileInput = document.getElementById('file-input');
const loadBtn = document.getElementById('load-btn');
const roulettePanel = document.getElementById('roulette-panel');
const alphabetPanel = document.getElementById('alphabet-panel');
const toggleUploadSymbol = document.getElementById('toggle-upload');
const uploadButtons = document.getElementById('upload-buttons');
const pierdeTurnoButton = document.getElementById('pierde-turno-btn');
const quiebraButton = document.getElementById('quiebra-btn');
const revelarPanelButton = document.getElementById('revelar-panel-btn');
const resultado = document.getElementById('resultado-ruleta');
const todasLasVocalesButton = document.getElementById('todas-vocales-btn');
const playerSelect = document.getElementById('player-select');
const nombreJugador1Input = document.getElementById('nombre-jugador1');
const nombreJugador2Input = document.getElementById('nombre-jugador2');
const nombreJugador3Input = document.getElementById('nombre-jugador3');
const valorVocales =50;

let nombreJugador1="Jugador 1";
let nombreJugador2="Jugador 2";
let nombreJugador3="Jugador 3";

let SeLoDoyActivo=false;
let MeLoQuedoActivo = false;

let letters = [];
let title='';
let selectedLetters = new Set(); // Letras seleccionadas por los jugadores
let revealedLetters = new Set(); // Letras reveladas en el panel
let scores = [0, 0, 0]; // Puntuaciones de los 3 jugadores
let currentPlayer = 0; // Índice del jugador actual (0, 1 o 2)
const vocales = new Set(['A','Á', 'E','É', 'I','Í', 'O','Ó', 'U','Ú','Ü']);
CargaDefault();
function CargaDefault(){
    title="Selecciona un panel para jugar";
    letters=['','','','','','','','','','','','',
             '','','','','','','','','','','','',
             '','','','','','','','','','','','',
             '','','','','','','','','','','',''
    ];
    updatePanel();
    //updateAlphabetPanel();

}

loadBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        reincia();
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            lettersArray = content.split('\n').map(line => line.split(',').map(letter => letter.trim().replace(/'/g, '')));
            const [titulo, ...letras] = lettersArray;
            letters=letras;
            title=titulo[0];
            updatePanel();
            updateAlphabetPanel();
        };
        reader.readAsText(file);

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
          cargaNombres();
          highlightCurrentPlayer();
    } else {
        alert('Por favor selecciona un archivo.');
    }
});

function reincia(){
    selectedLetters = new Set(); // Letras seleccionadas por los jugadores
    revealedLetters = new Set(); // Letras reveladas en el panel
    revealedLetters.add('?');
    revealedLetters.add('¿');
    revealedLetters.add('.');
    revealedLetters.add('-');
    scores = [0, 0, 0]; // Puntuaciones de los 3 jugadores
    currentPlayer = 0; // Índice del jugador actual (0, 1 o 2)
    updateScores();
    highlightCurrentPlayer();
}
function cargaNombres() {
    var nombreJugador1 = nombreJugador1Input.value !== "" ? nombreJugador1Input.value : "Jugador 1";
    var nombreJugador2 = nombreJugador2Input.value !== "" ? nombreJugador2Input.value : "Jugador 2";
    var nombreJugador3 = nombreJugador3Input.value !== "" ? nombreJugador3Input.value : "Jugador 3";

    document.getElementById("player-1").innerHTML = nombreJugador1 + "<br><hr> <span id='score-0'>0</span>";
    document.getElementById("player-2").innerHTML = nombreJugador2 + "<br><hr> <span id='score-1'>0</span>";
    document.getElementById("player-3").innerHTML = nombreJugador3 + "<br><hr> <span id='score-2'>0</span>";
    toggleUploadSymbol.click();
}

function updatePanel() {
    roulettePanel.innerHTML = ''; // Limpiar el panel
    const flatLetters = letters.flat(); // Aplanar el array de letras
    const rows = Math.ceil(flatLetters.length / 12); // Calcular el número de filas

    // Crear un contenedor para las letras
    const lettersGrid = document.createElement('div');
    lettersGrid.classList.add('letters-grid'); // Añadir clase para el estilo de cuadrícula

    for (let i = 0; i < rows; i++) {
        const row = flatLetters.slice(i * 12, (i + 1) * 12); // Obtener las letras de la fila
        row.forEach(letter => {
            const letterDiv = document.createElement('div');
            letterDiv.textContent = revealedLetters.has(letter) ? letter : '';
            letterDiv.classList.add('letter');
            if (revealedLetters.has(letter)) {
                letterDiv.classList.add('azul'); // Letras reveladas
            } else {
                if (letter) {
                    letterDiv.classList.add('letra');
                }
                letterDiv.classList.add('bloqueada'); // Letras bloqueadas
            }
            lettersGrid.appendChild(letterDiv);
        });
    }

    // Añadir el título
    const tituloDiv = document.createElement('div');
    tituloDiv.classList.add('titulo');
    tituloDiv.textContent = title;

    // Añadir el contenedor de letras y el título al panel
    roulettePanel.appendChild(lettersGrid);
    roulettePanel.appendChild(tituloDiv);
}

function updateAlphabetPanel() {
    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    alphabetPanel.innerHTML = ''; // Limpiar el panel

    // Crear un contenedor para las letras del alfabeto
    const alphabetGrid = document.createElement('div');
    alphabetGrid.classList.add('alphabet-grid'); // Añadir clase para el estilo de cuadrícula

    const rows = Math.ceil(alphabet.length / 3); // Calcular el número de filas
    for (let i = 0; i < rows; i++) {
        const row = alphabet.slice(i * 3, (i + 1) * 3); // Obtener las letras de la fila
        row.split('').forEach(letter => { // Convertir la cadena en un array
            const letterDiv = document.createElement('div');
            letterDiv.textContent = letter;
            //letterDiv.classList.add('letter');
            letterDiv.classList.add('letra-alphabet');
            letterDiv.addEventListener('click', () => selectLetterFromAlphabet(letter, letterDiv));
            alphabetGrid.appendChild(letterDiv);
        });
    }

    // Añadir el contenedor de letras al panel
    alphabetPanel.appendChild(alphabetGrid);
}

function selectLetterFromAlphabet(letter, letterDiv) {
    // Obtener el valor del input y convertirlo a número
    const inputValue = parseFloat(resultado.value);
    if(!vocales.has(letter)){
    // Verificar si el valor del input es un número
        if (isNaN(inputValue)) {
            // Resaltar el input si no es un número
            resultado.classList.add('error'); // Asegúrate de tener una clase CSS para resaltar
            resultado.classList.add('vibrar');
            alert("Por favor, ingresa un número válido.");
            return; // Salir de la función si el valor no es válido
        } else {
            // Eliminar la clase de error si el valor es válido
            resultado.classList.remove('error');
            resultado.classList.remove('vibrar');
        }
    }else if(scores[currentPlayer]<50){
        alert("Jugador actual con menos de 50");
        return;
    }
    if (selectedLetters.has(letter)) {
        selectedLetters.delete(letter);
        letterDiv.classList.remove('pulsada'); // Eliminar la clase pulsada si la letra es deseleccionada
        cambiaSiguienteJugador();
    } else {
        selectedLetters.add(letter);
        letterDiv.classList.add('pulsada'); // Añadir la clase pulsada si la letra es seleccionada
        revealedLetters.add(letter); // Revelar la letra en el panel
        
        // Contar las repeticiones de la letra en el panel
        const letterCount = countLetter(letter, letters);
        if (letterCount === 0) {
            cambiaSiguienteJugador();
            
        } else {
            if(vocales.has(letter)){
                scores[currentPlayer] -= valorVocales;
                switch(letter){
                    case 'A':
                        revealedLetters.add('Á');
                        break;
                    case 'E':
                        revealedLetters.add('É');
                        break;
                    case 'I':
                        revealedLetters.add('Í');
                        break;
                    case 'O':
                        revealedLetters.add('Ó');
                        break;
                    case 'U':
                        revealedLetters.add('Ú');
                        revealedLetters.add('Ü');
                        break;
                }
            }else{
            // Calcular la puntuación multiplicando el valor del input por letterCount
                scores[currentPlayer] += inputValue * letterCount; 
            }
            
        }
        LimpiarResultado();
    }
    updatePanel();
    highlightCurrentPlayer(); // Resaltar al jugador actual
    updateScores();
}

function countLetter(letter, letters) {
    let count = 0;
    for (let row of letters) {
        for (let char of row) {
            if (char === letter) {
                count++;
            }
        }
    }
    return count;
}

function highlightCurrentPlayer() {
    const playerElements = document.querySelectorAll('.player-score');
    playerElements.forEach((el, index) => {
        el.classList.remove('active'); // Eliminar clase activa de todos
        if (index === currentPlayer) {
            el.classList.add('active'); // Añadir clase activa al jugador actual
        }
    });
}

function updateScores() {
    scores.forEach((score, index) => {
        document.getElementById(`score-${index}`).textContent = score; // Actualizar el puntaje en el HTML
    });
}

function cambiaSiguienteJugador(){
    currentPlayer = (currentPlayer + 1) % 3;
    highlightCurrentPlayer();
}

toggleUploadSymbol.addEventListener('click', () => {
    if (uploadButtons.style.display === 'none') {
        uploadButtons.style.display = 'block'; // Mostrar los botones
        toggleUploadSymbol.textContent = '↑'; // Cambiar a símbolo de menos
    } else {
        uploadButtons.style.display = 'none'; // Ocultar los botones
        toggleUploadSymbol.textContent = '↓'; // Cambiar a símbolo de más
    }
});

pierdeTurnoButton.addEventListener('click', () => {
    cambiaSiguienteJugador();
});
quiebraButton.addEventListener('click', () => {
    Quiebra();
    cambiaSiguienteJugador();
});

revelarPanelButton.addEventListener('click', () => {
    RevelarPanel();
});

function Quiebra(){
    scores[currentPlayer]=0;
    updateScores();
    
}
function LimpiarResultado(){

    resultado.value = '';    
}

function RevelarPanel(){
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÜ'; // Alfabeto en mayúsculas

    // Agregar cada letra al Set
    for (let letter of alphabet) {
        revealedLetters.add(letter);
        selectedLetters.add(letter);
    }
    updatePanel();
}

todasLasVocalesButton.addEventListener('click',()=>{

    // Iterar sobre cada vocal
    for (let vocal of vocales) {
        // Si la vocal no está en el conjunto de letras reveladas, agregarla al conjunto de vocales no pulsadas
        if (!revealedLetters.has(vocal)) {
            revealedLetters.add(vocal);
        }
    }

    updatePanel();

});

function MeLoQuedo(targetPlayer){

    scores[currentPlayer]+=scores[targetPlayer];
    scores[targetPlayer]=0;
    updateScores();
}

function SeLoDoy(targetPlayer){

    scores[targetPlayer]+=scores[currentPlayer];
    scores[currentPlayer]=0;
    updateScores();
}


document.getElementById('me-lo-quedo-btn').addEventListener('click', () => {
    console.log('Me lo quedo clickeado');
    showPlayerSelect();
    SeLoDoyActivo=false;
    MeLoQuedoActivo=true;
});

document.getElementById('se-lo-doy-btn').addEventListener('click', () => {
    console.log('Se lo doy clickeado');
    showPlayerSelect();
    SeLoDoyActivo=true;
    MeLoQuedoActivo=false;
});

function showPlayerSelect() {
    // Limpiar el select
    playerSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value='';
    defaultOption.text='';
    playerSelect.appendChild(defaultOption);
    // Crear opciones para el select
    for (let i = 0; i <= 2; i++) {
        if (i !== currentPlayer) { // Excluir el jugador actual
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Jugador ${i+1}`;
            playerSelect.appendChild(option);
        }
    }

    // Mostrar el select
    playerSelect.style.display = 'block';
}


// Opcional: Puedes agregar un evento para manejar la selección
playerSelect.addEventListener('change', (event) => {
    const selectedPlayer = parseInt(event.target.value, 10);
    //console.log(`Seleccionaste al Jugador ${selectedPlayer}`);
    if(SeLoDoyActivo){

        SeLoDoy(selectedPlayer);
    }else if(MeLoQuedoActivo){
        MeLoQuedo(selectedPlayer);

    }
    SeLoDoyActivo=false;
    MeLoQuedoActivo=false;
    playerSelect.style.display = 'none';
});

function sumar(){
    const inputValue = parseFloat(resultado.value);
    scores[currentPlayer]+=inputValue;
    LimpiarResultado();
    updateScores();
}

function restar(){
    const inputValue = parseFloat(resultado.value);
    scores[currentPlayer]-=inputValue;
    LimpiarResultado();
    updateScores();
}

function dividir(){
    let res = parseFloat(Math.round(scores[currentPlayer]/2,0));
    scores[currentPlayer]=res;
    LimpiarResultado();
    updateScores();
}

function multiplicar(){
    let res = parseFloat(Math.round(scores[currentPlayer]*2,0));
    scores[currentPlayer]=res;
    LimpiarResultado();
    updateScores();
}