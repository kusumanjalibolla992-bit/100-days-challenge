import { useEffect, useState } from "react";
import { dailyTasks } from "./data/tasks";
import "./App.css";

const API_URL = "https://100-days-challenge-production.up.railway.app";

/* =========================================================
   RANDOM PAGE QUOTES
========================================================= */

const pageQuotes = {
  Dashboard: [
    "Small steps every day lead to big results.",
    "Consistency is the secret behind every great transformation.",
    "You don't have to be perfect. Just keep moving forward.",
    "One productive day can change the direction of your life.",
    "Your future self will thank you for what you do today.",
  ],

  "100-Day Calendar": [
    "Every day is another opportunity to become better.",
    "Trust the journey, even when progress feels slow.",
    "One day at a time. One step at a time.",
    "Your 100-day journey is built from small daily choices.",
    "Don't rush the journey. Enjoy becoming.",
  ],

  Coding: [
    "Every bug you solve makes you a better programmer.",
    "Code today. Learn today. Grow every day.",
    "Great programmers are built through practice, not perfection.",
    "Don't fear errors. They are part of learning.",
    "One problem solved today is one more skill for tomorrow.",
  ],

  Aptitude: [
    "Practice turns difficult questions into familiar ones.",
    "Think calmly. Solve patiently. Improve continuously.",
    "Every question you practice builds your confidence.",
    "Don't count the problems. Count the skills you gain.",
    "A little practice every day creates a powerful mind.",
  ],

  "Self-Improvement": [
    "Become a little better than you were yesterday.",
    "Growth begins when you decide not to stay the same.",
    "Your habits today shape the person you become tomorrow.",
    "Small improvements create extraordinary changes.",
    "Keep learning. Keep growing. Keep becoming.",
  ],

  "Self-Care": [
    "Taking care of yourself is part of becoming your best self.",
    "Rest is not laziness. It is part of the journey.",
    "Be kind to yourself while you work toward your goals.",
    "Your mind and body deserve your attention too.",
    "Self-care is not a reward. It is a necessity.",
  ],

  Progress: [
    "Don't compare your beginning with someone else's middle.",
    "Progress is progress, no matter how small.",
    "Look back and appreciate how far you've come.",
    "Slow progress is still progress.",
    "Keep going. Your consistency is creating your future.",
  ],

  Achievements: [
    "Celebrate every small victory. They all count.",
    "Success is built one achievement at a time.",
    "You earned this moment through your consistency.",
    "Be proud of your progress and excited for what's next.",
    "Today's achievement is tomorrow's motivation.",
  ],

  Settings: [
    "A fresh start can begin with a single decision.",
    "Your goals become real when you take action.",
    "Design your habits. Design your future.",
    "Every new day gives you another chance to improve.",
    "Every new day gives you another chance to improve.",
  ],
};

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("Dashboard");

  const [name, setName] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  const [loginError, setLoginError] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const [currentDay, setCurrentDay] = useState(1);

  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("grow100Completed")) || {};
    } catch {
      return {};
    }
  });

  const [pageQuote, setPageQuote] = useState("");

  /* =========================================================
     CHANGE RANDOM QUOTE WHEN PAGE CHANGES
  ========================================================= */

  useEffect(() => {
    const quotes = pageQuotes[page] || [
      "Keep going. You are doing great!",
    ];

    const randomIndex = Math.floor(Math.random() * quotes.length);

    setPageQuote(quotes[randomIndex]);
  }, [page]);

  /* =========================================================
     CHECK REMEMBERED USER
  ========================================================= */

  useEffect(() => {
    const savedUsername = localStorage.getItem(
      "grow100RememberedUsername"
    );

    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  /* =========================================================
     SAVE PROGRESS LOCALLY
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "grow100Completed",
      JSON.stringify(completed)
    );
  }, [completed]);

  /* =========================================================
     LOAD USER PROGRESS FROM BACKEND
  ========================================================= */

  const loadUserProgress = async (user) => {
    try {
      const response = await fetch(
        `${API_URL}/api/progress/${encodeURIComponent(user)}`
      );

      const data = await response.json();

      if (response.ok && data.progress) {
        setCompleted(data.progress);

        localStorage.setItem(
          "grow100Completed",
          JSON.stringify(data.progress)
        );
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");
    setRegisterMessage("");

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      setLoginError(
        "Username must contain at least 3 characters."
      );
      return;
    }

    if (password.length < 8) {
      setLoginError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(
          data.error || "Invalid username or password."
        );
        return;
      }

      setName(data.username);
      setUsername(data.username);
      setLoggedIn(true);
      setPage("Dashboard");

      if (rememberMe) {
        localStorage.setItem(
          "grow100RememberedUsername",
          data.username
        );
      } else {
        localStorage.removeItem(
          "grow100RememberedUsername"
        );
      }

      await loadUserProgress(data.username);
    } catch (error) {
      console.error(error);

      setLoginError(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  /* =========================================================
     REGISTER
  ========================================================= */

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoginError("");
    setRegisterMessage("");

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      setLoginError(
        "Username must contain at least 3 characters."
      );
      return;
    }

    if (password.length < 8) {
      setLoginError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: cleanUsername,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoginError(
          data.error || "Registration failed."
        );
        return;
      }

      setRegisterMessage(
        "Registration successful! You can now login."
      );

      setPassword("");

      setTimeout(() => {
        setIsRegistering(false);
        setRegisterMessage("");
      }, 1500);
    } catch (error) {
      console.error(error);

      setLoginError(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    setLoggedIn(false);
    setName("");
    setPassword("");
    setPage("Dashboard");
  };

  /* =========================================================
     TOGGLE TASK
  ========================================================= */

  const toggleTask = async (taskKey) => {
    const newValue = !completed[taskKey];

    setCompleted((previous) => ({
      ...previous,
      [taskKey]: newValue,
    }));

    if (!loggedIn || !name) {
      return;
    }

    try {
      await fetch(`${API_URL}/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          taskKey,
          completed: newValue,
        }),
      });
    } catch (error) {
      console.error(
        "Progress save failed:",
        error
      );
    }
  };

  /* =========================================================
     RESET PROGRESS
  ========================================================= */

  const resetProgress = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all your progress?"
    );

    if (!confirmReset) {
      return;
    }

    try {
      if (name) {
        await fetch(
          `${API_URL}/api/progress/${encodeURIComponent(name)}`,
          {
            method: "DELETE",
          }
        );
      }

      setCompleted({});

      localStorage.setItem(
        "grow100Completed",
        JSON.stringify({})
      );

      alert("Your progress has been reset.");
    } catch (error) {
      console.error(error);

      alert("Could not reset progress.");
    }
  };

  /* =========================================================
     EXPORT PROGRESS
  ========================================================= */

  const exportProgress = () => {
    const data = {
      username: name,
      completedTasks: completed,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${name || "grow100"}-progress.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     LOGIN / REGISTER PAGE
  ========================================================= */

  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-decoration decoration-one"></div>
        <div className="login-decoration decoration-two"></div>
        <div className="login-decoration decoration-three"></div>

        <div className="login-left">

          <div className="brand-logo">
            <span>🌱</span>
            <h1>Grow100</h1>
          </div>

          <p className="subtitle">
            100 Days. One Better You.
          </p>

          <p className="login-description">
            Build better habits, improve your coding,
            sharpen your aptitude, take care of yourself,
            and become stronger every single day.
          </p>

          <div className="numbers">

            <div>
              <strong>100</strong>
              <span>Days</span>
            </div>

            <div>
              <strong>∞</strong>
              <span>Growth</span>
            </div>

            <div>
              <strong>1</strong>
              <span>Goal</span>
            </div>

          </div>

          <div className="quote">
            <span>“</span>

            <p>
              Small progress every day creates
              extraordinary results.
            </p>
          </div>

        </div>

        <div className="login-card">

          <div className="login-icon">
            {isRegistering ? "✨" : "🌱"}
          </div>

          <h2>
            {isRegistering
              ? "Create your Grow100 account"
              : "Welcome Back!"}
          </h2>

          <p className="login-subtitle">
            {isRegistering
              ? "Start your 100-day growth journey."
              : "Continue your 100-day journey."}
          </p>

          {loginError && (
            <div className="login-error">
              ⚠️ {loginError}
            </div>
          )}

          {registerMessage && (
            <div className="login-success">
              ✅ {registerMessage}
            </div>
          )}

          <form
            onSubmit={
              isRegistering
                ? handleRegister
                : handleLogin
            }
          >

            <label>Username</label>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              autoComplete="username"
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete={
                isRegistering
                  ? "new-password"
                  : "current-password"
              }
            />

            {!isRegistering && (
              <div className="remember-row">

                <label className="remember-label">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                  />

                  <span>Remember me</span>

                </label>

              </div>
            )}

            <button
              type="submit"
              className="login-button"
            >
              {isRegistering
                ? "Create Account 🚀"
                : "Login & Grow 🌱"}
            </button>

          </form>

          <div className="bottom-text">

            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setLoginError("");
                setRegisterMessage("");
                setPassword("");
              }}
            >
              {isRegistering
                ? "Login"
                : "Create Account"}
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     MAIN APPLICATION
  ========================================================= */

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <span>🌱</span>

          <div>
            <h2>Grow100</h2>
            <small>100 Day Challenge</small>
          </div>

        </div>

        <div className="user-box">

          <div className="user-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <small>Welcome</small>
            <strong>{name}</strong>
          </div>

        </div>

        <nav>

          <button
            className={
              page === "Dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage("Dashboard")
            }
          >
            🏠 Dashboard
          </button>

          <button
            className={
              page === "100-Day Calendar"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage("100-Day Calendar")
            }
          >
            📅 100-Day Calendar
          </button>

          <button
            className={
              page === "Coding"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage("Coding")
            }
          >
            💻 Coding
          </button>

          <button
            className={
              page === "Aptitude"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage("Aptitude")
            }
          >
            🧠 Aptitude
          </button>

          <button
            className={
              page === "Self-Improvement"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage("Self-Improvement")
            }
          >
            🌟 Self-Improvement
          </button>

          <button
            className={
              page === "Self-Care"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage("Self-Care")
            }
          >
            💜 Self-Care
          </button>

          <button
            className={
              page === "Progress"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage("Progress")
            }
          >
            📊 Progress
          </button>

          <button
            className={
              page === "Achievements"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage("Achievements")
            }
          >
            🏆 Achievements
          </button>

          <button
            className={
              page === "Settings"
                ? "active"
                : ""
            }
            onClick={() =>
              setPage("Settings")
            }
          >
            ⚙️ Settings
          </button>

        </nav>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}

      <main
        className={`page-main page-${page
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`}
      >

        <header className="top-header">

          <div>

            <h1>{page}</h1>

            <p>
              Keep growing, {name} 🌱
            </p>

          </div>

          <div className="header-user">
            <span>👋</span>
            <strong>{name}</strong>
          </div>

        </header>

        {/* RANDOM PAGE QUOTE */}

        <div className="page-quote">

          <div className="quote-mark">
            “
          </div>

          <div className="quote-content">

            <p>
              {pageQuote}
            </p>

            <span>
              ✨ Grow100 Daily Motivation
            </span>

          </div>

        </div>

        {/* PAGE CONTENT */}

        {page === "Dashboard" && (
          <Dashboard
            name={name}
            completed={completed}
            setPage={setPage}
          />
        )}

        {page === "100-Day Calendar" && (
          <Calendar
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "Coding" && (
          <TaskPage
            title="Coding"
            icon="💻"
            tasks={
              dailyTasks?.coding ||
              dailyTasks?.Coding ||
              []
            }
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "Aptitude" && (
          <TaskPage
            title="Aptitude"
            icon="🧠"
            tasks={
              dailyTasks?.aptitude ||
              dailyTasks?.Aptitude ||
              []
            }
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "Self-Improvement" && (
          <TaskPage
            title="Self-Improvement"
            icon="🌟"
            tasks={
              dailyTasks?.selfImprovement ||
              dailyTasks?.["Self-Improvement"] ||
              []
            }
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "Self-Care" && (
          <TaskPage
            title="Self-Care"
            icon="💜"
            tasks={
              dailyTasks?.selfCare ||
              dailyTasks?.["Self-Care"] ||
              []
            }
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "Progress" && (
          <Progress
            completed={completed}
          />
        )}

        {page === "Achievements" && (
          <Achievements
            completed={completed}
          />
        )}

        {page === "Settings" && (
          <Settings
            name={name}
            exportProgress={exportProgress}
            resetProgress={resetProgress}
          />
        )}

      </main>

    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  name,
  completed,
  setPage,
}) {
  const completedCount =
    Object.values(completed).filter(Boolean).length;

  const percentage = Math.min(
    100,
    Math.round(
      (completedCount / 100) * 100
    )
  );

  return (
    <div className="dashboard-content">

      <section className="hero-card">

        <div>

          <span className="hero-small">
            YOUR 100-DAY JOURNEY
          </span>

          <h2>
            Hello, {name}! 👋
          </h2>

          <p>
            Keep showing up. Every small action
            is helping you become a better version
            of yourself.
          </p>

        </div>

        <div className="hero-progress">

          <div className="progress-circle">

            <strong>
              {percentage}%
            </strong>

            <span>
              Complete
            </span>

          </div>

        </div>

      </section>

      <div className="dashboard-stats">

        <div className="stat-card">

          <span>📅</span>

          <div>
            <strong>
              {completedCount}
            </strong>

            <small>
              Tasks Completed
            </small>
          </div>

        </div>

        <div className="stat-card">

          <span>🔥</span>

          <div>
            <strong>
              {Math.min(
                completedCount,
                100
              )}
            </strong>

            <small>
              Days Progress
            </small>
          </div>

        </div>

        <div className="stat-card">

          <span>🎯</span>

          <div>
            <strong>
              {Math.max(
                0,
                100 - completedCount
              )}
            </strong>

            <small>
              Tasks Remaining
            </small>
          </div>

        </div>

      </div>

      <section className="dashboard-actions">

        <h2>
          Continue Your Journey
        </h2>

        <div className="action-grid">

          <button
            onClick={() =>
              setPage("Coding")
            }
          >
            💻
            <strong>Coding</strong>
            <span>
              Build your programming skills
            </span>
          </button>

          <button
            onClick={() =>
              setPage("Aptitude")
            }
          >
            🧠
            <strong>Aptitude</strong>
            <span>
              Sharpen your problem solving
            </span>
          </button>

          <button
            onClick={() =>
              setPage("Self-Improvement")
            }
          >
            🌟
            <strong>
              Self-Improvement
            </strong>
            <span>
              Become better every day
            </span>
          </button>

          <button
            onClick={() =>
              setPage("Self-Care")
            }
          >
            💜
            <strong>Self-Care</strong>
            <span>
              Take care of yourself
            </span>
          </button>

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   CHECK TASK
========================================================= */

function CheckTask({
  task,
  taskKey,
  completed,
  toggleTask,
}) {
  const isDone = !!completed[taskKey];

  return (
    <label
      className={`task-card ${
        isDone
          ? "task-completed"
          : ""
      }`}
    >

      <input
        type="checkbox"
        checked={isDone}
        onChange={() =>
          toggleTask(taskKey)
        }
      />

      <span className="custom-checkbox">
        {isDone ? "✓" : ""}
      </span>

      <div className="task-text">

        <strong>
          {typeof task === "string"
            ? task
            : task?.title ||
              task?.name ||
              "Task"}
        </strong>

        {task?.description && (
          <small>
            {task.description}
          </small>
        )}

      </div>

    </label>
  );
}

/* =========================================================
   TASK PAGE
========================================================= */

function TaskPage({
  title,
  icon,
  tasks,
  completed,
  toggleTask,
}) {
  const taskList = Array.isArray(tasks)
    ? tasks
    : [];

  return (
    <section className="task-page">

      <div className="section-heading">

        <div>

          <span className="section-icon">
            {icon}
          </span>

          <div>

            <h2>{title}</h2>

            <p>
              Complete your daily{" "}
              {title.toLowerCase()} tasks.
            </p>

          </div>

        </div>

      </div>

      <div className="task-list">

        {taskList.length > 0 ? (
          taskList.map(
            (task, index) => {

              const taskKey =
                typeof task === "string"
                  ? `${title}-${index}`
                  : task?.id ||
                    task?.key ||
                    `${title}-${index}`;

              return (
                <CheckTask
                  key={taskKey}
                  task={task}
                  taskKey={taskKey}
                  completed={completed}
                  toggleTask={toggleTask}
                />
              );
            }
          )
        ) : (
          <div className="empty-state">

            <span>🌱</span>

            <h3>
              Tasks coming soon
            </h3>

            <p>
              Your {title} tasks will appear here.
            </p>

          </div>
        )}

      </div>

    </section>
  );
}

/* =========================================================
   MULTIPLE TASKS
========================================================= */

function MultipleTasks({
  tasks,
  completed,
  toggleTask,
  category,
}) {
  if (!Array.isArray(tasks)) {
    return null;
  }

  return (
    <div className="task-list">

      {tasks.map(
        (task, index) => {

          const taskKey =
            task?.id ||
            task?.key ||
            `${category}-${index}`;

          return (
            <CheckTask
              key={taskKey}
              task={task}
              taskKey={taskKey}
              completed={completed}
              toggleTask={toggleTask}
            />
          );
        }
      )}

    </div>
  );
}

/* =========================================================
   CALENDAR
========================================================= */

function Calendar({
  currentDay,
  setCurrentDay,
  completed,
  toggleTask,
}) {
  const days = Array.from(
    { length: 100 },
    (_, index) => index + 1
  );

  const dayKey = `day${currentDay}`;

  return (
    <section className="calendar-page">

      <div className="calendar-header">

        <div>

          <h2>
            📅 100-Day Challenge
          </h2>

          <p>
            Choose a day and complete your challenge.
          </p>

        </div>

        <div className="current-day-box">

          <small>
            Current Day
          </small>

          <strong>
            {currentDay}
          </strong>

        </div>

      </div>

      <div className="calendar-grid">

        {days.map((day) => {

          const key = `day${day}`;

          return (
            <button
              key={day}
              className={`calendar-day ${
                currentDay === day
                  ? "selected"
                  : ""
              } ${
                completed[key]
                  ? "completed"
                  : ""
              }`}
              onClick={() =>
                setCurrentDay(day)
              }
            >

              <span>Day</span>

              <strong>
                {day}
              </strong>

              {completed[key] && (
                <small>✓</small>
              )}

            </button>
          );
        })}

      </div>

      <div className="selected-day-card">

        <h3>
          Day {currentDay} Challenge 🌱
        </h3>

        <p>
          Complete today's challenge and keep
          your 100-day streak alive.
        </p>

        <CheckTask
          task={`Complete Day ${currentDay} challenge`}
          taskKey={dayKey}
          completed={completed}
          toggleTask={toggleTask}
        />

      </div>

    </section>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function Progress({
  completed,
}) {
  const completedCount =
    Object.values(completed).filter(Boolean).length;

  const percentage = Math.min(
    100,
    Math.round(
      (completedCount / 100) * 100
    )
  );

  return (
    <section className="progress-page">

      <div className="progress-main-card">

        <div className="big-progress-circle">

          <strong>
            {percentage}%
          </strong>

          <span>
            Completed
          </span>

        </div>

        <div>

          <h2>
            Your Progress
          </h2>

          <p>
            You have completed{" "}
            <strong>
              {completedCount}
            </strong>{" "}
            tasks out of your 100-day journey.
          </p>

        </div>

      </div>

      <div className="progress-bar-container">

        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
          }}
        ></div>

      </div>

      <div className="progress-message">

        {percentage === 0 && (
          <>
            🌱 Your journey starts today.
            Take your first step!
          </>
        )}

        {percentage > 0 &&
          percentage < 25 && (
            <>
              🔥 Great start! Keep going.
            </>
          )}

        {percentage >= 25 &&
          percentage < 50 && (
            <>
              💪 You are building momentum!
            </>
          )}

        {percentage >= 50 &&
          percentage < 75 && (
            <>
              🌟 Amazing! You are halfway there.
            </>
          )}

        {percentage >= 75 &&
          percentage < 100 && (
            <>
              🏆 Incredible progress! Almost there!
            </>
          )}

        {percentage === 100 && (
          <>
            🎉 You completed your 100-day journey!
          </>
        )}

      </div>

    </section>
  );
}

/* =========================================================
   ACHIEVEMENTS
========================================================= */

function Achievements({
  completed,
}) {
  const count =
    Object.values(completed).filter(Boolean).length;

  const achievements = [
    {
      title: "First Step",
      description:
        "Complete your first task.",
      icon: "🌱",
      unlocked: count >= 1,
    },

    {
      title: "Getting Started",
      description:
        "Complete 10 tasks.",
      icon: "🔥",
      unlocked: count >= 10,
    },

    {
      title: "Quarter Way",
      description:
        "Complete 25 tasks.",
      icon: "⭐",
      unlocked: count >= 25,
    },

    {
      title: "Halfway Hero",
      description:
        "Complete 50 tasks.",
      icon: "🏆",
      unlocked: count >= 50,
    },

    {
      title: "Consistency",
      description:
        "Complete 75 tasks.",
      icon: "💪",
      unlocked: count >= 75,
    },

    {
      title: "Grow100 Champion",
      description:
        "Complete 100 tasks.",
      icon: "👑",
      unlocked: count >= 100,
    },
  ];

  return (
    <section className="achievements-page">

      <div className="achievement-header">

        <h2>
          🏆 Your Achievements
        </h2>

        <p>
          Every small win deserves to be celebrated.
        </p>

      </div>

      <div className="achievement-grid">

        {achievements.map(
          (achievement) => (

            <div
              key={achievement.title}
              className={`achievement-card ${
                achievement.unlocked
                  ? "unlocked"
                  : "locked"
              }`}
            >

              <div className="achievement-icon">
                {achievement.icon}
              </div>

              <h3>
                {achievement.title}
              </h3>

              <p>
                {achievement.description}
              </p>

              <span>
                {achievement.unlocked
                  ? "✓ Unlocked"
                  : "🔒 Locked"}
              </span>

            </div>

          )
        )}

      </div>

    </section>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function Settings({
  name,
  exportProgress,
  resetProgress,
}) {
  return (
    <section className="settings-page">

      <div className="settings-card">

        <div className="settings-icon">
          👤
        </div>

        <div>

          <small>
            Logged in as
          </small>

          <h2>
            {name}
          </h2>

          <p>
            Your Grow100 progress is connected
            to your account.
          </p>

        </div>

      </div>

      <div className="settings-actions">

        <button
          onClick={exportProgress}
          className="settings-button"
        >
          📥 Export Progress
        </button>

        <button
          onClick={resetProgress}
          className="settings-button danger"
        >
          🗑️ Reset Progress
        </button>

      </div>

      <div className="settings-info">

        <h3>
          🌱 About Grow100
        </h3>

        <p>
          Grow100 is a 100-day personal growth
          challenge designed to help you improve
          coding, aptitude, self-improvement,
          and self-care through consistent daily
          actions.
        </p>

      </div>

    </section>
  );
}

export default App;