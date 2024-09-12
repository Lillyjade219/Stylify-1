document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const photo = document.getElementById("photo");
    const captureBtn = document.getElementById("captureBtn");
    const colorsDiv = document.getElementById("colors");

    // Access the user's webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(err => console.error("Error accessing webcam: ", err));

    // Capture a photo from the webcam
    captureBtn.addEventListener("click", () => {
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to an image
        const dataURL = canvas.toDataURL("image/png");
        photo.src = dataURL;

        // Call the function analyzeColors after defining it
        analyzeColors(photo);
    });

    // Analyze the colors using Color Thief
    function analyzeColors(imgElement) {
        const colorThief = new ColorThief();

        imgElement.onload = () => {
            const dominantColor = colorThief.getColor(imgElement);
            const palette = colorThief.getPalette(imgElement, 6);
            displayColors(palette);
            const season = determineSeason(dominantColor);
            displaySeason(season);
        };
    }

    // Display the dominant colors
    function displayColors(palette) {
        colorsDiv.innerHTML = '';
        palette.forEach(color => {
            colorsDiv.innerHTML += `<div class="color-block" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div>`;
        });
    }

    // Determine the user's season based on the dominant color
    function determineSeason(color) {
        const [r, g, b] = color;
        const hue = rgbToHue(r, g, b);

        if (r > 200 && g > 180 && b > 150) return 'Spring';  // Light, warm, clear colors
        if (r < 150 && g < 150 && b > 200) return 'Summer';  // Cool, soft, light colors
        if (r > 150 && g < 100 && b < 100) return 'Autumn';  // Deep, warm, muted colors
        if (r < 100 && g < 100 && b < 100) return 'Winter';  // Cool, deep, clear colors
        
        return 'Unknown';  // In case no match is found
    }

    // Convert RGB to Hue
    function rgbToHue(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h;
        if (max === min) {
            h = 0; // achromatic
        } else {
            const d = max - min;
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return Math.round(h * 360);
    }

    // Display the user's season
    function displaySeason(season) {
        const seasonDiv = document.createElement('div');
        seasonDiv.className = 'season-result';
        seasonDiv.textContent = `Your season is: ${season}`;
        colorsDiv.appendChild(seasonDiv);
    }
});
