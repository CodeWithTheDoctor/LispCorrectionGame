document.addEventListener('DOMContentLoaded', () => {
    // Background animation logic (unchanged)
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
    const stopRecordingButton = document.getElementById('stopRecording');
    const submitRecordingButton = document.getElementById('submitRecording');
    const playRecordingButton = document.createElement('button');
    playRecordingButton.textContent = 'Play Recording';
    playRecordingButton.classList.add('main-button', 'hidden');
    recordingControls.appendChild(playRecordingButton);
    const reRecordButton = document.getElementById('retryRecording');

    const recordingStatus = document.createElement('p');
    recordingStatus.style.color = 'red';
    recordingStatus.textContent = 'Recording...';
    recordingStatus.classList.add('hidden');
    recordingView.appendChild(recordingStatus);

    let mediaRecorder;
    let recordedChunks = [];
    let stream; // Keep a reference to the stream
    let audioBlob;

    // Event listeners
    startGameButton.addEventListener('click', () => {
        console.log('Start Game button clicked.');
        mainContainer.classList.add('hidden');
        recordingView.classList.remove('hidden');
    });

    startRecordingButton.addEventListener('click', async () => {
        console.log('Start Recording button clicked.');
        startRecordingButton.classList.add('hidden');
        stopRecordingButton.classList.remove('hidden');
        recordingStatus.classList.remove('hidden');

        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted.');
            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream);
            console.log('MediaRecorder initialized.');

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                    console.log('Data available:', event.data.size);
                }
            };

            mediaRecorder.onstop = () => {
                console.log('MediaRecorder stopped.');
                recordingStatus.classList.add('hidden');
                if (stream) {
                    stream.getTracks().forEach(track => track.stop()); // Stop the microphone
                    console.log('Microphone stream stopped.');
                }
                stopRecordingButton.classList.add('hidden');
                submitRecordingButton.classList.remove('hidden');
                playRecordingButton.classList.remove('hidden');
                reRecordButton.classList.remove('hidden');

                // Create a blob for playback
                audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
                console.log('Audio blob created:', audioBlob);
            };

            mediaRecorder.start();
            console.log('Recording started.');
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access your microphone. Please check your permissions.');
        }
    });

    stopRecordingButton.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            console.log('Recording stopped by user.');
            recordingControls.classList.remove('hidden');
        }
    });

    playRecordingButton.addEventListener('click', () => {
        if (audioBlob) {
            console.log('Playing back recording.');
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        } else {
            alert('No recording available to play.');
            console.log('No recording available for playback.');
        }
    });

    reRecordButton.addEventListener('click', () => {
        console.log('Re-recording initiated.');
        recordedChunks = [];
        audioBlob = null;
        playRecordingButton.classList.add('hidden');
        reRecordButton.classList.add('hidden');
        submitRecordingButton.classList.add('hidden');
        startRecordingButton.classList.remove('hidden');
        console.log('Ready to re-record.');
    });

    submitRecordingButton.addEventListener('click', () => {
        if (recordedChunks.length === 0) {
            alert('No recording available. Please try again.');
            console.log('Submit button clicked, but no recording available.');
            return;
        }

        // Convert recorded chunks to a Blob
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        console.log('Submitting audio blob:', blob);
        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');

        // Send the audio to the endpoint
        console.log('Sending audio to the server...');
        fetch('https://lisp.developerash.net/process-audio', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            if (data.result === false) {
                alert('Word pronounced correctly!');
            } else {
                alert('Try again.');
            }
        })
        .catch(error => {
            console.error('Error during fetch:', error);
            alert('An error occurred while processing the audio.' + error);
        });
    });
});
