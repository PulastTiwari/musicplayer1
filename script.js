document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const progress = document.getElementById('progress');
    const albumArt = document.getElementById('albumArt');
    const timeline = document.getElementById('timeline');
    const audio = new Audio();

    let files = [];
    let currentIndex = 0;
    let isDragging = false;

    fileInput.addEventListener('change', (event) => {
        files = Array.from(event.target.files);
        currentIndex = 0;
        loadCurrentFile();
        playBtn.disabled = false;
    });

    uploadBtn.addEventListener('click', () => {
        if (files.length > 0) {
            console.log(`Files uploaded: ${files.map(file => file.name).join(', ')}`);
        }
    });

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + files.length) % files.length;
        loadCurrentFile();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % files.length;
        loadCurrentFile();
    });

    shuffleBtn.addEventListener('click', () => {
        if (files.length > 1) {
            shuffleFiles();
            currentIndex = 0;
            loadCurrentFile();
        }
    });

    timeline.addEventListener('mousedown', handleTimelineMouseDown);
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    audio.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const progressPercentage = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${progressPercentage}%`;
        }
    });

    function handleTimelineMouseDown(event) {
        isDragging = true;
        updateProgress(event);
    }

    function handleDocumentMouseMove(event) {
        if (isDragging) {
            updateProgress(event);
        }
    }

    function handleDocumentMouseUp() {
        if (isDragging) {
            isDragging = false;
            updateAudioCurrentTime();
        }
    }

    function updateProgress(event) {
        const timelineRect = timeline.getBoundingClientRect();
        const progressPercentage = ((event.clientX - timelineRect.left) / timelineRect.width) * 100;
        progress.style.width = `${progressPercentage}%`;
    }

    function updateAudioCurrentTime() {
        const timelineRect = timeline.getBoundingClientRect();
        const clickPosition = (event.clientX - timelineRect.left) / timelineRect.width;
        audio.currentTime = clickPosition * audio.duration;
    }

    function loadCurrentFile() {
        const currentFile = files[currentIndex];
        audio.src = URL.createObjectURL(currentFile);
        displayAlbumArt(currentFile);
    }

    function displayAlbumArt(file) {
        jsmediatags.read(file, {
            onSuccess: (tag) => {
                const image = tag.tags.picture;
                if (image) {
                    const base64String = arrayBufferToBase64(image.data);
                    albumArt.innerHTML = `<img src="data:${image.format};base64,${base64String}" alt="Album Art" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
            },
            onError: (error) => {
                console.error(error.type, error.info);
            }
        });
    }

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function shuffleFiles() {
        for (let i = files.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [files[i], files[j]] = [files[j], files[i]];
        }
    }
});
