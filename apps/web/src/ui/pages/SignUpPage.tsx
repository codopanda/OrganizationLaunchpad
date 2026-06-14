export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <organization-launchpad-auth-form mode="signup" success-path="/dashboard" />
      </div>
    </div>
  )
}
