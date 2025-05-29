# Weather Radar Event Viewer

This project provides a web-based tool for visualizing historical weather radar data, particularly focused on displaying important meteorological events like hail. It allows users to upload sequences of radar images (PNG files), select a Spanish province, and then view these images as an animated overlay on a Leaflet map. The tool utilizes a custom Leaflet plugin for rotating and skewing image overlays to accurately fit radar projections on the map.

## Features

* **Interactive Map:** Built on Leaflet.js with OpenStreetMap tiles.
* **Radar Image Overlay:** Displays weather radar images as an overlay on the map.
* **Rotated Image Overlay:** Employs a custom `Leaflet.ImageOverlay.Rotated` plugin to correctly position and orient radar images using three control points (top-left, top-right, bottom-left).
* **Dynamic Image Loading:** Users can upload multiple PNG radar images from their local machine.
* **Province Selection:** Supports selecting a Spanish province, which automatically centers the map and defines the radar bounds for that region.
* **Animation Playback:** Allows playing through the loaded radar images as an animation with adjustable speed.
* **Time Slider:** A slider to manually navigate through the loaded radar frames and view the corresponding timestamp.
* **Event Detection Example:** Includes an example text file indicating a detected large hail event in Valdelamusa (Huelva).

## Technologies Used

* **Frontend:**
    * HTML5
    * CSS3
    * JavaScript
    * [Leaflet.js](https://leafletjs.com/) for interactive maps
    * [Leaflet.ImageOverlay.Rotated.js](web/js/Leaflet.ImageOverlay.Rotated.js) (Custom plugin for rotated image overlays)
    * [html2canvas](https://html2canvas.hertzen.com/) (Used for potential future features, currently included but not actively used in the provided `radar.js`)
    * Font Awesome for icons

## Getting Started

To run this project locally, simply open the `viewradar.html` file in a web browser.

### Prerequisites

No specific server setup is required to run the basic visualization features, as it primarily relies on client-side JavaScript and local file loading.

### Usage

1.  **Open `viewradar.html`:** Navigate to the `web` directory and open `viewradar.html` in your web browser.
2.  **Select Province:** Choose the desired Spanish province from the dropdown menu in the navbar.
3.  **Load Images:** Click the "Cargar Imágenes" (Load Images) button.
4.  **Select Radar PNGs:** A file dialog will appear. Select multiple radar PNG image files from your local machine. These images should be sequential radar frames for the chosen province.
5.  **View Radar:** Once loaded, the first radar image will appear on the map, and the map will center on the selected province.
6.  **Play Animation:** Use the "▶" (play) button at the bottom of the screen to start the animation of the radar images. The button will change to "◼" (stop) to pause the animation.
7.  **Navigate Frames:** Use the time slider to manually browse through individual radar frames. The `time-label` will update to show the timestamp of the current frame.
