"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";

export default function ProfileWidget() {
  const { user, isLoading } = useUser();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();

  // Close when clicking outside modal
  useEffect(() => {
    function handleClick(e) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading || !user) return null;

  const avatarSrc = user.picture;

  const initials = (user.name || user.email || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <style>{`
        .pw-root {
          position: relative;
        }

        .pw-trigger {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          overflow: hidden;
          cursor: pointer;
          background: var(--surface-card-muted);
          border: 1px solid var(--border-default);
          box-shadow: 0 4px 16px color-mix(in oklab, var(--text-strong) 15%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pw-trigger img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pw-trigger-initials {
          font-weight: 600;
          color: var(--text-strong);
        }

        .pw-modal {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 1100;
          width: 340px;
          max-width: 90vw;
          background: var(--surface-card);
          border: 1px solid var(--border-default);
          border-radius: 18px;
          box-shadow: 0 16px 40px color-mix(in oklab, var(--text-strong) 18%, transparent);
          overflow: hidden;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .pw-user-section {
          padding: 20px;
          border-bottom: 1px solid var(--border-soft);
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .pw-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--surface-card-muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pw-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pw-avatar-initials {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-strong);
        }

        .pw-user-info {
          overflow: hidden;
        }

        .pw-username {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-strong);
        }

        .pw-email {
          font-size: 12px;
          color: var(--text-muted);
        }

        .pw-menu {
          padding: 8px;
          display: flex;
          flex-direction: column;
        }

        .pw-menu-item {
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--text-default);
          text-align: left;
          font-size: 14px;
          transition: background 0.15s ease;
        }

        .pw-menu-item:hover {
          background: var(--surface-hover);
        }

        .pw-logout {
          color: var(--danger);
        }

        .pw-logout:hover {
          background: var(--surface-danger-soft);
        }
      `}</style>

      <div ref={containerRef} className="pw-root">
        <button
          className="pw-trigger"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Open profile menu"
          aria-expanded={open}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt={user.name || "User"} />
          ) : (
            <span className="pw-trigger-initials">
              {initials}
            </span>
          )}
        </button>

        {open && (
          <div className="pw-modal">
            <div className="pw-user-section">
              <div className="pw-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user.name || "User"} />
                ) : (
                  <span className="pw-avatar-initials">
                    {initials}
                  </span>
                )}
              </div>

              <div className="pw-user-info">
                <div className="pw-username">
                  {user.name || "—"}
                </div>
                <div className="pw-email">
                  {user.email || "—"}
                </div>
              </div>
            </div>

            <div className="pw-menu">
              <button
                className="pw-menu-item"
                onClick={() => {
                  setOpen(false);
                  router.push("/setting");
                }}
              >
                Profile
              </button>

              <button
                className="pw-menu-item"
                onClick={() => {
                  setOpen(false);
                  router.push("/settings");
                }}
              >
                Settings
              </button>

              <button
                className="pw-menu-item pw-logout"
                onClick={() => {
                  setOpen(false);
                  router.push("/auth/logout");
                }}
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
