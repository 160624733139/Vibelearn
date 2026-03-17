import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize SQLite Database
  const db = new Database("skillpath.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT,
      password TEXT
    );
    CREATE TABLE IF NOT EXISTS user_data (
      userId INTEGER PRIMARY KEY,
      skills TEXT,
      interests TEXT,
      suggestions TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS user_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      title TEXT,
      domain TEXT,
      progress INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      modules TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      badgeName TEXT,
      dateEarned TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  // Ensure email column exists for existing databases
  try {
    db.exec("ALTER TABLE users ADD COLUMN email TEXT");
  } catch (e) {
    // Column might already exist
  }

  // Auth Routes
  app.post("/api/signup", (req, res) => {
    const { username, email, password } = req.body;
    
    try {
      const info = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)").run(username, email, password);
      const userId = info.lastInsertRowid;
      
      // Return same structure as login for immediate sign-in
      res.json({ 
        success: true, 
        user: { id: userId, username, email },
        data: { skills: "", interests: "", suggestions: "[]" },
        courses: [],
        badges: []
      });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        // If user already exists, check if password matches to log them in
        const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
        if (user) {
          const userData = db.prepare("SELECT * FROM user_data WHERE userId = ?").get(user.id) as any;
          const userCourses = db.prepare("SELECT * FROM user_courses WHERE userId = ?").all(user.id);
          const userBadges = db.prepare("SELECT * FROM user_badges WHERE userId = ?").all(user.id);
          
          return res.json({ 
            success: true, 
            user: { id: user.id, username: user.username, email: user.email },
            data: userData || { skills: "", interests: "", suggestions: "[]" },
            courses: userCourses.map((c: any) => ({ ...c, modules: JSON.parse(c.modules) })),
            badges: userBadges,
            alreadyExisted: true
          });
        } else {
          return res.status(409).json({ error: "User already exists with a different password." });
        }
      }
      res.status(500).json({ error: "Failed to create account." });
    }
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;

    if (user) {
      const userData = db.prepare("SELECT * FROM user_data WHERE userId = ?").get(user.id) as any;
      const userCourses = db.prepare("SELECT * FROM user_courses WHERE userId = ?").all(user.id);
      const userBadges = db.prepare("SELECT * FROM user_badges WHERE userId = ?").all(user.id);
      
      res.json({ 
        success: true, 
        user: { id: user.id, username: user.username, email: user.email },
        data: userData || { skills: "", interests: "", suggestions: "[]" },
        courses: userCourses.map((c: any) => ({ ...c, modules: JSON.parse(c.modules) })),
        badges: userBadges
      });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  });
  // Debug route to see all users
app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
});


  app.post("/api/user-data", (req, res) => {
    const { userId, skills, interests, suggestions } = req.body;
    db.prepare(`
      INSERT INTO user_data (userId, skills, interests, suggestions) 
      VALUES (?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET 
        skills=excluded.skills, 
        interests=excluded.interests,
        suggestions=excluded.suggestions
    `).run(userId, skills, interests, JSON.stringify(suggestions || []));
    res.json({ success: true });
  });

  app.post("/api/change-password", (req, res) => {
    const { userId, newPassword } = req.body;
    
    const passwordExists = db.prepare("SELECT * FROM users WHERE password = ? AND id != ?").get(newPassword, userId);
    if (passwordExists) {
      return res.status(400).json({ error: "This password is already taken by another user. Please choose a unique password." });
    }

    try {
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword, userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update password." });
    }
  });

  // Course Routes
  app.post("/api/courses/add", (req, res) => {
    const { userId, title, domain, modules } = req.body;
    const info = db.prepare(`
      INSERT INTO user_courses (userId, title, domain, modules) 
      VALUES (?, ?, ?, ?)
    `).run(userId, title, domain, JSON.stringify(modules));
    res.json({ success: true, courseId: info.lastInsertRowid });
  });

  app.delete("/api/courses/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM user_courses WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/courses/update-progress", (req, res) => {
    const { courseId, progress, modules, completed } = req.body;
    db.prepare(`
      UPDATE user_courses SET progress = ?, modules = ?, completed = ? WHERE id = ?
    `).run(progress, JSON.stringify(modules), completed ? 1 : 0, courseId);
    res.json({ success: true });
  });

  app.post("/api/badges/add", (req, res) => {
    const { userId, badgeName } = req.body;
    db.prepare(`
      INSERT INTO user_badges (userId, badgeName, dateEarned) VALUES (?, ?, ?)
    `).run(userId, badgeName, new Date().toISOString());
    res.json({ success: true });
  });

  // Goal Routes
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      goalTitle TEXT,
      roadmap TEXT,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  app.post("/api/goals/add", (req, res) => {
    const { userId, goalTitle, roadmap } = req.body;
    const info = db.prepare(`
      INSERT INTO user_goals (userId, goalTitle, roadmap) 
      VALUES (?, ?, ?)
    `).run(userId, goalTitle, JSON.stringify(roadmap));
    res.json({ success: true, goalId: info.lastInsertRowid });
  });

  app.get("/api/goals/:userId", (req, res) => {
    const { userId } = req.params;
    const goals = db.prepare("SELECT * FROM user_goals WHERE userId = ?").all(userId);
    res.json(goals.map((g: any) => ({ ...g, roadmap: JSON.parse(g.roadmap) })));
  });

  app.post("/api/goals/complete", (req, res) => {
    const { goalId } = req.body;
    db.prepare("UPDATE user_goals SET completed = 1 WHERE id = ?").run(goalId);
    res.json({ success: true });
  });

  app.post("/api/goals/update-roadmap", (req, res) => {
    const { goalId, roadmap } = req.body;
    try {
      db.prepare("UPDATE user_goals SET roadmap = ? WHERE id = ?").run(JSON.stringify(roadmap), goalId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update roadmap' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.post('/api/reset-account', (req, res) => {
    const { userId } = req.body;
    try {
      db.prepare('DELETE FROM user_courses WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM user_badges WHERE userId = ?').run(userId);
      db.prepare('DELETE FROM user_goals WHERE userId = ?').run(userId);
      db.prepare('UPDATE user_data SET skills = "", interests = "", suggestions = "[]" WHERE userId = ?').run(userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to reset account' });
    }
  });

  app.delete('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM user_goals WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
