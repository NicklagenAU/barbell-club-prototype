import React, { useEffect, useMemo, useState } from "react";

// Dependency-free Barbell Club prototype.
// This version avoids lucide-react, framer-motion, and shadcn/ui so the ChatGPT canvas preview can run without fetching external CDN modules.

type Lift = "Squat" | "Bench" | "Deadlift" | "Press";
type Unit = "lb" | "kg";
type Profile = { name: string; email: string; heightIn: number; weightLb: number };
type PR = { id: number; lift: Lift; weight: number; unit: Unit; date: string };
type TeamUser = { name: string; Squat: number; Bench: number; Deadlift: number };

const initialProfile: Profile = {
  name: "Nick L.",
  email: "nick@example.com",
  heightIn: 69,
  weightLb: 148,
};

const initialPRs: PR[] = [
  { id: 1, lift: "Squat", weight: 365, unit: "lb", date: "2025-08-20" },
  { id: 2, lift: "Bench", weight: 245, unit: "lb", date: "2025-06-02" },
  { id: 3, lift: "Deadlift", weight: 455, unit: "lb", date: "2025-09-12" },
];

const baseTeamPRs: TeamUser[] = [
  { name: "Avery R.", Squat: 315, Bench: 205, Deadlift: 405 },
  { name: "Sam K.", Squat: 365, Bench: 225, Deadlift: 455 },
];

function kgToLb(kg: number) {
  return +(kg * 2.20462262185).toFixed(2);
}

function lbToKg(lb: number) {
  return +(lb / 2.20462262185).toFixed(2);
}

function computeWarmup(opener: number) {
  if (!opener || opener <= 0) return [] as { id: number; percent: number; weight: number; reps: number }[];
  const scheme = [0.4, 0.55, 0.7, 0.8, 0.9];
  return scheme.map((p, i) => ({
    id: i + 1,
    percent: Math.round(p * 100),
    weight: Math.round((opener * p) / 5) * 5,
    reps: i < 2 ? 5 : i === 2 ? 3 : i === 3 ? 2 : 1,
  }));
}

function getTeamUsers(): TeamUser[] {
  try {
    if (typeof window === "undefined") return baseTeamPRs;
    const raw = localStorage.getItem("teamUsers");
    return raw ? JSON.parse(raw) : baseTeamPRs;
  } catch {
    return baseTeamPRs;
  }
}

function setTeamUsers(arr: TeamUser[]) {
  try {
    if (typeof window !== "undefined") localStorage.setItem("teamUsers", JSON.stringify(arr));
  } catch {
    // Prototype fallback: ignore storage errors.
  }
}

function runSelfTests() {
  console.assert(kgToLb(0) === 0, "kgToLb(0) should be 0");
  console.assert(lbToKg(0) === 0, "lbToKg(0) should be 0");
  const roundTrip = lbToKg(kgToLb(200));
  console.assert(Math.abs(roundTrip - 200) < 0.1, "kg/lb round-trip should be close to original value");
  const warmups = computeWarmup(400);
  console.assert(warmups.length === 5, "warm-up calculator should create five sets");
  console.assert(warmups.every((s) => s.weight % 5 === 0), "warm-up weights should round to nearest 5");
  console.assert(Math.round(500 * 0.85) === 425, "opener calculator should return 85% of third attempt");
  const team = getTeamUsers();
  console.assert(Array.isArray(team), "getTeamUsers should always return an array");
}

function Button({ children, onClick, variant = "solid", className = "", type = "button" }: any) {
  return (
    <button type={type} onClick={onClick} className={`btn ${variant === "outline" ? "btn-outline" : ""} ${className}`}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }: any) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Input(props: any) {
  return <input className="input" {...props} />;
}

function SelectBox(props: any) {
  return <select className="input" {...props} />;
}

function Label({ children }: any) {
  return <label className="label">{children}</label>;
}

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="chart-placeholder">
      <div className="chart-icon">📈</div>
      <div>{title}</div>
      <div className="muted small">Prototype chart placeholder</div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="center-screen">
      <Card className="intro-card">
        <div className="card-header">
          <h1>Barbell Club Prototype</h1>
        </div>
        <div className="card-body space">
          <p className="muted">
            This prototype walks from introduction/login to logout for both Member and Admin paths. It is dependency-free so it can preview directly in canvas.
          </p>
          <Button className="full" onClick={onStart}>Begin</Button>
          <div className="muted small">Gallery Walk build • v1</div>
        </div>
      </Card>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (p: { role: "member" | "admin"; email: string }) => void }) {
  const [role, setRole] = useState<"member" | "admin">("member");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  function handle() {
    if (!email.trim() || !pwd.trim()) {
      setError("Please enter email and password.");
      return;
    }
    onLogin({ role, email });
  }

  return (
    <div className="center-screen">
      <Card className="login-card">
        <div className="card-header"><h2>Login</h2></div>
        <div className="card-body space">
          <Label>Role</Label>
          <SelectBox value={role} onChange={(e: any) => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </SelectBox>

          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="you@barbell.club" />

          <Label>Password</Label>
          <Input type="password" value={pwd} onChange={(e: any) => setPwd(e.target.value)} placeholder="••••••••" />

          {error && <div className="error">{error}</div>}
          <Button className="full" onClick={handle}>Sign in</Button>
        </div>
      </Card>
    </div>
  );
}

function ConverterWidget() {
  const [kg, setKg] = useState(100);
  const [lb, setLb] = useState(kgToLb(100));

  function onKg(value: string) {
    const val = Number(value) || 0;
    setKg(val);
    setLb(kgToLb(val));
  }

  function onLb(value: string) {
    const val = Number(value) || 0;
    setLb(val);
    setKg(lbToKg(val));
  }

  return (
    <div className="grid two">
      <div>
        <Label>Kilograms (kg)</Label>
        <Input type="number" value={kg} onChange={(e: any) => onKg(e.target.value)} />
      </div>
      <div>
        <Label>Pounds (lb)</Label>
        <Input type="number" value={lb} onChange={(e: any) => onLb(e.target.value)} />
      </div>
    </div>
  );
}

function MemberDash({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [errors, setErrors] = useState({ height: false, weight: false });
  const [newPR, setNewPR] = useState<{ lift: Lift; weight: string; unit: Unit }>({ lift: "Squat", weight: "", unit: "lb" });
  const [prs, setPRs] = useState<PR[]>(initialPRs);
  const [opener, setOpener] = useState(405);
  const [thirdAttempt, setThirdAttempt] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const warmups = useMemo(() => computeWarmup(opener), [opener]);

  function showToast(message: string, ms = 1600) {
    setToastMsg(message);
    window.setTimeout(() => setToastMsg(""), ms);
  }

  function saveProfile(field: keyof Profile, value: any) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  function addOrUpdatePR(nextPR: { lift: Lift; weight: number; unit: Unit; date: string }) {
    setPRs((list) => {
      const idx = list.findIndex((p) => p.lift === nextPR.lift);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = { ...updated[idx], ...nextPR };
        return updated;
      }
      return [...list, { id: Date.now(), ...nextPR }];
    });
  }

  const rows = useMemo(() => {
    const current: any = { Squat: 0, Bench: 0, Deadlift: 0 };
    prs.forEach((p) => {
      if (p.lift === "Press") return;
      const valueInLb = p.unit === "kg" ? kgToLb(p.weight) : p.weight;
      current[p.lift] = Math.round(valueInLb);
    });

    return getTeamUsers()
      .filter((m) => m.name !== profile.name)
      .concat([{ name: profile.name, Squat: current.Squat || 0, Bench: current.Bench || 0, Deadlift: current.Deadlift || 0 }]);
  }, [prs, profile.name]);

  return (
    <div className="page">
      <header className="topbar">
        <h1>🏋️ Member Dashboard</h1>
        <Button variant="outline" onClick={onLogout}>Logout</Button>
      </header>

      {toastMsg && <div className="toast">{toastMsg}</div>}

      <div className="tabs">
        {[
          ["profile", "👤 Profile"],
          ["prs", "🏆 PRs"],
          ["warmup", "🔥 Warm-up / Opener"],
          ["charts", "📊 Charts"],
          ["convert", "⚖️ Convert"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`tab ${activeTab === key ? "active" : ""}`}>{label}</button>
        ))}
      </div>

      {activeTab === "profile" && (
        <Card>
          <div className="card-header"><h2>Edit Personal Information</h2></div>
          <div className="card-body grid two">
            <div>
              <Label>Name</Label>
              <Input value={profile.name} onChange={(e: any) => saveProfile("name", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile.email} onChange={(e: any) => saveProfile("email", e.target.value)} />
            </div>
            <div>
              <Label>Height (in)</Label>
              <Input type="number" min="0" value={profile.heightIn} onChange={(e: any) => {
                const val = Number(e.target.value);
                if (val < 0) { setErrors((p) => ({ ...p, height: true })); return; }
                setErrors((p) => ({ ...p, height: false }));
                saveProfile("heightIn", val);
              }} />
              {errors.height && <div className="error small">Height cannot be negative.</div>}
            </div>
            <div>
              <Label>Weight (lb)</Label>
              <Input type="number" min="0" value={profile.weightLb} onChange={(e: any) => {
                const val = Number(e.target.value);
                if (val < 0) { setErrors((p) => ({ ...p, weight: true })); return; }
                setErrors((p) => ({ ...p, weight: false }));
                saveProfile("weightLb", val);
              }} />
              {errors.weight && <div className="error small">Weight cannot be negative.</div>}
            </div>
            <div className="success span-two">Changes saved locally in this prototype.</div>
          </div>
        </Card>
      )}

      {activeTab === "prs" && (
        <Card>
          <div className="card-header"><h2>Edit / Add Personal Records</h2></div>
          <div className="card-body space">
            <div className="grid four">
              <SelectBox value={newPR.lift} onChange={(e: any) => setNewPR((p) => ({ ...p, lift: e.target.value }))}>
                <option>Squat</option>
                <option>Bench</option>
                <option>Deadlift</option>
                <option>Press</option>
              </SelectBox>
              <Input type="number" min="1" placeholder="Weight" value={newPR.weight} onChange={(e: any) => setNewPR((p) => ({ ...p, weight: e.target.value }))} />
              <SelectBox value={newPR.unit} onChange={(e: any) => setNewPR((p) => ({ ...p, unit: e.target.value }))}>
                <option>lb</option>
                <option>kg</option>
              </SelectBox>
              <Button onClick={() => {
                const weight = Number(newPR.weight);
                if (!weight || weight <= 0) {
                  showToast("Enter a PR weight greater than 0");
                  return;
                }
                addOrUpdatePR({ lift: newPR.lift, weight, unit: newPR.unit, date: new Date().toISOString().slice(0, 10) });
                setNewPR((p) => ({ ...p, weight: "" }));
                showToast(`${newPR.lift} PR updated`);
              }}>Add PR</Button>
            </div>

            <div className="grid three">
              {prs.map((pr) => (
                <Card key={pr.id} className="mini-card">
                  <div className="card-body">
                    <h3>{pr.lift}</h3>
                    <div className="big-number">{pr.weight}{pr.unit}</div>
                    <div className="muted small">{pr.date}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === "warmup" && (
        <Card>
          <div className="card-header"><h2>Warm-up / Opener Calculator</h2></div>
          <div className="card-body space">
            <div className="grid two">
              <div>
                <Label>Opener / Target (lb)</Label>
                <Input type="number" min="45" value={opener} onChange={(e: any) => setOpener(Number(e.target.value || 0))} />
                <div className="muted small">Scheme: 40/55/70/80/90 – rounded to nearest 5.</div>
              </div>
              <div>
                <Label>Estimated 3rd Attempt (lb)</Label>
                <div className="inline-row">
                  <Input type="number" value={thirdAttempt} placeholder="e.g., 485" onChange={(e: any) => setThirdAttempt(e.target.value)} />
                  <Button onClick={() => {
                    const third = Number(thirdAttempt);
                    if (!third || third <= 0) {
                      showToast("Enter a third attempt greater than 0");
                      return;
                    }
                    const estimatedOpener = Math.round(third * 0.85);
                    setOpener(estimatedOpener);
                    showToast(`Estimated opener: ${estimatedOpener} lb`);
                  }}>Calc 85%</Button>
                </div>
                <div className="muted small">Input your estimated 3rd attempt; opener = 85% of that number.</div>
              </div>
            </div>

            <div className="grid five">
              {warmups.map((s) => (
                <div key={s.id} className="warmup-set">
                  <div className="percent">{s.percent}%</div>
                  <div className="weight">{s.weight} lb</div>
                  <div className="muted small">{s.reps} reps</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === "charts" && (
        <Card>
          <div className="card-header"><h2>Everyone's PR Comparison</h2></div>
          <div className="card-body space">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Member</th><th>Squat</th><th>Bench</th><th>Deadlift</th></tr>
                </thead>
                <tbody>
                  {rows.map((m) => (
                    <tr key={m.name}>
                      <td><strong>{m.name}</strong></td>
                      <td>{m.Squat} lb</td>
                      <td>{m.Bench} lb</td>
                      <td>{m.Deadlift} lb</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="muted small">Live: your row updates when you edit your PRs. Admin-added users are read from local browser storage.</div>
          </div>
        </Card>
      )}

      {activeTab === "convert" && (
        <Card>
          <div className="card-header"><h2>Kilo ⇄ Pound Converter</h2></div>
          <div className="card-body space">
            <p className="muted">Type in either field; the other updates automatically. Rounded to 2 decimals.</p>
            <ConverterWidget />
          </div>
        </Card>
      )}
    </div>
  );
}

function AdminDash({ onLogout }: { onLogout: () => void }) {
  const [filterLift, setFilterLift] = useState("All");
  const [range, setRange] = useState("90d");
  const [users, setUsers] = useState<TeamUser[]>(getTeamUsers());
  const [newUser, setNewUser] = useState({ name: "", Squat: "", Bench: "", Deadlift: "" });
  const [adminToast, setAdminToast] = useState("");

  function showAdminToast(message: string, ms = 1400) {
    setAdminToast(message);
    window.setTimeout(() => setAdminToast(""), ms);
  }

  function addUser() {
    const name = newUser.name.trim();
    const squat = Number(newUser.Squat);
    const bench = Number(newUser.Bench);
    const deadlift = Number(newUser.Deadlift);

    if (!name || !squat || !bench || !deadlift || squat <= 0 || bench <= 0 || deadlift <= 0) {
      showAdminToast("Enter name and all three PRs greater than 0");
      return;
    }

    const entry = { name, Squat: Math.round(squat), Bench: Math.round(bench), Deadlift: Math.round(deadlift) };
    const updated = [...users.filter((u) => u.name !== name), entry];
    setUsers(updated);
    setTeamUsers(updated);
    setNewUser({ name: "", Squat: "", Bench: "", Deadlift: "" });
    showAdminToast(`Added/Updated ${name}`);
  }

  function removeUser(name: string) {
    const updated = users.filter((u) => u.name !== name);
    setUsers(updated);
    setTeamUsers(updated);
    showAdminToast(`Removed ${name}`);
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>⚙️ Admin Analytics</h1>
        <Button variant="outline" onClick={onLogout}>Logout</Button>
      </header>

      {adminToast && <div className="toast">{adminToast}</div>}

      <Card>
        <div className="card-header"><h2>Filters</h2></div>
        <div className="card-body grid three">
          <div>
            <Label>Lift</Label>
            <SelectBox value={filterLift} onChange={(e: any) => setFilterLift(e.target.value)}>
              <option>All</option>
              <option>Squat</option>
              <option>Bench</option>
              <option>Deadlift</option>
            </SelectBox>
          </div>
          <div>
            <Label>Date Range</Label>
            <SelectBox value={range} onChange={(e: any) => setRange(e.target.value)}>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </SelectBox>
          </div>
          <div className="muted small align-end">Selections are local; persistence is out of scope for prototype analytics.</div>
        </div>
      </Card>

      <div className="grid two">
        <Card><div className="card-header"><h2>PRs logged (by week)</h2></div><div className="card-body"><ChartPlaceholder title="PRs per week" /></div></Card>
        <Card><div className="card-header"><h2>Active members</h2></div><div className="card-body"><ChartPlaceholder title="Active members" /></div></Card>
      </div>

      <Card>
        <div className="card-header"><h2>Recent Activity</h2></div>
        <div className="card-body">
          <ul className="activity-list">
            <li>Nick updated Squat PR to 405 lb (today)</li>
            <li>Avery created account (yesterday)</li>
            <li>Coach added meet template (2d ago)</li>
          </ul>
        </div>
      </Card>

      <Card>
        <div className="card-header"><h2>Manage Users (Add / Remove)</h2></div>
        <div className="card-body space">
          <div className="grid five">
            <div>
              <Label>Name</Label>
              <Input value={newUser.name} onChange={(e: any) => setNewUser((s) => ({ ...s, name: e.target.value }))} placeholder="e.g., Alex P." />
            </div>
            <div>
              <Label>Squat (lb)</Label>
              <Input type="number" value={newUser.Squat} onChange={(e: any) => setNewUser((s) => ({ ...s, Squat: e.target.value }))} />
            </div>
            <div>
              <Label>Bench (lb)</Label>
              <Input type="number" value={newUser.Bench} onChange={(e: any) => setNewUser((s) => ({ ...s, Bench: e.target.value }))} />
            </div>
            <div>
              <Label>Deadlift (lb)</Label>
              <Input type="number" value={newUser.Deadlift} onChange={(e: any) => setNewUser((s) => ({ ...s, Deadlift: e.target.value }))} />
            </div>
            <div className="align-end"><Button className="full" onClick={addUser}>Add / Update</Button></div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Squat</th><th>Bench</th><th>Deadlift</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.name}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.Squat} lb</td>
                    <td>{u.Bench} lb</td>
                    <td>{u.Deadlift} lb</td>
                    <td><Button variant="outline" onClick={() => removeUser(u.name)}>Remove</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="muted small">Changes persist locally in this browser. Member → Charts reads from this list.</div>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<"intro" | "login" | "member" | "admin">("intro");

  useEffect(() => { runSelfTests(); }, []);

  return (
    <>
      <style>{styles}</style>
      {screen === "intro" && <Intro onStart={() => setScreen("login")} />}
      {screen === "login" && <Login onLogin={({ role }) => setScreen(role === "admin" ? "admin" : "member")} />}
      {screen === "member" && <MemberDash onLogout={() => setScreen("login")} />}
      {screen === "admin" && <AdminDash onLogout={() => setScreen("login")} />}
    </>
  );
}

const styles = `
  :root {
    --bg: #0f1117;
    --panel: #171b24;
    --panel2: #10131a;
    --border: rgba(255,255,255,.11);
    --text: #edf2f7;
    --muted: #a5afbd;
    --accent: #5b8cff;
    --accent2: #7ca4ff;
    --danger: #ff6b6b;
    --success: #27d17f;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .page { max-width: 1120px; margin: 0 auto; padding: 28px; display: grid; gap: 20px; }
  .center-screen { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
  .intro-card { width: min(620px, 100%); }
  .login-card { width: min(460px, 100%); }
  .topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  h1, h2, h3 { margin: 0; line-height: 1.2; }
  h1 { font-size: 26px; }
  h2 { font-size: 18px; }
  h3 { font-size: 16px; }
  .card { background: var(--panel); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 14px 40px rgba(0,0,0,.22); overflow: hidden; }
  .mini-card { border-style: dashed; }
  .card-header { padding: 18px 20px; border-bottom: 1px solid var(--border); }
  .card-body { padding: 20px; }
  .space { display: grid; gap: 14px; }
  .grid { display: grid; gap: 14px; }
  .two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .five { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .span-two { grid-column: span 2; }
  .label { display: block; color: var(--muted); font-size: 13px; margin-bottom: 6px; }
  .input { width: 100%; background: var(--panel2); color: var(--text); border: 1px solid var(--border); border-radius: 12px; padding: 11px 12px; font-size: 14px; outline: none; }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(91,140,255,.14); }
  .btn { background: var(--accent); color: white; border: 1px solid transparent; border-radius: 12px; padding: 11px 14px; font-size: 14px; font-weight: 700; cursor: pointer; transition: transform .08s ease, opacity .08s ease; }
  .btn:hover { opacity: .93; }
  .btn:active { transform: translateY(1px); }
  .btn-outline { background: transparent; border-color: var(--border); color: var(--text); }
  .full { width: 100%; }
  .muted { color: var(--muted); }
  .small { font-size: 12px; }
  .error { color: var(--danger); font-size: 13px; }
  .success { color: var(--success); font-size: 13px; }
  .tabs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
  .tab { background: var(--panel); color: var(--muted); border: 1px solid var(--border); border-radius: 14px; padding: 12px 10px; cursor: pointer; font-weight: 700; }
  .tab.active { color: var(--text); border-color: var(--accent); box-shadow: inset 0 0 0 1px rgba(91,140,255,.4); }
  .toast { position: fixed; right: 22px; bottom: 22px; z-index: 50; background: #05070b; color: var(--text); border: 1px solid var(--border); border-radius: 14px; padding: 13px 16px; box-shadow: 0 18px 60px rgba(0,0,0,.5); font-size: 14px; }
  .big-number { font-size: 30px; font-weight: 900; margin: 8px 0 2px; }
  .inline-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; }
  .warmup-set { background: var(--panel2); border: 1px solid var(--border); border-radius: 16px; padding: 14px; }
  .warmup-set .percent { font-size: 13px; font-weight: 800; color: var(--accent2); }
  .warmup-set .weight { font-size: 22px; font-weight: 900; margin: 6px 0 2px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid var(--border); font-size: 14px; }
  th { color: var(--muted); font-weight: 800; }
  .chart-placeholder { min-height: 170px; background: var(--panel2); border: 1px dashed var(--border); border-radius: 16px; display: grid; place-items: center; text-align: center; color: var(--muted); padding: 20px; }
  .chart-icon { font-size: 30px; margin-bottom: 8px; }
  .activity-list { margin: 0; padding-left: 20px; line-height: 1.9; color: var(--muted); }
  .align-end { align-self: end; }
  @media (max-width: 900px) {
    .two, .three, .four, .five, .tabs { grid-template-columns: 1fr; }
    .span-two { grid-column: auto; }
    .topbar { flex-direction: column; align-items: flex-start; }
    .inline-row { grid-template-columns: 1fr; }
  }
`;
