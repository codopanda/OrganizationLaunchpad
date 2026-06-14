import { useEffect, useRef, useState } from 'react'

export default function CameraWidget() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        setStream(s)
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError('Camera not available. Please grant camera permissions.'))

    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function capturePhoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    setCapturedImage(canvas.toDataURL('image/jpeg'))
  }

  return (
    <div className="camera-widget">
      {error ? (
        <p className="error">{error}</p>
      ) : capturedImage ? (
        <img src={capturedImage} alt="Captured" className="camera-preview" />
      ) : (
        <video ref={videoRef} autoPlay playsInline className="camera-preview" />
      )}
      {!capturedImage && !error && (
        <button className="btn-primary" onClick={capturePhoto} disabled={!stream}>Capture</button>
      )}
      {capturedImage && (
        <button className="btn-primary" onClick={() => setCapturedImage(null)}>Retake</button>
      )}
    </div>
  )
}
