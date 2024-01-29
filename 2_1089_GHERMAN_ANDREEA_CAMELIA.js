
document.addEventListener('DOMContentLoaded', function () {
    const mainVideo = document.querySelector('.main-video video');
    const videoList = document.querySelector('.video-list');
    const fileInput = document.getElementById('fileInput');
    let videos = document.querySelectorAll('.video-list .vid video');
    let listVideo=document.querySelectorAll('.video-list .vid');
    let title=document.querySelector('.main-video .title');


    // Adaugare eveniment change pentru inputul de tip file
    fileInput.addEventListener('change', handleFileSelect);

    mainVideo.addEventListener('ended', playNextVideo);
    mainVideo.addEventListener('error', playNextVideo);



    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        for (const file of files) {
            if (file.type.startsWith('video/')) {
                const newVideo = document.createElement('div');
                newVideo.className = 'vid';
                newVideo.innerHTML = `
                    <video src="${URL.createObjectURL(file)}" muted></video>
                    <h3 class="title">${file.name}</h3>
                    <button class="delete-button">Delete</button>
                    <button class="moveUp">MoveUp</button>
                    <button class="moveDown">MoveDown</button>  
                `;
                newVideo.addEventListener('click', function () {
                    playVideo(this.querySelector('video'));
                });
    
                newVideo.querySelector('.delete-button').addEventListener('click', function () {
                    deleteVideo(newVideo);
                });
    
                newVideo.querySelector('.moveUp').addEventListener('click', function () {
                    moveVideoUp(newVideo);
                });
    
                newVideo.querySelector('.moveDown').addEventListener('click', function () {
                    moveVideoDown(newVideo);
                });
    
                videoList.appendChild(newVideo);
            }
        }
        videos = document.querySelectorAll('.video-list .vid video');
        listVideo=document.querySelectorAll('.video-list .vid');

        if (listVideo.length > 0 && currentSelectedVideo === -1) {
            currentSelectedVideo = 0;
        }
    }

    let currentSelectedVideo = null;


    function playNextVideo() {
        mainVideo.pause();
    
        currentSelectedVideo++;
        if (currentSelectedVideo >= videos.length) {
            currentSelectedVideo = 0;
        }
        
        const newVideo = listVideo[currentSelectedVideo];
    
        mainVideo.src = newVideo.children[0].getAttribute('src');
        title.innerHTML = newVideo.children[1].innerHTML;
        
        mainVideo.load();
        mainVideo.play();
        
    }

    
    //Evenimentul click pentru toate videoclipurile
    listVideo.forEach((video, index) =>{
        video.onclick = () => {
            listVideo.forEach(vid => vid.classList.remove('active'));
            video.classList.add('active');

            if (video.classList.contains('active')) {
                currentSelectedVideo = index;
                let src = video.children[0].getAttribute('src');
                mainVideo.src = src;
                let text = video.children[1].innerHTML;
                title.innerHTML = text;
            }
        };
 });

    function playVideo(videoElement) {
        videos.forEach(v => v.pause());
        mainVideo.src = videoElement.src;
        mainVideo.load();

        if (hasUserInteracted()) {
            mainVideo.muted = false;
        }

        mainVideo.play();
    }

    function hasUserInteracted() {
        return mainVideo.muted;
    }

    
//--MOVE VIDEO--//

    const moveUpButtons = document.querySelectorAll('.moveUp');
    const moveDownButtons = document.querySelectorAll('.moveDown');

    moveUpButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            const vidElement = event.target.closest('.vid');
            if (vidElement) {
                moveVideoUp(vidElement);
            }
        });
    });

    moveDownButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            const vidElement = event.target.closest('.vid');
            if (vidElement) {
                moveVideoDown(vidElement);
            }
        });
    });

    function moveVideoUp(vidElement) {
        const prevSibling = vidElement.previousElementSibling;
        if (prevSibling) {
            videoList.insertBefore(vidElement, prevSibling);
            updateVideoListAndCurrentIndex();
        }
    }
    
    function moveVideoDown(vidElement) {
        const nextSibling = vidElement.nextElementSibling;
        if (nextSibling) {
            videoList.insertBefore(nextSibling, vidElement);
            updateVideoListAndCurrentIndex();
        }
    }

    function updateVideoListAndCurrentIndex() {
        listVideo = document.querySelectorAll('.video-list .vid');
        currentSelectedVideo = Array.from(listVideo).indexOf(document.querySelector('.active'));
    }

//--DELETE VIDEO--//

    const deleteButtons = document.querySelectorAll('.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            const vidElement = event.target.closest('.vid');
            if (vidElement) {
                deleteVideo(vidElement);
            }
        });
    });

    function deleteVideo(vidElement) {
        const isActive = vidElement.classList.contains('active');

    videoList.removeChild(vidElement);
    updateVideoListAndCurrentIndex();

    if (isActive) {
        if (videos.length > 0) {
            if (currentSelectedVideo >= videos.length) {
                currentSelectedVideo = videos.length - 1;
            }

            const newVideo = listVideo[currentSelectedVideo];
            mainVideo.src = newVideo.children[0].getAttribute('src');
            title.innerHTML = newVideo.children[1].innerHTML;
            mainVideo.load();
            mainVideo.play();
        } else {
            mainVideo.pause();
            mainVideo.src = '';
            title.innerHTML = '';
        }
    }
}

function updateVideoListAndCurrentIndex() {
    listVideo = document.querySelectorAll('.video-list .vid');
    videos = document.querySelectorAll('.video-list .vid video');

    if (listVideo.length > 0) {
        currentSelectedVideo = Array.from(listVideo).indexOf(document.querySelector('.active'));
    } else {
        currentSelectedVideo = -1;
    }
}



//---Desenarea de controale---//

    const canvas = document.getElementById('canvas');
    const prevButton = document.getElementById('prevButton');
    const playPauseButton = document.getElementById('playPauseButton');
    const nextBtnCanvas = document.getElementById('nextBtnCanvas');
    const progressBar=document.getElementById('progressBar');

    prevButton.addEventListener('click', playPreviousVideo);
    playPauseButton.addEventListener('click', togglePlayPause);
    nextBtnCanvas.addEventListener('click', playNextVideo);

    

    function playPreviousVideo(){
        mainVideo.pause();

        currentSelectedVideo = (currentSelectedVideo - 1 + listVideo.length) % listVideo.length;

        const newVideo = listVideo[currentSelectedVideo];
    
        mainVideo.src = newVideo.children[0].getAttribute('src');
        title.innerHTML = newVideo.children[1].innerHTML;
        mainVideo.load();
        mainVideo.play();
    
    }

    function togglePlayPause(){
        if(mainVideo.paused)
        {
            mainVideo.play();
            playPauseButton.textContent="Pause";
        }
        else{
            mainVideo.pause();
            playPauseButton.textContent="Play";
        }
    }
    
    playPauseButton.addEventListener('click', togglePlayPause);
    

    mainVideo.addEventListener('timeupdate', updateProgressBar);
    progressBar.addEventListener('click', seek);

    function updateProgressBar() {
        if (isFinite(mainVideo.duration)) {
            const value = (mainVideo.currentTime / mainVideo.duration) * 100;
            progressBar.value = value;
        }
    }
    

    function seek(e) {
    const percent = e.offsetX / this.offsetWidth;
    mainVideo.currentTime = percent * mainVideo.duration;
}


//---Volume----//
const volumeControl = document.getElementById('volumeControl');


const initialVolume = 0.1;
mainVideo.volume = initialVolume;
volumeControl.value = initialVolume;

volumeControl.addEventListener('input', updateVolume);

volumeControl.addEventListener('click', function(e) {
    const clickPosition = e.offsetX / this.offsetWidth; 
    const volumeLevel = clickPosition * 1; 
    mainVideo.volume = volumeLevel;
    this.value = volumeLevel;
});


function updateVolume() {
    mainVideo.volume = Math.min(1, Math.max(0, volumeControl.value));
}


//--ProgressBar--//

progressBar.addEventListener('mousemove', handleProgressHover);

function handleProgressHover(event) {
    const mouseX = event.clientX - progressBar.getBoundingClientRect().left; //metodă care returnează dimensiunea unui element și poziția sa relativă
    const progressBarWidth = progressBar.clientWidth;
    const progressPercentage = mouseX / progressBarWidth;

    const duration = mainVideo.duration;
    const previewTime = progressPercentage * duration;

    mainVideo.currentTime = previewTime;

    showPreviewTooltip(event, previewTime);
}

function showPreviewTooltip(event, previewTime) {
    const tooltip = document.getElementById('previewTooltip');
    tooltip.textContent = formatTime(previewTime);
    tooltip.style.left = event.clientX + 'px';
    tooltip.style.top = event.clientY + 'px';
    tooltip.style.display = 'block';

    setTimeout(() => {
        tooltip.style.display = 'none';
    }, 2000);
}


function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
    



//--Filtre--//
const videoPrincipal = document.querySelector('.video video');

const videoCanvas = document.getElementById('canvas');
const canvasContext = videoCanvas.getContext('2d');

const effectButtons = document.querySelectorAll('.filters-container .filter-buttons button');
let currentEffect = 'normal';

effectButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedEffect = button.dataset.effect;
        applyEffect(selectedEffect);
    });
});

            function applyEffect(effect) {
                currentEffect = effect;

                if (!videoPrincipal.paused && !videoPrincipal.ended) {
                drawCanvas();
    }

                switch (effect) {
                    case 'normal':
                        canvasContext.filter = 'none';
                        break;
                    case 'greyscale':
                        canvasContext.filter = 'grayscale(100%)';
                        break;
                    case 'sepia':
                        canvasContext.filter = 'sepia(100%)';
                        break;
                    case 'invert':
                        canvasContext.filter = 'invert(100%)';
                        break;
                    default:
                        break;
                }

                drawCanvas();
            }

            function drawCanvas() {

                if (!videoPrincipal.paused && !videoPrincipal.ended) {
                    canvasContext.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
                    canvasContext.filter = currentEffect; 
                    canvasContext.drawImage(videoPrincipal, 0, 0, videoCanvas.width, videoCanvas.height);
                    requestAnimationFrame(drawCanvas); //bucla 
    }}


    videoPrincipal.addEventListener('play', drawCanvas);







            videoPrincipal.addEventListener('change', FileSelect);

            function FileSelect() {
                const files = videoPrincipal.files;
                handleFisiere(files);
            }

            function handleFisiere(files) {
                for (const file of files) {
                    if (file.type.startsWith('video/')) {
                        const newSource = document.createElement('source');
                        newSource.src = URL.createObjectURL(file);
                        newSource.type = 'video/mp4';
                        
                        videoPrincipal.innerHTML = ''; 
                        videoPrincipal.appendChild(newSource);
                        videoPrincipal.load();
                        videoPrincipal.play();

                        applyEffect('normal');
                    }
                }
            }

            
    
});