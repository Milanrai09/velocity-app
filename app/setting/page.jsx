"use client";

import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
const THEME_STORAGE_KEY = "app-theme";

// ─── TAB COMPONENTS ──────────────────────────────────────────────────────────

function ProfileTab({
  user,
  profile,
  profileLoading,
  profileSaving,
  profileError,
  profileSuccess,
  hasProfileChanges,
  onProfileChange,
  onProfileSave,
}) {
  return (
    <div className="tab-content">
      <h2 className="tab-title">Profile</h2>
      <p className="tab-desc">Manage how others see you.</p>

      <div className="avatar-row">
        <div className="avatar-ring">
          {user?.picture ? (
            <img
              src={user.picture}
              alt="avatar"
              className="avatar-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : null}
          <span className="avatar-fallback">
            {(user?.name || user?.email || "?")[0].toUpperCase()}
          </span>
        </div>
        <div>
          <button className="btn-secondary">Change photo</button>
          <p className="hint">JPG, PNG or GIF · max 2 MB</p>
        </div>
      </div>

      <div className="field-grid">
        <Field
          label="Full name"
          value={profile.fullName}
          placeholder="Your name"
          disabled
        />
        <Field
          label="Email"
          value={profile.email}
          placeholder="you@example.com"
          type="email"
          disabled
        />
        <Field
          label="Display name"
          value={profile.displayName}
          onChange={onProfileChange}
          name="displayName"
          placeholder="@handle"
        />
        <Field
          label="Bio"
          value={profile.bio}
          onChange={onProfileChange}
          name="bio"
          placeholder="Tell people a bit about yourself…"
          textarea
        />
        <Field
          label="Website"
          value={profile.website}
          onChange={onProfileChange}
          name="website"
          placeholder="https://"
        />
      </div>

      {profileError ? <p className="status-text error">{profileError}</p> : null}
      {profileSuccess ? <p className="status-text success">{profileSuccess}</p> : null}

      <div className="action-row">
        <button
          className="btn-primary"
          disabled={!hasProfileChanges || profileSaving || profileLoading}
          onClick={onProfileSave}
        >
          {profileSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function AccountTab() {
  return (
    <div className="tab-content">
      <h2 className="tab-title">Account</h2>
      <p className="tab-desc">Manage your account credentials and identity.</p>

      <Section title="Change password">
        <Field label="Current password" type="password" placeholder="••••••••" />
        <Field label="New password" type="password" placeholder="••••••••" />
        <Field label="Confirm new password" type="password" placeholder="••••••••" />
        <div className="action-row"><button className="btn-primary">Update password</button></div>
      </Section>

      <Section title="Danger zone" danger>
        <p className="hint" style={{marginBottom:12}}>Once you delete your account, there is no going back.</p>
        <button className="btn-danger">Delete account</button>
      </Section>
    </div>
  );
}

function NotificationsTab() {
  const [state, setState] = useState({
    email_updates: true,
    email_security: true,
    push_messages: false,
    push_mentions: true,
    digest_weekly: false,
  });
  const toggle = (k) => setState(s => ({ ...s, [k]: !s[k] }));

  const rows = [
    { key: "email_updates", label: "Product updates", sub: "News, announcements and feature releases" },
    { key: "email_security", label: "Security alerts", sub: "Sign-ins from new devices or locations" },
    { key: "push_messages", label: "Direct messages", sub: "Notify when you receive a new message" },
    { key: "push_mentions", label: "Mentions", sub: "When someone mentions you in a comment" },
    { key: "digest_weekly", label: "Weekly digest", sub: "A summary of activity every Monday" },
  ];

  return (
    <div className="tab-content">
      <h2 className="tab-title">Notifications</h2>
      <p className="tab-desc">Choose what you hear about and how.</p>
      <div className="toggle-list">
        {rows.map(({ key, label, sub }) => (
          <div key={key} className="toggle-row" onClick={() => toggle(key)}>
            <div>
              <div className="toggle-label">{label}</div>
              <div className="toggle-sub">{sub}</div>
            </div>
            <div className={`toggle-switch ${state[key] ? "on" : ""}`}>
              <div className="toggle-knob" />
            </div>
          </div>
        ))}
      </div>
      <div className="action-row"><button className="btn-primary">Save preferences</button></div>
    </div>
  );
}

function AppearanceTab({ theme, setTheme }) {
  const [accent, setAccent] = useState("#6366f1");
  const [font, setFont] = useState("dm");

  const themes = ["light", "dark", "system"];
  const accents = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];
  const fonts = [
    { id: "dm", label: "DM Sans" },
    { id: "inter", label: "Inter" },
    { id: "mono", label: "Mono" },
  ];

  return (
    <div className="tab-content">
      <h2 className="tab-title">Appearance</h2>
      <p className="tab-desc">Personalise the look and feel of your workspace.</p>

      <Section title="Theme">
        <div className="chip-row">
          {themes.map(t => (
            <button key={t} className={`chip ${theme === t ? "active" : ""}`} onClick={() => setTheme(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Accent colour">
        <div className="color-row">
          {accents.map(c => (
            <button
              key={c}
              className={`color-dot ${accent === c ? "selected" : ""}`}
              style={{ background: c }}
              onClick={() => setAccent(c)}
            />
          ))}
        </div>
      </Section>

      <Section title="Font">
        <div className="chip-row">
          {fonts.map(f => (
            <button key={f.id} className={`chip ${font === f.id ? "active" : ""}`} onClick={() => setFont(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </Section>

      <div className="action-row"><button className="btn-primary">Apply</button></div>
    </div>
  );
}

function PrivacyTab() {
  const [state, setState] = useState({ public_profile: true, show_email: false, activity: true });
  const toggle = (k) => setState(s => ({ ...s, [k]: !s[k] }));

  const rows = [
    { key: "public_profile", label: "Public profile", sub: "Allow anyone to view your profile page" },
    { key: "show_email", label: "Show email address", sub: "Display your email on your public profile" },
    { key: "activity", label: "Activity status", sub: "Let others see when you were last active" },
  ];

  return (
    <div className="tab-content">
      <h2 className="tab-title">Privacy</h2>
      <p className="tab-desc">Control your data and what others can see.</p>
      <div className="toggle-list">
        {rows.map(({ key, label, sub }) => (
          <div key={key} className="toggle-row" onClick={() => toggle(key)}>
            <div>
              <div className="toggle-label">{label}</div>
              <div className="toggle-sub">{sub}</div>
            </div>
            <div className={`toggle-switch ${state[key] ? "on" : ""}`}>
              <div className="toggle-knob" />
            </div>
          </div>
        ))}
      </div>
      <div className="action-row"><button className="btn-primary">Save</button></div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="tab-content">
      <h2 className="tab-title">Billing</h2>
      <p className="tab-desc">Manage your subscription and payment methods.</p>

      <div className="plan-card">
        <div>
          <div className="plan-name">Pro Plan</div>
          <div className="hint">$12 / month · renews Jan 1, 2026</div>
        </div>
        <button className="btn-secondary">Change plan</button>
      </div>

      <Section title="Payment method">
        <div className="card-row">
          <div className="card-icon">💳</div>
          <div>
            <div className="toggle-label">Visa ending in 4242</div>
            <div className="hint">Expires 08 / 2027</div>
          </div>
          <button className="btn-secondary" style={{marginLeft:"auto"}}>Update</button>
        </div>
      </Section>

      <Section title="Billing history">
        {["Jan 2025", "Dec 2024", "Nov 2024"].map(m => (
          <div key={m} className="billing-row">
            <span className="toggle-label">{m} — Pro Plan</span>
            <span className="hint">$12.00</span>
            <button className="btn-ghost">Receipt</button>
          </div>
        ))}
      </Section>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="tab-content">
      <h2 className="tab-title">Security</h2>
      <p className="tab-desc">Keep your account safe.</p>

      <Section title="Two-factor authentication">
        <p className="hint" style={{marginBottom:12}}>Add an extra layer of security to your account.</p>
        <button className="btn-primary">Enable 2FA</button>
      </Section>

      <Section title="Active sessions">
        {[
          { device: "MacBook Pro · Chrome", loc: "Aizawl, IN", current: true },
          { device: "iPhone 14 · Safari", loc: "Aizawl, IN", current: false },
        ].map(({ device, loc, current }) => (
          <div key={device} className="session-row">
            <div>
              <div className="toggle-label">{device} {current && <span className="badge">current</span>}</div>
              <div className="hint">{loc}</div>
            </div>
            {!current && <button className="btn-danger-ghost">Revoke</button>}
          </div>
        ))}
      </Section>
    </div>
  );
}

// ─── NAV CONFIG ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    id: "account",
    label: "Account",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: "billing",
    label: "Billing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

// Map nav id → component
const TAB_MAP = {
  profile: ProfileTab,
  account: AccountTab,
  notifications: NotificationsTab,
  appearance: AppearanceTab,
  privacy: PrivacyTab,
  billing: BillingTab,
  security: SecurityTab,
};

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────

function Section({ title, children, danger }) {
  return (
    <div className={`section-block ${danger ? "danger" : ""}`}>
      <div className="section-title">{title}</div>
      {children}
    </div>
  );
}

function Field({
  label,
  defaultValue,
  value,
  onChange,
  name,
  placeholder,
  type = "text",
  textarea,
  disabled,
}) {
  const isControlled = value !== undefined;
  const inputProps = isControlled
    ? {
        value: value ?? "",
        ...(onChange
          ? {
              onChange: (event) => onChange(name, event.target.value),
              name,
            }
          : { readOnly: true }),
      }
    : {
        defaultValue,
      };

  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {textarea ? (
        <textarea
          className="field-input"
          placeholder={placeholder}
          rows={3}
          disabled={disabled}
          {...inputProps}
        />
      ) : (
        <input
          className={`field-input ${disabled ? "disabled" : ""}`}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...inputProps}
        />
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useUser();
  const [active, setActive] = useState("profile");
  const [theme, setTheme] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("dark");
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    displayName: "",
    bio: "",
    website: "",
  });
  const [initialProfile, setInitialProfile] = useState({
    displayName: "",
    bio: "",
    website: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const nextResolvedTheme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      setResolvedTheme(nextResolvedTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
      document.documentElement.setAttribute("data-theme", nextResolvedTheme);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError("");

        const response = await fetch("/api/setting", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load profile");
        }

        if (!mounted) {
          return;
        }

        const nextProfile = {
          fullName: data.profile?.fullName || user.name || "",
          email: data.profile?.email || user.email || "",
          displayName: data.profile?.displayName || "",
          bio: data.profile?.bio || "",
          website: data.profile?.website || "",
        };

        setProfile(nextProfile);
        setInitialProfile({
          displayName: nextProfile.displayName,
          bio: nextProfile.bio,
          website: nextProfile.website,
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setProfileError(error.message || "Failed to load profile");
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const hasProfileChanges =
    profile.displayName !== initialProfile.displayName ||
    profile.bio !== initialProfile.bio ||
    profile.website !== initialProfile.website;

  const handleProfileChange = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setProfileError("");
    setProfileSuccess("");
  };

  const handleProfileSave = async () => {
    if (!hasProfileChanges || profileSaving) {
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await fetch("/api/setting", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: profile.displayName,
          bio: profile.bio,
          website: profile.website,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save profile");
      }

      const nextProfile = {
        fullName: data.profile?.fullName || profile.fullName,
        email: data.profile?.email || profile.email,
        displayName: data.profile?.displayName || "",
        bio: data.profile?.bio || "",
        website: data.profile?.website || "",
      };

      setProfile(nextProfile);
      setInitialProfile({
        displayName: nextProfile.displayName,
        bio: nextProfile.bio,
        website: nextProfile.website,
      });
      setProfileSuccess("Profile updated successfully.");
    } catch (error) {
      setProfileError(error.message || "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const ActiveTab = TAB_MAP[active];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .settings-root {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a12;
          min-height: 100vh;
          color: #e2e2ee;
          display: flex;
          flex-direction: column;
        }

        /* ── top bar ── */
        .settings-topbar {
          padding: 0 32px;
          height: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .topbar-back {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: #6b6b8a;
          background: none; border: none; cursor: pointer;
          padding: 5px 8px; border-radius: 7px;
          transition: color 0.15s, background 0.15s;
          text-decoration: none;
        }
        .topbar-back:hover { color: #c0c0dd; background: rgba(255,255,255,0.05); }
        .topbar-sep { color: #2e2e42; font-size: 18px; }
        .topbar-title { font-size: 14px; font-weight: 600; color: #c0c0dd; }

        /* ── layout ── */
        .settings-body {
          display: flex;
          flex: 1;
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          padding: 40px 24px;
          gap: 32px;
          align-items: flex-start;
        }

        /* ── LEFT NAV ── */
        .settings-nav {
          width: 200px;
          flex-shrink: 0;
          position: sticky;
          top: 32px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-group-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3e3e5a;
          padding: 0 10px;
          margin: 10px 0 4px;
        }
        .nav-group-label:first-child { margin-top: 0; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: #6b6b8a;
          transition: background 0.14s, color 0.14s;
          letter-spacing: -0.01em;
        }
        .nav-item svg { flex-shrink: 0; opacity: 0.5; transition: opacity 0.14s; }
        .nav-item:hover { background: rgba(255,255,255,0.04); color: #b0b0cc; }
        .nav-item:hover svg { opacity: 0.75; }
        .nav-item.active {
          background: rgba(99,102,241,0.12);
          color: #a5b4fc;
        }
        .nav-item.active svg { opacity: 1; }
        .nav-item.active .nav-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #6366f1; margin-left: auto; flex-shrink: 0;
        }

        /* ── RIGHT PANEL ── */
        .settings-panel {
          flex: 1;
          min-width: 0;
          animation: fade-in 0.18s ease both;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── tab content shared ── */
        .tab-content { display: flex; flex-direction: column; gap: 0; }
        .tab-title {
          font-size: 20px; font-weight: 600; letter-spacing: -0.025em;
          color: #f0f0f8; margin-bottom: 4px;
        }
        .tab-desc { font-size: 13px; color: #5a5a7a; margin-bottom: 28px; }

        .section-block {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          background: rgba(255,255,255,0.02);
        }
        .section-block.danger { border-color: rgba(248,113,113,0.15); background: rgba(248,113,113,0.03); }
        .section-title {
          font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: #3e3e5a;
          margin-bottom: 16px;
        }

        /* avatar */
        .avatar-row {
          display: flex; align-items: center; gap: 18px;
          padding: 20px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; margin-bottom: 20px;
        }
        .avatar-ring {
          width: 64px; height: 64px; border-radius: 50%;
          border: 2px solid rgba(99,102,241,0.35);
          overflow: hidden; position: relative; flex-shrink: 0;
          background: #1a1a2e;
          display: flex; align-items: center; justify-content: center;
        }
        .avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-fallback {
          position: absolute; font-size: 22px; font-weight: 600;
          color: #a5b4fc;
        }

        /* fields */
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field:last-child:nth-child(odd) { grid-column: 1 / -1; }
        .field-label { font-size: 12px; font-weight: 500; color: #6b6b8a; letter-spacing: 0.02em; }
        .field-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #d8d8ee;
          outline: none;
          transition: border-color 0.15s;
          resize: none;
        }
        .field-input:focus { border-color: rgba(99,102,241,0.5); }
        .field-input.disabled { opacity: 0.4; cursor: not-allowed; }
        .field-input::placeholder { color: #3e3e5a; }

        /* toggle */
        .toggle-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 20px; }
        .toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          cursor: pointer; margin-bottom: 6px;
          transition: background 0.13s;
        }
        .toggle-row:hover { background: rgba(255,255,255,0.04); }
        .toggle-label { font-size: 13.5px; font-weight: 500; color: #c8c8e0; }
        .toggle-sub { font-size: 12px; color: #4a4a68; margin-top: 2px; }
        .toggle-switch {
          width: 36px; height: 20px; border-radius: 10px;
          background: rgba(255,255,255,0.1);
          position: relative; flex-shrink: 0;
          transition: background 0.2s;
        }
        .toggle-switch.on { background: #6366f1; }
        .toggle-knob {
          position: absolute; top: 3px; left: 3px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #fff; transition: transform 0.2s;
        }
        .toggle-switch.on .toggle-knob { transform: translateX(16px); }

        /* chips */
        .chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .chip {
          padding: 7px 16px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          color: #6b6b8a; cursor: pointer;
          transition: all 0.15s;
        }
        .chip:hover { border-color: rgba(99,102,241,0.3); color: #a5b4fc; }
        .chip.active { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); color: #a5b4fc; }

        /* color dots */
        .color-row { display: flex; gap: 10px; }
        .color-dot {
          width: 28px; height: 28px; border-radius: 50%;
          border: 2px solid transparent; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .color-dot:hover { transform: scale(1.15); }
        .color-dot.selected { border-color: #fff; box-shadow: 0 0 0 2px rgba(255,255,255,0.2); }

        /* billing */
        .plan-card {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08));
          border: 1px solid rgba(99,102,241,0.2);
          margin-bottom: 16px;
        }
        .plan-name { font-size: 15px; font-weight: 600; color: #c4c4f0; margin-bottom: 3px; }
        .card-row { display: flex; align-items: center; gap: 12px; }
        .card-icon { font-size: 22px; }
        .billing-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .billing-row:last-child { border-bottom: none; }

        /* sessions */
        .session-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .session-row:last-child { border-bottom: none; }
        .badge {
          font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
          background: rgba(99,102,241,0.2); color: #a5b4fc;
          padding: 2px 6px; border-radius: 4px; margin-left: 6px;
        }

        /* buttons */
        .action-row { display: flex; gap: 10px; margin-top: 4px; }
        .btn-primary {
          padding: 9px 20px; border-radius: 8px;
          background: #6366f1; border: none; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          letter-spacing: -0.01em;
        }
        .btn-primary:hover { background: #5254cc; }
        .btn-primary:active { transform: scale(0.97); }
        .btn-primary:disabled {
          background: #41417c;
          opacity: 0.65;
          cursor: not-allowed;
        }
        .btn-primary:disabled:active { transform: none; }
        .btn-secondary {
          padding: 8px 16px; border-radius: 8px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: #b0b0cc; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.15s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        .btn-danger {
          padding: 8px 16px; border-radius: 8px;
          background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.25);
          color: #f87171; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.15s;
        }
        .btn-danger:hover { background: rgba(248,113,113,0.2); }
        .btn-danger-ghost {
          padding: 5px 12px; border-radius: 6px;
          background: none; border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; font-family: 'DM Sans', sans-serif;
          font-size: 12px; cursor: pointer;
        }
        .btn-ghost {
          padding: 4px 10px; border-radius: 6px;
          background: none; border: 1px solid rgba(255,255,255,0.1);
          color: #6b6b8a; font-family: 'DM Sans', sans-serif;
          font-size: 12px; cursor: pointer; margin-left: auto;
        }
        .hint { font-size: 11.5px; color: #4a4a68; }
        .status-text {
          font-size: 12px;
          margin-bottom: 10px;
        }
        .status-text.error { color: #fca5a5; }
        .status-text.success { color: #86efac; }

        .settings-root.theme-light,
        .settings-root.theme-light * {
          background: #ffffff !important;
          color: #000000 !important;
          border-color: rgba(0, 0, 0, 0.18) !important;
        }

        /* responsive */
        @media (max-width: 640px) {
          .settings-body { flex-direction: column; padding: 20px 16px; }
          .settings-nav { width: 100%; position: static; flex-direction: row; flex-wrap: wrap; gap: 4px; }
          .nav-group-label { display: none; }
          .nav-item { width: auto; padding: 7px 12px; }
          .field-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className={`settings-root ${resolvedTheme === "light" ? "theme-light" : "theme-dark"}`}>
        {/* Top bar */}
        <div className="settings-topbar">
          <button className="topbar-back" onClick={() => window.history.back()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
     
        </div>

        {/* Body */}
        <div className="settings-body">

          {/* LEFT NAV */}
          <nav className="settings-nav" aria-label="Settings navigation">
            <span className="nav-group-label">General</span>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${active === item.id ? "active" : ""}`}
                onClick={() => setActive(item.id)}
                aria-current={active === item.id ? "page" : undefined}
              >
                {item.icon}
                {item.label}
                {active === item.id && <span className="nav-dot" />}
              </button>
            ))}
          </nav>

          {/* RIGHT PANEL — renders whichever tab is active */}
          <main className="settings-panel" key={active}>
            <ActiveTab
              user={user}
              theme={theme}
              setTheme={setTheme}
              profile={profile}
              profileLoading={profileLoading}
              profileSaving={profileSaving}
              profileError={profileError}
              profileSuccess={profileSuccess}
              hasProfileChanges={hasProfileChanges}
              onProfileChange={handleProfileChange}
              onProfileSave={handleProfileSave}
            />
          </main>

        </div>
      </div>
    </>
  );
}
