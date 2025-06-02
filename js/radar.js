// Inicializar el mapa
var map = L.map("map", {
  zoomControl: false, // Deshabilitar los controles de zoom
}).setView([40.4168, -3.7038], 6); // Centro en España

// Agregar la capa de OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Coordenadas centrales de los radares
const radarCenters = {
  am: [36.81784455215568, -2.084486050525251], // Almería
  co: [43.15060952793095, -8.529376760456016], // A Coruña
  sa: [43.4431921376602, -6.298810903805607], // Asturias
  ba: [41.39171405027827, 1.8858830601264507], // Barcelona
  cc: [39.4132783428345, -6.286462627950356], // Cáceres
  pm: [39.36355588300623, 2.782541130615643], // Illes Balears
  ca: [28.018816, -15.614518], // Las Palmas
  ma: [40.15946911784492, -3.7149056668953873], // Madrid
  ml: [36.596995468991324, -4.655915586328689], // Málaga
  mu: [38.24895441496203, -1.1900495050554238], // Murcia
  vd: [41.97841831108326, -4.60490085542758], // Palencia
  se: [37.67121804435065, -6.335404263420381], // Sevilla
  va: [39.176294, -0.251057], // Valencia
  ss: [43.38672364122942, -2.843160307254911], // Vizcaya
  za: [41.71665120356057, -0.5468285958660539], // Zaragoza
};

// Coordenadas de los límites de los radares
const radarBounds = {
  "am": [
    [34.560859, -4.779053], // Suroeste
    [39.023451, 0.571289], // Noreste
    [38.903858, -4.910889] // Noroeste
  ],
  "za": [
    [39.546412, -3.493652], // Suroeste
    [43.842451, 2.307129], // Noreste
    [43.860277, -3.507385] // Noroeste
  ],
  "co": [
    [40.15060952793095, -11.529376760456016], // Suroeste
    [46.15060952793095, -5.529376760456016], // Noreste
    [46.15060952793095, -11.529376760456016] // Noroeste
  ],
  "sa": [
    [41.133159, -9.014282], // Suroeste
    [45.648608, -3.598022], // Noreste
    [45.394593, -9.536133] // Noroeste
  ],
  "ba": [
    [39.215231, -1.054688], // Suroeste
    [43.508721, 4.812012], // Noreste
    [43.572432, -0.933838] // Noroeste
  ],
  "ss": [
    [41.155910, -5.707397], // Suroeste
    [45.552525, 0.016479], // Noreste
    [45.417732, -5.855713] // Noroeste
  ],
  "pm": [
    [37.204082, -0.038452], // Suroeste
    [41.450961, 5.657959], // Noreste
    [41.568197, 0.005493] // Noroeste
  ],
  "se": [
    [35.344255, -8.822021], // Suroeste
    [39.943436, -3.834229], // Noreste
    [39.631077, -9.195557] // Noroeste
  ],
  "mu": [
    [36.057981, -3.889160], // Suroeste
    [40.388397, 1.527100], // Noreste
    [40.472024, -3.977051] // Noroeste
  ],
  "vd": [
    [39.715638, -7.426758], // Suroeste
    [44.237328, -1.845703], // Noreste
    [44.016521, -7.701416] // Noroeste
  ],
  "ca": [
    [25.506090, -17.563476], // Suroeste
    [30.481817, -13.635864], // Noreste
    [29.761198, -18.400268] // Noroeste
  ],
  "ma": [
    [37.905199, -6.591797], // Suroeste
    [42.350425, -0.944824], // Noreste
    [42.183759, -6.723633] // Noroeste
  ],
  "ml": [
    [34.325292, -7.272949], // Suroeste
    [38.839708, -2.098389], // Noreste
    [38.676933, -7.525635] // Noroeste
  ],
  "va": [
    [36.960427, -3.047058], // Suroeste
    [41.304222, 2.512574], // Noreste
    [41.294317, -3.101440] // Noroeste
  ],
  "cc": [
    [37.072710, -8.876953], // Suroeste
    [41.689322, -3.724365], // Noreste
    [41.409776, -9.283447] // Noroeste
  ]
};

// Variable de estado para rastrear si la ubicación se ha encontrado
let locationFound = false;

// Variables para almacenar el marcador y el círculo actuales
let currentMarker = null;
let currentCircle = null;

var radarLayer;
// Función para mostrar la imagen del radar en el mapa
async function showRadarImage(svgUrl, province) {
  if (!svgUrl) {
    console.error("Error: svgUrl is undefined");
    return;
  }

  var bounds = radarBounds[province];
  var newRadarLayer = L.imageOverlay.rotated(svgUrl, bounds[2], bounds[1], bounds[0], {
    opacity: 0.5,
    interactive: false,
    attribution: "&copy; <a href='http://www.aemet.es'>AEMET</"
  });

  // Añadir un evento de carga completa
  newRadarLayer.on("load", function () {
    // Eliminar la capa anterior antes de añadir la nueva
    if (radarLayer) {
      map.removeLayer(radarLayer);
    }
    radarLayer = newRadarLayer; // Actualizar radarLayer con la nueva capa cargada
  });

  // Manejar error en la carga de la imagen
  newRadarLayer.on("error", function () {
    console.error("Error loading image:", svgUrl);
  });

  newRadarLayer.addTo(map);
}

// Mostrar radar en el mapa
var radarSvgs = [];
var province;
var animationDelay = 150; // Velocidad de animación por defecto x1
const checkedImages = new Set();

async function loadRadarImages(province) {
  radarSvgs = await getRadarUrls(province);
  radarSvgs.forEach((svgUrl) => {
    console.log(svgUrl);
  });
  // Mostrar la imagen más reciente
  if (radarSvgs.length > 0) {
    showRadarImage(radarSvgs[0], province);
    document.getElementById("time-slider").value = 10;
  }
}


let isPlaying = false;

function playRadarAnimation(n = 11) {
  let index = 1; // Empezar desde la hora más antigua

  function showNextFrame() {
    if (!isPlaying) return; // Detener la animación si isPlaying es false

    // Calcular la hora basada en el índice del frame
    var now = new Date();
    var roundedMinutes = Math.floor(now.getMinutes() / 10) * 10;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);

    if (radarSvgs[n - index]) {
      // Extraer la información de la URL de la imagen más reciente
      const regex = /\/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})_r8/;
      const match = radarSvgs[n - index].match(regex);
      if (match) {
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const hours = match[4];
        const minutes = match[5];
        const formattedTime = `${hours}:${minutes} UTC`;
        document.getElementById("time-label").value = formattedTime;
      } else {
        // Fallback if regex doesn't match
        document.getElementById("time-label").value = "Error";
      }

      showRadarImage(radarSvgs[n - index], province);
      document.getElementById("time-slider").value = index - 1;
    } else {
      // Si no hay una imagen válida, mostrar un mensaje de error
      console.error("Imagen no válida en radarSvgs:", radarSvgs[n - index]);
      document.getElementById("time-label").value = "Error";
    }

    index++;

    if (index > n) {
      // Pausar en el último fotograma por 1500 ms
      setTimeout(() => {
        if (!isPlaying) return; // Detener la animación si isPlaying es false
        index = 1;
        showNextFrame(); // Llama de nuevo a showNextFrame para reiniciar la animación
      }, 1500);
    } else {
      setTimeout(showNextFrame, animationDelay);
    }
  }

  showNextFrame();
}


document.getElementById("time-slider").oninput = function () {
  const sliderValue = parseInt(this.value);

  if (radarFiles[sliderValue]) {
    const regex = /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})_r8/;
    const match = radarFiles[sliderValue].name.match(regex);

    if (match) {
      const hours = match[4];
      const minutes = match[5];
      const formattedTime = `${hours}:${minutes} UTC`;
      document.getElementById("time-label").value = formattedTime;
    } else {
      document.getElementById("time-label").value = "Hora desconocida";
    }
    showRadarImage(radarFiles[sliderValue].url, province); // Mostrar la imagen correspondiente
  } else {
    document.getElementById("time-label").value = "Error";
  }
};



function playRadarAnimation() {
  let index = 1; // Empezar desde la primera imagen
  isPlaying = true;

  // Ajustar la velocidad de animación según la cantidad de imágenes
  const numImages = radarFiles.length;
  if (numImages <= 20) {
    animationDelay = 300;
  } else if (numImages <= 80) {
    animationDelay = 120;
  } else if (numImages > 80) {
    animationDelay = 50;
  } else {
    animationDelay = 150; // Valor por defecto si no cumple ninguna condición específica
  }

  function showNextFrame() {
    if (!isPlaying) return; // Detener la animación si isPlaying es false

    if (radarFiles[index - 1]) {
      const regex = /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})_r8/;
      const match = radarFiles[index - 1].name.match(regex);

      if (match) {
        const hours = match[4];
        const minutes = match[5];
        const formattedTime = `${hours}:${minutes} UTC`;
        document.getElementById("time-label").value = formattedTime;
      } else {
        document.getElementById("time-label").value = "Hora desconocida";
      }

      showRadarImage(radarFiles[index - 1].url, province); // Mostrar la imagen actual
      document.getElementById("time-slider").value = index - 1; // Actualizar el deslizador
    }

    index++;

    if (index > radarFiles.length) {
      setTimeout(() => {
        if (!isPlaying) return;
        index = 1; // Reiniciar la animación al primer frame
        showNextFrame();
      }, 1500);
    } else {
      setTimeout(showNextFrame, animationDelay);
    }
  }

  showNextFrame();
}

document.getElementById("load-images").onclick = function () {
  const fileInput = document.getElementById("file-upload");
  const provinceSelect = document.getElementById("province-select");
  province = provinceSelect.value; // Actualiza la provincia seleccionada

  if (fileInput.files.length === 0) {
    alert("Por favor, selecciona al menos una imagen PNG.");
    return;
  }

  radarFiles = []; // Array temporal para almacenar los archivos y sus nombres

  // Procesar cada archivo cargado
  Array.from(fileInput.files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      radarFiles.push({ name: file.name, url: e.target.result });

      if (radarFiles.length === fileInput.files.length) {
        // Ordenar radarFiles cronológicamente basándonos en el nombre del archivo
        radarFiles.sort((a, b) => a.name.localeCompare(b.name));

        // Actualizar radarSvgs solo con las URLs en el orden correcto
        radarSvgs = radarFiles.map(file => file.url);

        // Muestra la primera imagen y ajusta los controles
        showRadarImage(radarSvgs[0], province);
        document.getElementById("play-animation").style.display = "inline";
        document.getElementById("time-slider-container").style.display = "flex";

        // Configurar el deslizador según el número de imágenes cargadas
        const slider = document.getElementById("time-slider");
        slider.max = radarFiles.length - 1;
        slider.value = 0;

        console.log("Imágenes cargadas y ordenadas:", radarFiles);

        // Centrar y hacer zoom en el radar seleccionado
        if (radarCenters[province]) {
          const radarCenter = radarCenters[province];
          map.setView(radarCenter, 8); // Ajusta el nivel de zoom según sea necesario
        }
      }
    };
    reader.readAsDataURL(file); // Convierte el archivo en data URL
  });

  document.getElementById("play-animation").onclick = function () {
    if (isPlaying) {
      isPlaying = false;
      this.innerText = "▶"; // Cambiar a icono de play
    } else {
      isPlaying = true;
      playRadarAnimation(); // Iniciar la animación
      this.innerText = "◼"; // Cambiar a icono de stop
    }
  };
};
