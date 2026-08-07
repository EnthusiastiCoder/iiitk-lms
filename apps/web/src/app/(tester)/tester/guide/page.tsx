import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testing Guide | IIIT Kalyani LMS",
};

const ACCENT = "#F59E0B";

const severityColors: Record<string, string> = {
  Critical: "#EF4444",
  High: "#F97316",
  Medium: "#EAB308",
  Low: "#22C55E",
};

export default function TesterGuidePage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        Testing Guide
      </h1>
      <p style={{ color: "#9CA3AF", marginBottom: "2rem" }}>
        Everything you need to know to test the IIIT Kalyani LMS effectively.
      </p>

      <Section title="1. Getting Started">
        <p>
          You have been assigned a <strong>tester</strong> account. Log in with
          the credentials shared with you. After login, you will be redirected
          to the <strong>Bug Tracker</strong> — your home base.
        </p>
        <p style={{ marginTop: "0.75rem" }}>
          Use the sidebar to navigate between <strong>Bugs</strong> (report and
          track issues), <strong>Guide</strong> (this page), and{" "}
          <strong>Profile</strong> (your account info).
        </p>
      </Section>

      <Section title="2. What to Test">
        <p>
          You are testing the full LMS platform. Open the app in a separate
          browser or incognito window logged in as a <strong>student</strong>,{" "}
          <strong>professor</strong>, or <strong>admin</strong> using the test
          accounts provided. Then report any issues you find here.
        </p>
        <SubSection title="Student Flows">
          <CheckList
            items={[
              "Login and registration",
              "Dashboard loads with stats, courses, weekly XP",
              "Browse course catalog, search and filter",
              "Enroll in a course",
              "Open a course and navigate lessons",
              "Complete a lesson — XP awards correctly",
              "Take a quiz — timer, scoring, XP",
              "Submit an assignment or project with code + file upload",
              "View submissions page with status",
              "Achievements page shows earned/locked badges",
              "Leaderboard ranks correctly",
              "Practice page lists available quizzes",
              "Skill tree renders nodes and edges",
              "Profile page shows stats, heatmap, edit name",
            ]}
          />
        </SubSection>
        <SubSection title="Professor Flows">
          <CheckList
            items={[
              "Professor dashboard shows class stats",
              "Student roster with search",
              "Student detail page with progress",
              "Grading center — pending and graded submissions",
              "Grade a submission with score and feedback",
              "Course content management — create/edit/delete modules, lessons, quizzes, assignments, projects",
            ]}
          />
        </SubSection>
        <SubSection title="Admin Flows">
          <CheckList
            items={[
              "Admin dashboard with system stats",
              "User management — search, role change, delete",
              "Course management — create, assign instructor, delete",
              "Achievement management — create achievements",
              "Analytics page with charts",
            ]}
          />
        </SubSection>
        <SubSection title="General">
          <CheckList
            items={[
              "Dark mode toggle works everywhere",
              "Mobile responsiveness — test on phone or narrow window",
              "Loading states show spinners, not blank screens",
              "Error states show friendly messages",
              "Navigation — sidebar links, back buttons, breadcrumbs",
              "Logout works and redirects to login",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="3. How to Report a Bug">
        <ol style={{ paddingLeft: "1.25rem", lineHeight: 2 }}>
          <li>
            Go to <strong>Bugs</strong> → click{" "}
            <strong>&quot;Report Bug&quot;</strong>
          </li>
          <li>
            Write a clear <strong>title</strong> — what broke in one line
          </li>
          <li>
            In the <strong>description</strong>, include:
            <ul style={{ paddingLeft: "1.25rem", marginTop: "0.25rem" }}>
              <li>Steps to reproduce (1, 2, 3...)</li>
              <li>What you expected to happen</li>
              <li>What actually happened</li>
              <li>Which role you were testing (student/professor/admin)</li>
              <li>Browser and device info</li>
            </ul>
          </li>
          <li>
            Set the <strong>severity</strong> (see below)
          </li>
          <li>
            Attach up to <strong>3 screenshots</strong> — capture the error
          </li>
          <li>Submit</li>
        </ol>
      </Section>

      <Section title="4. Severity Levels">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.75rem",
            marginTop: "0.5rem",
          }}
        >
          {Object.entries(severityColors).map(([level, color]) => (
            <div
              key={level}
              style={{
                padding: "1rem",
                borderRadius: "0.5rem",
                border: `1px solid ${color}33`,
                backgroundColor: `${color}11`,
              }}
            >
              <div
                style={{ fontWeight: 600, color, marginBottom: "0.25rem" }}
              >
                {level}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>
                {level === "Critical" && "App crashes or data loss"}
                {level === "High" && "Feature broken, no workaround"}
                {level === "Medium" && "Feature impaired but usable"}
                {level === "Low" && "Minor UI glitch or typo"}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="5. Bug Lifecycle">
        <div style={{ lineHeight: 2, fontSize: "0.95rem" }}>
          <StatusStep color="#3B82F6" label="Open" desc="You filed it" />
          <Arrow />
          <StatusStep
            color="#EAB308"
            label="In Progress"
            desc="Developer is working on it"
          />
          <Arrow />
          <StatusStep
            color="#22C55E"
            label="Resolved"
            desc="Fix deployed — retest it"
          />
          <Arrow />
          <StatusStep
            color="#6B7280"
            label="Closed"
            desc="You verified the fix works"
          />
        </div>
        <p style={{ marginTop: "1rem", color: "#9CA3AF", fontSize: "0.9rem" }}>
          When a bug is marked <strong>Resolved</strong>, test the fix. If
          it&apos;s truly fixed, <strong>close</strong> it. If the issue
          persists, add a comment explaining what still fails and it stays open.
        </p>
      </Section>

      <Section title="6. Good Bug Report Example">
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.5rem",
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            Title: Quiz timer shows negative seconds after time expires
          </div>
          <div style={{ color: "#9CA3AF" }}>
            <strong>Steps:</strong>
            <br />
            1. Login as student (tester.student1@iiitkalyani.ac.in)
            <br />
            2. Go to Courses → Database Management → Module 1 Quiz
            <br />
            3. Start the quiz and wait for the timer to reach 0:00
            <br />
            <br />
            <strong>Expected:</strong> Quiz auto-submits when time runs out
            <br />
            <strong>Actual:</strong> Timer shows -0:03, -0:04... and quiz
            doesn&apos;t submit
            <br />
            <br />
            <strong>Severity:</strong> Medium
            <br />
            <strong>Browser:</strong> Chrome 126, Windows 11
          </div>
        </div>
      </Section>

      <Section title="7. Tips">
        <ul style={{ paddingLeft: "1.25rem", lineHeight: 2 }}>
          <li>Test in both light and dark mode</li>
          <li>Test on mobile (or narrow your browser to 375px width)</li>
          <li>Try edge cases — empty inputs, very long text, special characters</li>
          <li>Try rapid actions — double-click submit, fast page navigation</li>
          <li>Check the browser console for JavaScript errors</li>
          <li>One bug per report — don&apos;t combine multiple issues</li>
          <li>Check existing bugs before filing duplicates</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: 600,
          marginBottom: "0.75rem",
          color: ACCENT,
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{title}</h3>
      {children}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: "1.25rem", lineHeight: 2 }}>
      {items.map((item) => (
        <li key={item} style={{ listStyleType: "'☐ '" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function StatusStep({
  color,
  label,
  desc,
}: {
  color: string;
  label: string;
  desc: string;
}) {
  return (
    <span>
      <span
        style={{
          display: "inline-block",
          padding: "0.15rem 0.5rem",
          borderRadius: "0.25rem",
          backgroundColor: `${color}22`,
          color,
          fontWeight: 600,
          fontSize: "0.85rem",
        }}
      >
        {label}
      </span>{" "}
      <span style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>— {desc}</span>
    </span>
  );
}

function Arrow() {
  return (
    <span style={{ margin: "0 0.25rem", color: "#6B7280" }}> → </span>
  );
}
