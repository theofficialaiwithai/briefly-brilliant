import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Nav } from "@/components/Nav";

type Settings = {
  weeklyGoal: number;
  preferredSection: string;
  autoAdvance: boolean;
  emailNotifications: boolean;
};

const SECTION_OPTIONS = [
  { value: "all", label: "All sections" },
  { value: "Logical Reasoning", label: "Logical Reasoning" },
  { value: "Logic Games", label: "Logic Games" },
  { value: "Reading Comprehension", label: "Reading Comprehension" },
];

const DEFAULT_SETTINGS: Settings = {
  weeklyGoal: 10,
  preferredSection: "all",
  autoAdvance: true,
  emailNotifications: true,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        backgroundColor: checked ? "#0D9488" : "#D1D5DB",
        position: "relative",
        transition: "background-color 0.2s",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "white",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

function SkeletonCard() {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 8, padding: 28, marginBottom: 16, boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
      <div style={{ width: 120, height: 14, borderRadius: 4, backgroundColor: "#E5E7EB", marginBottom: 20 }} />
      <div style={{ width: "60%", height: 12, borderRadius: 4, backgroundColor: "#F3F4F6", marginBottom: 10 }} />
      <div style={{ width: "40%", height: 12, borderRadius: 4, backgroundColor: "#F3F4F6" }} />
    </div>
  );
}

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { navigate("/auth"); return; }

    (async () => {
      const { data } = await (supabase as any)
        .from("users")
        .select("weekly_study_goal, preferred_section, auto_advance_videos, email_notifications")
        .eq("clerk_id", user.id)
        .maybeSingle();

      if (data) {
        setSettings({
          weeklyGoal: data.weekly_study_goal ?? 10,
          preferredSection: data.preferred_section ?? "all",
          autoAdvance: data.auto_advance_videos ?? true,
          emailNotifications: data.email_notifications ?? true,
        });
      }
      setLoading(false);
    })();
  }, [isLoaded, user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await (supabase as any).from("users").upsert(
      {
        clerk_id: user.id,
        weekly_study_goal: settings.weeklyGoal,
        preferred_section: settings.preferredSection,
        auto_advance_videos: settings.autoAdvance,
        email_notifications: settings.emailNotifications,
      },
      { onConflict: "clerk_id" }
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!isLoaded || loading) {
    return (
      <>
        <Nav />
        <div style={{ backgroundColor: "#FAF7F2", minHeight: "100vh", padding: "48px 24px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ width: 180, height: 28, borderRadius: 4, backgroundColor: "#E5E7EB", marginBottom: 32 }} />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </>
    );
  }

  const initial =
    user?.firstName?.[0]?.toUpperCase() ??
    user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ??
    "?";

  return (
    <>
      <Nav />
      <div style={{ backgroundColor: "#FAF7F2", minHeight: "100vh", padding: "48px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#1A1A2E",
              marginBottom: 32,
            }}
          >
            Profile Settings
          </h1>

          {/* Account */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 28,
              marginBottom: 16,
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 20,
              }}
            >
              Account
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    backgroundColor: "#0D9488",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {initial}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, color: "#1A1A2E", fontSize: 15 }}>
                  {user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress}
                </div>
                <div style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </div>
              </div>
            </div>
            <button
              onClick={() => openUserProfile()}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#0D9488",
                background: "none",
                border: "1px solid #0D9488",
                borderRadius: 6,
                padding: "7px 14px",
                cursor: "pointer",
              }}
            >
              Edit name &amp; password →
            </button>
          </div>

          {/* Study Preferences */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 28,
              marginBottom: 16,
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 20,
              }}
            >
              Study Preferences
            </h2>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#1A1A2E", marginBottom: 8 }}
              >
                Weekly study goal (hours)
              </label>
              <input
                type="number"
                min={1}
                max={80}
                value={settings.weeklyGoal}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    weeklyGoal: Math.max(1, Math.min(80, parseInt(e.target.value) || 1)),
                  }))
                }
                style={{
                  width: 80,
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 14,
                  color: "#1A1A2E",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                }}
              />
            </div>

            <div>
              <label
                style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#1A1A2E", marginBottom: 10 }}
              >
                Section focus
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SECTION_OPTIONS.map((opt) => {
                  const active = settings.preferredSection === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, preferredSection: opt.value }))}
                      style={{
                        padding: "7px 16px",
                        borderRadius: 99,
                        border: active ? "1.5px solid #0D9488" : "1.5px solid #E5E7EB",
                        backgroundColor: active ? "#F0FDFA" : "white",
                        color: active ? "#0D9488" : "#4B5563",
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Video Settings */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 28,
              marginBottom: 16,
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 20,
              }}
            >
              Video Settings
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>Auto-advance videos</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>
                  Automatically play the next video in a series
                </div>
              </div>
              <Toggle
                checked={settings.autoAdvance}
                onChange={(v) => setSettings((s) => ({ ...s, autoAdvance: v }))}
              />
            </div>
          </div>

          {/* Notifications */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 28,
              marginBottom: 36,
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 20,
              }}
            >
              Notifications
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1A1A2E" }}>Email notifications</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>
                  Receive study tips and progress updates by email
                </div>
              </div>
              <Toggle
                checked={settings.emailNotifications}
                onChange={(v) => setSettings((s) => ({ ...s, emailNotifications: v }))}
              />
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saved ? "#059669" : "#0D9488",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: 15,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              transition: "background-color 0.2s",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {saved ? "Settings saved ✓" : saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </>
  );
}
