var imageDetails = [
    { path:"slideshow/sun001.jpg", caption:"Sun spot activity in my back garden" },
    { path:"slideshow/sun002.jpg", caption:"A closer look at the sun spots" },
    { path:"slideshow/moon001.jpg", caption:"This is the moon as seen through my \xA35 webcam" },
    { path:"slideshow/moon002.jpg", caption:"This is also the moon" },
    { path:"slideshow/mars.png", caption:"One night trying to get a good picture of Mars" },
    { path:"slideshow/jupiter.png", caption:"Various images of Jupiter I've taken" },
    { path:"slideshow/gba02.jpg", caption:"My GameBoy Advance web server from 2002!" },
    { path:"slideshow/gba01.jpg", caption:"A closer look at the DIY 3v-5v serial cable" },
    { path:"slideshow/firstaccess02.jpg", caption:"The first time someone in the real world connected to my GBA" },
    { path:"slideshow/firstaccess03.jpg", caption:"And this is what they saw" },
    { path:"slideshow/Docked.jpg", caption:"Cobra docked at an orbital outpost" },
    { path:"slideshow/EarlyMorning.jpg", caption:"Early morning above Europe" },
    { path:"slideshow/EuropaVista.jpg", caption:"Looking out over the canyons of Europa" },
    { path:"slideshow/NightTimeLanding.jpg", caption:"A night time excursion" },
    { path:"slideshow/Srv.jpg", caption:"Joy riding in my SRV" },
    { path:"slideshow/SrvAndShip.jpg", caption:"Exploring a remote planetary landscape" }
];

var currentImage = 0;

function setImage(index) {
    viewerImg.src = imageDetails[index].path;
    var caption = document.querySelector(".viewer .caption");
    caption.innerText = imageDetails[index].caption;
}

function advanceSlide(offset) {
    var nextImage = currentImage + offset;
    if (nextImage < 0) {
        nextImage = imageDetails.length - 1;
    }
    else if (nextImage >= imageDetails.length) {
        nextImage = 0;
    }

    currentImage = nextImage;
    setImage(currentImage);
}

function main() {
    setImage(currentImage);
}

function previousButtonClicked() {
    advanceSlide(-1);
}

function nextButtonClicked() {
    advanceSlide(1);
}
