document.addEventListener('DOMContentLoaded', () => {
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const convertNewBtn = document.getElementById('convertNewBtn');
    const conversionStatus = document.querySelector('.conversion-status');
    const downloadSection = document.querySelector('.download-section');
    const progressBar = document.querySelector('.progress');
    const percentageText = document.querySelector('.percentage');
    const statusMessage = document.querySelector('.status-message');
    const fileInfo = document.querySelector('.file-info');
    const videoTitle = document.querySelector('.video-title');
    const fileSize = document.querySelector('.file-size');
    const urlInput = document.getElementById('videoUrl');

    let progressInterval;

    const updateProgress = (progress) => {
        progressBar.style.width = `${progress}%`;
        percentageText.textContent = `${progress}%`;
    };

    const resetUI = () => {
        conversionStatus.classList.add('hidden');
        downloadSection.classList.add('hidden');
        fileInfo.classList.add('hidden');
        updateProgress(0);
        clearInterval(progressInterval);
        statusMessage.textContent = 'Converting...';
    };

    convertBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a valid URL');
            return;
        }

        // Reset and show progress UI
        resetUI();
        conversionStatus.classList.remove('hidden');
        convertBtn.disabled = true;

        // Hide download section while converting
        downloadSection.classList.add('hidden');

        // Simulate progress while actually converting
        let progress = 0;
        progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 10;
                updateProgress(Math.min(Math.round(progress), 90));
            }
        }, 500);

        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    format: document.getElementById('format').value,
                    quality: document.getElementById('quality').value
                }),
            });

            const data = await response.json();

            clearInterval(progressInterval);

            if (data.success) {
                updateProgress(100);
                statusMessage.textContent = 'Conversion Complete!';
                
                // Show file info if available
                if (data.title || data.size) {
                    fileInfo.classList.remove('hidden');
                    videoTitle.textContent = data.title || 'Unknown Title';
                    fileSize.textContent = data.size || 'Unknown Size';
                }

                // Setup download button and show download section
                downloadBtn.onclick = () => {
                    window.location.href = `/api/download/${data.filename}`;
                };
                downloadSection.classList.remove('hidden');
            } else {
                throw new Error(data.error || 'Conversion failed');
            }
        } catch (error) {
            clearInterval(progressInterval);
            statusMessage.textContent = `Error: ${error.message}`;
            updateProgress(0);
            downloadSection.classList.add('hidden');
        } finally {
            convertBtn.disabled = false;
        }
    });

    convertNewBtn.addEventListener('click', () => {
        urlInput.value = '';
        resetUI();
        urlInput.focus();
    });
}); 