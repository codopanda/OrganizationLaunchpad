export default function CallbackPage() {
  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: 460 }}>
        <organization-launchpad-auth-callback success-path="/dashboard" fallback-path="/login" />
      </div>
    </div>
  )
}
