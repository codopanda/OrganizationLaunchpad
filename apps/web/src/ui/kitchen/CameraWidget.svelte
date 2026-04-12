<script lang="ts">
	let stream = $state<MediaStream | null>(null);
	let capturedImage = $state<string | null>(null);
	let error = $state<string | null>(null);
	let videoElement: HTMLVideoElement | null = $state(null);
	let hasCamera = $state(true);

	async function startCamera() {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			stream = mediaStream;
			error = null;
			if (videoElement) {
				videoElement.srcObject = mediaStream;
			}
		} catch (err) {
			hasCamera = false;
			error = 'Camera not available. Please grant camera permissions.';
		}
	}

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	}

	function capturePhoto() {
		if (!videoElement) return;
		const canvas = document.createElement('canvas');
		canvas.width = videoElement.videoWidth;
		canvas.height = videoElement.videoHeight;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.drawImage(videoElement, 0, 0);
			capturedImage = canvas.toDataURL('image/jpeg');
		}
	}

	$effect(() => {
		startCamera();
		return () => stopCamera();
	});
</script>

<div class="camera-widget" role="region" aria-label="Camera widget">
	{#if error}
		<p class="error">{error}</p>
	{:else if capturedImage}
		<img src={capturedImage} alt="Captured" class="captured" />
	{:else}
		<video bind:this={videoElement} autoplay playsinline class="preview"></video>
	{/if}

	{#if !capturedImage && hasCamera}
		<button onclick={capturePhoto} disabled={!stream}>Capture</button>
	{/if}

	{#if capturedImage}
		<button onclick={() => (capturedImage = null)}>Retake</button>
	{/if}
</div>

<style>
	.camera-widget {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.preview,
	.captured {
		width: 100%;
		max-width: 400px;
		border-radius: 8px;
	}

	.error {
		color: #d32f2f;
	}

	button {
		padding: 0.5rem 1rem;
		background: #1976d2;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
</style>
