export default function LoginPortalView() {
  return (
    <section className="card card--wide auth-portal">
      <div className="section-title-row">
        <div>
          <h2>Login portal</h2>
          <p className="muted">
            The legacy Next.js portal has been reworked into hash-routed Workers-safe access points for admin and customer sessions.
          </p>
        </div>
        <span className="pill pill--muted">#/login</span>
      </div>

      <div className="auth-portal__intro">
        <p className="muted">
          Choose the workspace that matches your role. Admin access leads into the authenticated dashboard flow,
          while customer access jumps straight to the migrated booking history entry point.
        </p>
      </div>

      <div className="auth-portal__grid">
        <a className="auth-portal__card" href="#/login/admin">
          <div className="auth-portal__card-header">
            <span className="pill">Admin access</span>
            <strong>Operations login</strong>
          </div>
          <p className="muted">
            Pre-fills the admin demo account and opens the Workers auth workspace for the dashboard/session slice.
          </p>
          <span className="secondary-link">Open admin login</span>
        </a>

        <a className="auth-portal__card" href="#/my-bookings">
          <div className="auth-portal__card-header">
            <span className="pill pill--muted">Customer access</span>
            <strong>Booking history entry</strong>
          </div>
          <p className="muted">
            Jumps into the customer-facing auth landing page so the authenticated booking history snapshot is one click away.
          </p>
          <span className="secondary-link">Open customer workspace</span>
        </a>
      </div>

      <div className="service-pills service-pills--tight">
        <a className="secondary-link" href="#/admin-test">
          Open admin auth test console
        </a>
      </div>

      <p className="muted auth-workspace__note">
        This route is a small parity bridge for the old login portal while the new Workers session model keeps the actual auth flow in one shared workspace.
      </p>
    </section>
  );
}
