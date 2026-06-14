export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <organization-launchpad-auth-form mode="login" success-path="/dashboard" />
      </div>
    </div>
  )
}
