document.addEventListener('DOMContentLoaded', () => {
    // Background animation logic
    anime({
        targets: '.shape',
        translateX: function () {
            return anime.random(-30, 30) + 'vw';
        },
        translateY: function () {
            return anime.random(-30, 30) + 'vh';
        },
        scale: function () {
            return anime.random(0.5, 1.5);
        },
        duration: 3000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
    });

    // DOM elements
    const startGameButton = document.getElementById('startGame');
    const mainContainer = document.querySelector('.container');
    const recordingView = document.getElementById('recordingView');
    const recordingControls = document.getElementById('recordingControls');
    const startRecordingButton = document.getElementById('startRecording');
    const stopRecordingButton = document.createElement('button');
    stopRecordingButton.textContent = 'Stop Recording';
    stopRecordingButton.classList.add('main-button', 'hidden');
    const recordingStatus = document.createElement('p');
    recordingStatus.style.color = 'red';
    recordingStatus.textContent = 'Recording...';
    recordingStatus.classList.add('hidden');
    recordingView.appendChild(recordingStatus);

    let mediaRecorder;
    let recordedChunks = [];
    let stream; // Keep a reference to the stream

    // Event listeners
    startGameButton.addEventListener('click', () => {
        mainContainer.classList.add('hidden');
        recordingView.classList.remove('hidden');
    });

    // startRecordingButton.addEventListener('click', async () => {
    //     startRecordingButton.classList.add('hidden');
    //     stopRecordingButton.classList.remove('hidden');
    //     recordingStatus.classList.remove('hidden');

    //     try {
    //         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //         recordedChunks = [];
    //         mediaRecorder = new MediaRecorder(stream);

    //         mediaRecorder.ondataavailable = (event) => {
    //             if (event.data.size > 0) {
    //                 recordedChunks.push(event.data);
    //             }
    //         };

    //         mediaRecorder.onstop = () => {
    //             recordingStatus.classList.add('hidden');
    //             if (stream) {
    //                 stream.getTracks().forEach(track => track.stop()); // Stop the microphone
    //             }
    //             stopRecordingButton.classList.add('hidden');
    //             submitRecordingButton.classList.remove('hidden');
    //         };

    //         mediaRecorder.start();
    //     } catch (err) {
    //         console.error('Error accessing microphone:', err);
    //         alert('Could not access your microphone. Please check your permissions.');
    //     }
    // });

    stopRecordingButton.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            recordingControls.classList.remove('hidden');
        }
    });

    startRecordingButton.addEventListener('click', () => {
        startRecordingButton.classList.add('hidden');;
        recordingStatus.classList.add('hidden');
        recordingStatus.classList.remove('hidden');

        // Process the recorded audio
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        const reader = new FileReader();

        reader.onload = async () => {
            if ('webkitSpeechRecognition' in window) {
                const recognition = new webkitSpeechRecognition();
                recognition.lang = 'en-US';
                recognition.continuous = false; // Single-word recognition
                recognition.interimResults = false;

                recognition.onresult = (event) => {
                    let spokenText = event.results[0][0].transcript.toLowerCase();
                    console.log('Recognized text:', spokenText);

                    // Normalize potential numeric values to string equivalents
                    if (spokenText === '6') {
                        spokenText = 'six';
                    }

                    if (spokenText === 'six') {
                        alert('You pronounced it correctly!');
                    } else {
                        alert('Try again.');
                    }
                };
                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event);
                    alert(`Speech recognition error: ${event.error}`);
                };
                recognition.onend = () => {
                    console.log('Speech recognition ended.');
                    recordingStatus.classList.add('hidden');
                    startRecordingButton.classList.remove('hidden');

                };

                recognition.start();
            } else {
                alert('Speech recognition not supported in this browser.');
            }
        };
        reader.readAsDataURL(blob);
    });
});
