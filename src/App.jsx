import { useState } from "react";
import { dailyTasks } from "./data/tasks";
import "./App.css";

const API_URL =
  "https://100-days-challenge-production.up.railway.app";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("Dashboard");

  const [name, setName] = useState("kusumanjali");

  // Login / Register mode
  const [isRegistering, setIsRegistering] = useState(false);

  // Username
  const [username, setUsername] = useState(
    localStorage.getItem("grow100_username") || ""
  );

  // Password
  const [password, setPassword] = useState("");

  // Remember username
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("grow100_remember") === "true"
  );

  // Login / Register messages
  const [loginError, setLoginError] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  // Current challenge day
  const [currentDay, setCurrentDay] = useState(1);

  // Existing local progress
  const [completed, setCompleted] = useState(() => {
    return JSON.parse(localStorage.getItem("grow100")) || {};
  });

  const getTaskKey = (day, task) => {
    return `day${day}_${task}`;
  };

  // =====================================================
  // LOCAL PROGRESS
  // =====================================================

  const toggleTask = async (taskKey) => {
    const updated = {
      ...completed,
      [taskKey]: !completed[taskKey],
    };

    setCompleted(updated);

    localStorage.setItem(
      "grow100",
      JSON.stringify(updated)
    );

    // Save progress to MySQL if logged in
    if (loggedIn && name) {
      try {
        await fetch(`${API_URL}/api/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: name,
            taskKey: taskKey,
            completed: updated[taskKey],
          }),
        });
      } catch (error) {
        console.error(
          "Progress save error:",
          error
        );
      }
    }
  };

  const getDayTasks = (day) => {
    return [
      getTaskKey(day, "coding"),
      getTaskKey(day, "aptitude"),

      ...dailyTasks.selfImprovement.map(
        (_, index) =>
          getTaskKey(day, `self_${index}`)
      ),

      ...dailyTasks.selfCare.map(
        (_, index) =>
          getTaskKey(day, `care_${index}`)
      ),
    ];
  };

  const todayTasks = getDayTasks(currentDay);

  const todayCount = todayTasks.filter(
    (task) => completed[task]
  ).length;

  // =====================================================
  // LOAD PROGRESS FROM MYSQL
  // =====================================================

  const loadUserProgress = async (username) => {
    try {
      const response = await fetch(
        `${API_URL}/api/progress/${encodeURIComponent(
          username
        )}`
      );

      const data = await response.json();

      if (response.ok && data.progress) {
        setCompleted(data.progress);

        localStorage.setItem(
          "grow100",
          JSON.stringify(data.progress)
        );
      }
    } catch (error) {
      console.error(
        "Progress loading error:",
        error
      );
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async () => {
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
        `${API_URL}/api/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: cleanUsername,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoginError(
          data.error ||
            "Invalid username or password."
        );
        return;
      }

      // Remember username
      if (rememberMe) {
        localStorage.setItem(
          "grow100_username",
          cleanUsername
        );

        localStorage.setItem(
          "grow100_remember",
          "true"
        );
      } else {
        localStorage.removeItem(
          "grow100_username"
        );

        localStorage.removeItem(
          "grow100_remember"
        );
      }

      setName(data.username);
      setLoggedIn(true);
      setPassword("");

      // Load this user's progress
      await loadUserProgress(data.username);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setLoginError(
        "Cannot connect to the server. Please try again."
      );
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async () => {
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
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoginError(
          data.error ||
            "Registration failed."
        );
        return;
      }

      setRegisterMessage(
        "Account created successfully! You can login now."
      );

      setUsername(cleanUsername);
      setPassword("");

      // Switch back to login
      setTimeout(() => {
        setIsRegistering(false);
        setRegisterMessage("");
        setLoginError("");
      }, 1500);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setLoginError(
        "Cannot connect to the server. Please try again."
      );
    }
  };

  // =====================================================
  // RESET PROGRESS
  // =====================================================

  const resetProgress = async () => {
    const confirmReset =
      window.confirm(
        "Are you sure you want to delete all your progress?"
      );

    if (confirmReset) {
      try {
        await fetch(
          `${API_URL}/api/progress/${encodeURIComponent(
            name
          )}`,
          {
            method: "DELETE",
          }
        );
      } catch (error) {
        console.error(
          "Reset progress error:",
          error
        );
      }

      localStorage.removeItem("grow100");

      setCompleted({});

      setCurrentDay(1);
    }
  };

  // =====================================================
  // LOGIN / REGISTER PAGE
  // =====================================================

  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-decoration decoration-one"></div>

        <div className="login-decoration decoration-two"></div>

        <div className="login-decoration decoration-three"></div>

        <div className="login-left">

          <div className="brand-logo">
            ✓ Grow100
          </div>

          <h1>
            100 Day
            <br />
            Challenge 🚀
          </h1>

          <p className="subtitle">
            YOUR JOURNEY STARTS HERE
          </p>

          <p className="login-description">
            Build better habits, improve your skills
            and become a better version of yourself
            one day at a time.
          </p>

          <div className="numbers">

            <div>
              <b>100</b>
              <span>Days</span>
            </div>

            <div>
              <b>4</b>
              <span>Challenges</span>
            </div>

            <div>
              <b>1</b>
              <span>Goal</span>
            </div>

          </div>

          <p className="quote">
            “You don't need to be perfect.
            You just need to be consistent.”
          </p>

        </div>

        <div className="login-card">

          <div className="login-icon">
            {isRegistering ? "✨" : "🚀"}
          </div>

          <h2>
            {isRegistering
              ? "CREATE ACCOUNT ✨"
              : "WELCOME BACK 👋"}
          </h2>

          <p className="login-subtitle">
            {isRegistering
              ? "Start your Grow100 journey today."
              : "Start your 100-day transformation."}
          </p>

          {/* ERROR MESSAGE */}

          {loginError && (
            <div className="login-error">
              ❌ {loginError}
            </div>
          )}

          {/* SUCCESS MESSAGE */}

          {registerMessage && (
            <div className="login-success">
              ✅ {registerMessage}
            </div>
          )}

          {/* USERNAME */}

          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            autoComplete="username"
            onChange={(e) => {
              setUsername(e.target.value);
              setLoginError("");
              setRegisterMessage("");
            }}
          />

          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Minimum 8 characters"
            autoComplete={
              isRegistering
                ? "new-password"
                : "current-password"
            }
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLoginError("");
              setRegisterMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (isRegistering) {
                  handleRegister();
                } else {
                  handleLogin();
                }
              }
            }}
          />

          {/* REMEMBER ME - LOGIN ONLY */}

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

                <span>
                  Remember me
                </span>

              </label>

            </div>
          )}

          {/* MAIN BUTTON */}

          <button
            className="login-button"
            onClick={
              isRegistering
                ? handleRegister
                : handleLogin
            }
          >
            {isRegistering
              ? "Create My Account ✨"
              : "Start My Journey 🚀"}
          </button>

          {/* SWITCH LOGIN / REGISTER */}

          <div
            style={{
              textAlign: "center",
              marginTop: "18px",
            }}
          >

            {isRegistering ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setLoginError("");
                    setRegisterMessage("");
                    setPassword("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#7c3aed",
                    fontWeight: "700",
                    cursor: "pointer",
                    padding: "0",
                    fontSize: "inherit",
                  }}
                >
                  Login
                </button>
              </p>
            ) : (
              <p>
                New to Grow100?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setLoginError("");
                    setRegisterMessage("");
                    setPassword("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#7c3aed",
                    fontWeight: "700",
                    cursor: "pointer",
                    padding: "0",
                    fontSize: "inherit",
                  }}
                >
                  Create Account
                </button>
              </p>
            )}

          </div>

          <p className="bottom-text">
            🔒 Your journey starts with one small step.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN APPLICATION
  // =====================================================

  return (
    <div className="app">

      <aside>

        <div className="sidebar-logo">
          ✓ Grow100
        </div>

        <p className="sidebar-subtitle">
          100 DAY CHALLENGE
        </p>

        {[
          ["🏠", "Dashboard"],
          ["📅", "100-Day Calendar"],
          ["💻", "Coding"],
          ["🧠", "Aptitude"],
          ["🌱", "Self-Improvement"],
          ["🧴", "Self-Care"],
          ["📊", "Progress"],
          ["🏆", "Achievements"],
          ["⚙️", "Settings"],
        ].map(([icon, item]) => (
          <button
            key={item}
            className={
              page === item
                ? "active"
                : ""
            }
            onClick={() =>
              setPage(item)
            }
          >
            <span>{icon}</span>
            {item}
          </button>
        ))}

        <div className="side-bottom">
          Small steps every day.
          <br />
          Keep growing. 🌱
        </div>

      </aside>

      <main
        className={`page-main page-${page
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`}
      >

        <header>

          <div>

            <p className="header-small">
              100 DAY CHALLENGE
            </p>

            <h1>
              {page}
            </h1>

          </div>

          <div className="user-welcome">
            Welcome, {name} 👋
          </div>

        </header>

        {page === "Dashboard" && (
          <Dashboard
            name={name}
            day={currentDay}
            count={todayCount}
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "100-Day Calendar" && (
          <Calendar
            completed={completed}
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
          />
        )}

        {page === "Coding" && (
          <TaskPage
            title="💻 Coding"
            task="coding"
            day={currentDay}
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "Aptitude" && (
          <TaskPage
            title="🧠 Aptitude"
            task="aptitude"
            day={currentDay}
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "Self-Improvement" && (
          <MultipleTasks
            title="🌱 Self-Improvement"
            tasks={dailyTasks.selfImprovement}
            type="self"
            day={currentDay}
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "Self-Care" && (
          <MultipleTasks
            title="🧴 Self-Care"
            tasks={dailyTasks.selfCare}
            type="care"
            day={currentDay}
            completed={completed}
            toggleTask={toggleTask}
          />
        )}

        {page === "Progress" && (
          <Progress
            completed={completed}
            currentDay={currentDay}
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
            setName={setName}
            logout={() => {
              setLoggedIn(false);
              setPassword("");
              setPage("Dashboard");
            }}
            resetProgress={resetProgress}
          />
        )}

      </main>

    </div>
  );
}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard({
  name,
  day,
  count,
  completed,
  toggleTask,
}) {
  const taskKey = (task) =>
    `day${day}_${task}`;

  return (
    <>

      <section className="welcome">

        <div>

          <p className="welcome-label">
            DAY {day} OF 100
          </p>

          <h2>
            Keep going, {name}! ✨
          </h2>

          <p>
            Small steps every day lead to big results.
          </p>

        </div>

        <div className="welcome-icon">
          🌱
        </div>

      </section>

      <div className="stats">

        <div>
          <b>
            DAY {day}
          </b>

          <span>
            Current Day
          </span>
        </div>

        <div>
          <b>
            {count}/11
          </b>

          <span>
            Today's Tasks
          </span>
        </div>

        <div>
          <b>
            {Math.round(
              (count / 11) * 100
            )}%
          </b>

          <span>
            Today Progress
          </span>
        </div>

      </div>

      <h2 className="section-title">
        Today's Mission 🎯
      </h2>

      <div className="task-grid">

        <CheckTask
          text="💻 Coding Practice"
          checked={
            completed[
              taskKey("coding")
            ]
          }
          onClick={() =>
            toggleTask(
              taskKey("coding")
            )
          }
        />

        <CheckTask
          text="🧠 Aptitude Practice"
          checked={
            completed[
              taskKey("aptitude")
            ]
          }
          onClick={() =>
            toggleTask(
              taskKey("aptitude")
            )
          }
        />

        {dailyTasks.selfImprovement.map(
          (task, index) => {

            const key =
              taskKey(
                `self_${index}`
              );

            return (
              <CheckTask
                key={task}
                text={task}
                checked={
                  completed[key]
                }
                onClick={() =>
                  toggleTask(key)
                }
              />
            );
          }
        )}

        {dailyTasks.selfCare.map(
          (task, index) => {

            const key =
              taskKey(
                `care_${index}`
              );

            return (
              <CheckTask
                key={task}
                text={task}
                checked={
                  completed[key]
                }
                onClick={() =>
                  toggleTask(key)
                }
              />
            );
          }
        )}

      </div>

    </>
  );
}


// =====================================================
// CHECK TASK
// =====================================================

function CheckTask({
  text,
  checked,
  onClick,
}) {
  return (
    <div
      className={`task ${
        checked ? "done" : ""
      }`}
      onClick={onClick}
    >

      <span className="task-check">
        {checked ? "✓" : "○"}
      </span>

      <span>
        {text}
      </span>

    </div>
  );
}


// =====================================================
// CODING / APTITUDE
// =====================================================

function TaskPage({
  title,
  task,
  day,
  completed,
  toggleTask,
}) {
  const key =
    `day${day}_${task}`;

  return (
    <div className="page-card">

      <div className="page-icon">
        {task === "coding"
          ? "💻"
          : "🧠"}
      </div>

      <h2>
        {title}
      </h2>

      <p className="day-label">
        DAY {day}
      </p>

      <div
        className={`big-task ${
          completed[key]
            ? "done"
            : ""
        }`}
        onClick={() =>
          toggleTask(key)
        }
      >
        {completed[key]
          ? "✅ Completed Today"
          : "⬜ Mark as Completed"}
      </div>

      <h3>
        Today's Status
      </h3>

      <p>
        {completed[key]
          ? "Great job! You completed today's task 🎉"
          : "Not completed yet. You can do it! 💪"}
      </p>

      <div className="question">
        💡 What small action can you take today
        to become better?
      </div>

    </div>
  );
}


// =====================================================
// MULTIPLE TASKS
// =====================================================

function MultipleTasks({
  title,
  tasks,
  type,
  day,
  completed,
  toggleTask,
}) {
  const count =
    tasks.filter(
      (_, index) =>
        completed[
          `day${day}_${type}_${index}`
        ]
    ).length;

  return (
    <div className="page-card">

      <div className="page-icon">
        {type === "self"
          ? "🌱"
          : "🧴"}
      </div>

      <h2>
        {title}
      </h2>

      <p className="day-label">
        Day {day} • {count}/{tasks.length} completed
      </p>

      <div className="multiple-task-list">

        {tasks.map(
          (task, index) => {

            const key =
              `day${day}_${type}_${index}`;

            return (
              <CheckTask
                key={task}
                text={task}
                checked={
                  completed[key]
                }
                onClick={() =>
                  toggleTask(key)
                }
              />
            );
          }
        )}

      </div>

      <div className="question">
        🌟 What is one thing you can improve today?
      </div>

    </div>
  );
}


// =====================================================
// CALENDAR
// =====================================================

function Calendar({
  completed,
  currentDay,
  setCurrentDay,
}) {
  const getDayTasks = (day) => {
    return [
      `day${day}_coding`,
      `day${day}_aptitude`,

      ...dailyTasks.selfImprovement.map(
        (_, index) =>
          `day${day}_self_${index}`
      ),

      ...dailyTasks.selfCare.map(
        (_, index) =>
          `day${day}_care_${index}`
      ),
    ];
  };

  const getDayProgress = (day) => {
    const tasks =
      getDayTasks(day);

    return tasks.filter(
      (task) =>
        completed[task]
    ).length;
  };

  const selectedProgress =
    getDayProgress(currentDay);

  return (
    <div className="page-card">

      <div className="page-icon">
        📅
      </div>

      <h2>
        100-Day Calendar
      </h2>

      <p>
        Track your journey from Day 1 to Day 100.
      </p>

      <div className="calendar">

        {Array.from(
          { length: 100 },
          (_, index) => {

            const day =
              index + 1;

            const progress =
              getDayProgress(day);

            let className =
              "calendar-day";

            if (progress === 11) {
              className += " complete";
            } else if (progress > 0) {
              className += " partial";
            }

            if (currentDay === day) {
              className += " selected";
            }

            return (
              <div
                key={day}
                className={className}
                onClick={() =>
                  setCurrentDay(day)
                }
              >
                {day}
              </div>
            );
          }
        )}

      </div>

      <div className="day-details">

        <h2>
          Day {currentDay}
        </h2>

        <p>
          Progress:
          <strong>
            {" "}
            {selectedProgress}/11
          </strong>
        </p>

        <div className="calendar-tasks">

          <div>
            💻 Coding

            <span>
              {completed[
                `day${currentDay}_coding`
              ]
                ? "✅"
                : "⬜"}
            </span>

          </div>

          <div>
            🧠 Aptitude

            <span>
              {completed[
                `day${currentDay}_aptitude`
              ]
                ? "✅"
                : "⬜"}
            </span>

          </div>

          {dailyTasks.selfImprovement.map(
            (task, index) => (

              <div key={task}>

                {task}

                <span>
                  {completed[
                    `day${currentDay}_self_${index}`
                  ]
                    ? "✅"
                    : "⬜"}
                </span>

              </div>

            )
          )}

          {dailyTasks.selfCare.map(
            (task, index) => (

              <div key={task}>

                {task}

                <span>
                  {completed[
                    `day${currentDay}_care_${index}`
                  ]
                    ? "✅"
                    : "⬜"}
                </span>

              </div>

            )
          )}

        </div>

        <div className="question">
          🌟 What can you do today that your
          future self will thank you for?
        </div>

      </div>

    </div>
  );
}


// =====================================================
// PROGRESS
// =====================================================

function Progress({
  completed,
  currentDay,
}) {
  const getDayProgress = (day) => {

    const tasks = [
      `day${day}_coding`,
      `day${day}_aptitude`,

      ...dailyTasks.selfImprovement.map(
        (_, index) =>
          `day${day}_self_${index}`
      ),

      ...dailyTasks.selfCare.map(
        (_, index) =>
          `day${day}_care_${index}`
      ),
    ];

    return tasks.filter(
      (task) =>
        completed[task]
    ).length;
  };

  const completedDays =
    Array.from(
      { length: 100 },
      (_, index) => index + 1
    ).filter(
      (day) =>
        getDayProgress(day) === 11
    ).length;

  const todayProgress =
    getDayProgress(currentDay);

  const codingDays =
    Array.from(
      { length: 100 },
      (_, index) => index + 1
    ).filter(
      (day) =>
        completed[
          `day${day}_coding`
        ]
    ).length;

  const aptitudeDays =
    Array.from(
      { length: 100 },
      (_, index) => index + 1
    ).filter(
      (day) =>
        completed[
          `day${day}_aptitude`
        ]
    ).length;

  let currentStreak = 0;

  for (
    let day = currentDay;
    day >= 1;
    day--
  ) {

    if (
      getDayProgress(day) === 11
    ) {
      currentStreak++;
    } else {
      break;
    }
  }

  const overallPercentage =
    completedDays;

  return (
    <div className="page-card">

      <div className="page-icon">
        📊
      </div>

      <h2>
        See how far you have come.
      </h2>

      <div className="progress-box">

        <h1>
          {overallPercentage}%
        </h1>

        <p>
          Overall challenge progress
        </p>

        <div className="progress">

          <div
            style={{
              width:
                `${overallPercentage}%`,
            }}
          />

        </div>

      </div>

      <div className="stats">

        <div>
          <b>
            {completedDays}
          </b>

          <span>
            Completed Days
          </span>
        </div>

        <div>
          <b>
            {currentStreak}
          </b>

          <span>
            Current Streak
          </span>
        </div>

        <div>
          <b>
            {codingDays}
          </b>

          <span>
            Coding Days
          </span>
        </div>

        <div>
          <b>
            {aptitudeDays}
          </b>

          <span>
            Aptitude Days
          </span>
        </div>

        <div>
          <b>
            {todayProgress}/11
          </b>

          <span>
            Day {currentDay} Progress
          </span>
        </div>

      </div>

    </div>
  );
}


// =====================================================
// ACHIEVEMENTS
// =====================================================

function Achievements({
  completed,
}) {
  const getDayProgress = (day) => {

    const tasks = [
      `day${day}_coding`,
      `day${day}_aptitude`,

      ...dailyTasks.selfImprovement.map(
        (_, index) =>
          `day${day}_self_${index}`
      ),

      ...dailyTasks.selfCare.map(
        (_, index) =>
          `day${day}_care_${index}`
      ),
    ];

    return tasks.filter(
      (task) =>
        completed[task]
    ).length;
  };

  const completedDays =
    Array.from(
      { length: 100 },
      (_, index) => index + 1
    ).filter(
      (day) =>
        getDayProgress(day) === 11
    );

  const codingDays =
    Array.from(
      { length: 100 },
      (_, index) => index + 1
    ).filter(
      (day) =>
        completed[
          `day${day}_coding`
        ]
    ).length;

  const aptitudeDays =
    Array.from(
      { length: 100 },
      (_, index) => index + 1
    ).filter(
      (day) =>
        completed[
          `day${day}_aptitude`
        ]
    ).length;

  const selfImprovementDays =
    Array.from(
      { length: 100 },
      (_, index) => index + 1
    ).filter(
      (day) =>
        dailyTasks.selfImprovement.every(
          (_, index) =>
            completed[
              `day${day}_self_${index}`
            ]
        )
    ).length;

  const selfCareDays =
    Array.from(
      { length: 100 },
      (_, index) => index + 1
    ).filter(
      (day) =>
        dailyTasks.selfCare.every(
          (_, index) =>
            completed[
              `day${day}_care_${index}`
            ]
        )
    ).length;

  let maxStreak = 0;
  let streak = 0;

  for (
    let day = 1;
    day <= 100;
    day++
  ) {

    if (
      getDayProgress(day) === 11
    ) {

      streak++;

      if (streak > maxStreak) {
        maxStreak = streak;
      }

    } else {
      streak = 0;
    }
  }

  const achievements = [
    [
      "💻",
      "First Coding Day",
      codingDays >= 1,
    ],

    [
      "🧠",
      "First Aptitude Day",
      aptitudeDays >= 1,
    ],

    [
      "🌱",
      "10 Habit Days",
      selfImprovementDays >= 10,
    ],

    [
      "🧴",
      "10 Self-Care Days",
      selfCareDays >= 10,
    ],

    [
      "🔥",
      "3-Day Streak",
      maxStreak >= 3,
    ],

    [
      "🔥",
      "7-Day Streak",
      maxStreak >= 7,
    ],

    [
      "🏆",
      "50 Days",
      completedDays.length >= 50,
    ],

    [
      "👑",
      "100 Days",
      completedDays.length >= 100,
    ],
  ];

  return (
    <div className="page-card">

      <div className="page-icon">
        🏆
      </div>

      <h2>
        Achievements
      </h2>

      <div className="achievement-grid">

        {achievements.map(
          ([icon, title, unlocked]) => (

            <div
              key={title}
              className={`achievement ${
                unlocked
                  ? "unlocked"
                  : ""
              }`}
            >

              <span>
                {unlocked
                  ? icon
                  : "🔒"}
              </span>

              <h3>
                {title}
              </h3>

              <p>
                {unlocked
                  ? "Unlocked! 🎉"
                  : "Keep going!"}
              </p>

            </div>

          )
        )}

      </div>

    </div>
  );
}


// =====================================================
// SETTINGS
// =====================================================

function Settings({
  name,
  setName,
  logout,
  resetProgress,
}) {
  const [saved, setSaved] =
    useState(false);

  const saveChanges = () => {

    setSaved(true);

    setTimeout(
      () => setSaved(false),
      2000
    );
  };

  const exportProgress = () => {

    const data =
      localStorage.getItem("grow100");

    const blob =
      new Blob(
        [data || "{}"],
        {
          type: "application/json",
        }
      );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "grow100-progress.json";

    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-card">

      <div className="page-icon">
        ⚙️
      </div>

      <h2>
        Settings
      </h2>

      <label>
        Name
      </label>

      <input
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <p>
        Challenge start date:
        <strong>
          {" "}01-10-2026
        </strong>
      </p>

      <p>
        Your progress is stored in
        your Grow100 account.
      </p>

      <button
        className="save"
        onClick={saveChanges}
      >
        Save Changes
      </button>

      {saved && (
        <p className="success">
          ✅ Changes saved!
        </p>
      )}

      <button
        className="save"
        onClick={exportProgress}
      >
        📥 Export Progress
      </button>

      <button
        className="logout"
        onClick={resetProgress}
      >
        🗑️ Reset Everything
      </button>

      <button
        className="logout"
        onClick={logout}
      >
        Logout
      </button>

    </div>
  );
}

export default App;