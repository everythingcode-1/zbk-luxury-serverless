type AdminAccessVariant = 'direct' | 'simple';

type AdminAccessCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  statusLines: string[];
  note: string;
};

const copy: Record<AdminAccessVariant, AdminAccessCopy> = {
  direct: {
    eyebrow: '#/admin-direct',
    title: 'Admin Access',
    summary: 'Login requirement telah dinonaktifkan. Halaman ini menjaga jalur akses admin legacy tetap terlihat sambil mengarah ke dashboard Workers yang sudah dimigrasi.',
    statusLines: ['AuthGuard dinonaktifkan', 'Admin dashboard dapat diakses langsung', 'Tidak perlu login'],
    note: 'This bridge mirrors the old direct admin entry point while keeping the actual admin experience in the serverless dashboard.',
  },
  simple: {
    eyebrow: '#/admin-simple',
    title: 'Admin Panel - Login Berhasil!',
    summary: 'Halaman ini meniru layar sukses login legacy agar reviewer bisa melihat jalur admin berhasil tanpa melepas auth workspace yang baru.',
    statusLines: ['Database PostgreSQL terhubung', 'Authentication berhasil', 'Tidak ada redirect loop'],
    note: 'This bridge mirrors the old simple success page while pointing back to the migrated dashboard and login workspace.',
  },
};

type AdminAccessViewProps = {
  variant: AdminAccessVariant;
};

export default function AdminAccessView({ variant }: AdminAccessViewProps) {
  const page = copy[variant];

  return (
    <section className="card card--wide auth-portal">
      <div className="section-title-row">
        <div>
          <h2>{page.title}</h2>
          <p className="muted">{page.summary}</p>
        </div>
        <span className="pill pill--muted">{page.eyebrow}</span>
      </div>

      <div className="auth-portal__intro">
        <p className="muted">
          The serverless dashboard is now the real destination, but these legacy compatibility pages keep the original
          access points easy to verify during the migration.
        </p>
      </div>

      <div className="auth-portal__grid">
        <a className="auth-portal__card" href="#/admin">
          <div className="auth-portal__card-header">
            <span className="pill">Dashboard</span>
            <strong>Open migrated admin</strong>
          </div>
          <p className="muted">Jump straight into the Workers-backed admin overview, catalog, bookings, and settings surfaces.</p>
          <span className="secondary-link">Open admin dashboard</span>
        </a>

        <a className="auth-portal__card" href="#/admin-test">
          <div className="auth-portal__card-header">
            <span className="pill pill--muted">Auth debug</span>
            <strong>Inspect session state</strong>
          </div>
          <p className="muted">Use the migrated auth console to inspect the browser storage shim and the live /api/auth/me response.</p>
          <span className="secondary-link">Open admin auth test</span>
        </a>
      </div>

      <div className="quote-facts">
        {page.statusLines.map((line) => (
          <div className="quote-facts__row" key={line}>
            <span>Legacy status</span>
            <strong>{line}</strong>
          </div>
        ))}
      </div>

      <div className="service-pills service-pills--tight">
        <a className="secondary-link" href="#/login/admin">
          Back to admin login
        </a>
        <a className="secondary-link" href="#/login">
          Back to login portal
        </a>
        <a className="secondary-link" href="#/">
          Back to website
        </a>
      </div>

      <p className="muted auth-workspace__note">{page.note}</p>
    </section>
  );
}
