const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "tristas-treats.db");
const FACEBOOK_COMMENTS_PATH = path.join(__dirname, "data", "facebook-comments.json");
const GALLERY_METADATA_PATH = path.join(__dirname, "data", "gallery-metadata.json");
const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const socialAuth = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  facebook: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET)
};

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      provider TEXT,
      provider_id TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      subject TEXT NOT NULL,
      event_date TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reviewer_name TEXT NOT NULL,
      reviewer_email TEXT,
      rating INTEGER NOT NULL,
      body TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const columns = db.prepare("PRAGMA table_info(users)").all().map((column) => column.name);
  if (!columns.includes("provider")) {
    db.exec("ALTER TABLE users ADD COLUMN provider TEXT");
  }
  if (!columns.includes("provider_id")) {
    db.exec("ALTER TABLE users ADD COLUMN provider_id TEXT");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "slender@slendystuff.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "1234";
  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')"
    ).run("Trista", adminEmail, passwordHash);
  }
}

function loadFacebookComments() {
  try {
    const raw = fs.readFileSync(FACEBOOK_COMMENTS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((comment, index) => normalizeFacebookComment(comment, index))
        .filter(Boolean);
    }

    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed).flatMap(([image, comments]) => {
        if (!Array.isArray(comments)) {
          return [];
        }

        return comments
          .map((comment, index) => normalizeFacebookComment({ ...comment, image }, index))
          .filter(Boolean);
      });
    }

    return [];
  } catch {
    return [];
  }
}

function loadGalleryMetadata() {
  try {
    return JSON.parse(fs.readFileSync(GALLERY_METADATA_PATH, "utf8"));
  } catch {
    return {};
  }
}

function getGalleryImages() {
  const imagesDir = path.join(__dirname, "images");
  const metadata = loadGalleryMetadata();
  if (!fs.existsSync(imagesDir)) {
    return [];
  }

  return fs
    .readdirSync(imagesDir)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => ({
      name: file,
      url: `/images/${encodeURIComponent(file)}`,
      detailUrl: `/gallery/${encodeURIComponent(file)}`,
      title: metadata[file]?.title ||
        file
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]/g, " ")
    }));
}

function normalizeFacebookComment(comment, index) {
  if (!comment || typeof comment !== "object" || !comment.text) {
    return null;
  }

  return {
    id: comment.id || `facebook-comment-${index}`,
    author: comment.author || "Facebook customer",
    date: comment.date || "",
    text: comment.text,
    image: comment.image || null
  };
}

function enrichGalleryWithComments(gallery, comments) {
  const commentCounts = comments.reduce((counts, comment) => {
    if (comment.image) {
      counts[comment.image] = (counts[comment.image] || 0) + 1;
    }
    return counts;
  }, {});

  return gallery.map((image) => ({
    ...image,
    commentCount: commentCounts[image.name] || 0
  }));
}

function getApprovedReviews(limit) {
  const query = limit
    ? "SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC LIMIT ?"
    : "SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC";

  return limit ? db.prepare(query).all(limit) : db.prepare(query).all();
}

function getMarketingContext() {
  const rawGallery = getGalleryImages();
  const facebookComments = loadFacebookComments();
  const gallery = enrichGalleryWithComments(rawGallery, facebookComments);
  const reviews = getApprovedReviews();
  const featuredImage = gallery.find((image) => image.name === "horror-movie-themed-cake.jpg") || gallery[0] || null;

  return {
    gallery,
    facebookComments,
    reviews,
    featuredImage,
    featuredComments: facebookComments.slice(0, 4),
    featuredGallery: gallery.slice(0, 8),
    latestReviews: reviews.slice(0, 6)
  };
}

function buildAssistantInstructions() {
  return [
    "You are Trista's Treats website assistant.",
    "Help visitors understand cake ordering, gallery browsing, flavors, sizing guidance, and how to start an order.",
    "Tone: warm, polished, concise, and slightly luxe.",
    "Do not invent pricing, booking availability, allergen promises, or delivery policy.",
    "If exact business details are unknown, say Trista will confirm them in the private order thread.",
    "Prefer short answers and point serious leads to the Order page."
  ].join(" ");
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const textParts = [];

  output.forEach((item) => {
    if (item?.type !== "message" || !Array.isArray(item.content)) {
      return;
    }

    item.content.forEach((contentItem) => {
      if (contentItem?.type === "output_text" && contentItem.text) {
        textParts.push(contentItem.text);
      }
    });
  });

  return textParts.join("\n\n").trim();
}

async function createAssistantReply({ message, previousResponseId }) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      ok: false,
      status: 503,
      error: "Assistant is not configured yet. Add OPENAI_API_KEY to enable it."
    };
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      reasoning: { effort: "low" },
      instructions: buildAssistantInstructions(),
      previous_response_id: previousResponseId || undefined,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text: [
                "Current public pages: Home, Gallery, About, Reviews, and Order.",
                "Customers can create an account to start a private order or question thread.",
                "The gallery includes custom cakes, cupcakes, dessert tables, elegant work, character work, and spooky-themed cakes.",
                "Public reviews are visible on-site and Facebook photo comments can appear on gallery detail pages.",
                "When details are not provided, direct the visitor to the Order page for confirmation."
              ].join(" ")
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: message
            }
          ]
        }
      ]
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: payload?.error?.message || "Assistant request failed."
    };
  }

  return {
    ok: true,
    text: extractResponseText(payload),
    responseId: payload.id || null
  };
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  next();
}

function getUserSessionRecord(id) {
  return db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(id);
}

function findOrCreateSocialUser({ provider, providerId, name, email }) {
  let user = db
    .prepare("SELECT id, name, email, role FROM users WHERE provider = ? AND provider_id = ?")
    .get(provider, providerId);
  if (user) {
    return user;
  }

  if (email) {
    user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (user) {
      db.prepare("UPDATE users SET provider = ?, provider_id = ? WHERE id = ?").run(provider, providerId, user.id);
      return getUserSessionRecord(user.id);
    }
  }

  const safeEmail = email || `${provider}-${providerId}@local.social`;
  const passwordHash = bcrypt.hashSync(`${provider}-${providerId}-${Date.now()}`, 10);
  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, provider, provider_id) VALUES (?, ?, ?, ?, ?)"
    )
    .run(name || "Customer", safeEmail, passwordHash, provider, providerId);

  return getUserSessionRecord(result.lastInsertRowid);
}

function hydrateConversation(conversationId) {
  const conversation = db
    .prepare(
      `SELECT conversations.*, users.name AS customer_name, users.email AS customer_email
       FROM conversations
       JOIN users ON users.id = conversations.user_id
       WHERE conversations.id = ?`
    )
    .get(conversationId);

  if (!conversation) {
    return null;
  }

  const messages = db
    .prepare(
      `SELECT messages.*, users.name AS sender_name, users.role AS sender_role
       FROM messages
       JOIN users ON users.id = messages.sender_id
       WHERE conversation_id = ?
       ORDER BY messages.created_at ASC, messages.id ASC`
    )
    .all(conversationId);

  return { ...conversation, messages };
}

function getAdminUsers() {
  return db
    .prepare(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'admin'
       ORDER BY created_at ASC, id ASC`
    )
    .all();
}

initDb();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tristas-treats-local-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/public", express.static(path.join(__dirname, "public")));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  try {
    done(null, getUserSessionRecord(id));
  } catch (error) {
    done(error);
  }
});

if (socialAuth.google) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${APP_BASE_URL}/auth/google/callback`
      },
      (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase() || null;
          const name = profile.displayName || profile.name?.givenName || "Customer";
          const user = findOrCreateSocialUser({
            provider: "google",
            providerId: profile.id,
            name,
            email
          });
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

if (socialAuth.facebook) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${APP_BASE_URL}/auth/facebook/callback`,
        profileFields: ["id", "displayName", "emails"]
      },
      (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase() || null;
          const user = findOrCreateSocialUser({
            provider: "facebook",
            providerId: profile.id,
            name: profile.displayName || "Customer",
            email
          });
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

app.use((req, res, next) => {
  if (!req.session.user && req.user) {
    req.session.user = req.user;
  }

  res.locals.currentUser = req.session.user || req.user || null;
  res.locals.error = req.session.error || "";
  res.locals.success = req.session.success || "";
  res.locals.socialAuth = socialAuth;
  res.locals.activePage = "";
  delete req.session.error;
  delete req.session.success;
  next();
});

app.get("/", (req, res) => {
  const marketing = getMarketingContext();
  res.render("home", {
    ...marketing,
    activePage: "home"
  });
});

app.get("/gallery", (req, res) => {
  const marketing = getMarketingContext();
  res.render("gallery", {
    ...marketing,
    activePage: "gallery"
  });
});

app.get("/gallery/:imageName", (req, res) => {
  const marketing = getMarketingContext();
  const imageName = req.params.imageName;
  const selectedImage = marketing.gallery.find((image) => image.name === imageName);

  if (!selectedImage) {
    return res.status(404).render("gallery-detail", {
      ...marketing,
      activePage: "gallery",
      selectedImage: null,
      imageComments: [],
      relatedImages: []
    });
  }

  const imageComments = marketing.facebookComments.filter((comment) => comment.image === selectedImage.name);
  const relatedImages = marketing.gallery
    .filter((image) => image.name !== selectedImage.name)
    .slice(0, 6);

  res.render("gallery-detail", {
    ...marketing,
    activePage: "gallery",
    selectedImage,
    imageComments,
    relatedImages
  });
});

app.get("/about", (req, res) => {
  const marketing = getMarketingContext();
  res.render("about", {
    ...marketing,
    activePage: "about"
  });
});

app.get("/reviews", (req, res) => {
  const marketing = getMarketingContext();
  res.render("reviews", {
    ...marketing,
    activePage: "reviews"
  });
});

app.get("/order", (req, res) => {
  const marketing = getMarketingContext();
  res.render("order", {
    ...marketing,
    activePage: "order"
  });
});

app.post("/api/assistant", async (req, res) => {
  const message = (req.body?.message || "").trim();
  const previousResponseId = (req.body?.previousResponseId || "").trim();

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const reply = await createAssistantReply({ message, previousResponseId });
    if (!reply.ok) {
      return res.status(reply.status || 500).json({ error: reply.error });
    }

    return res.json({
      message: reply.text || "I can help with gallery browsing, ordering, and general cake questions.",
      responseId: reply.responseId
    });
  } catch (error) {
    return res.status(500).json({
      error: "Assistant request failed.",
      detail: error.message
    });
  }
});

app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));

app.get("/auth/google", (req, res, next) => {
  if (!socialAuth.google) {
    req.session.error = "Google sign-in is not configured yet.";
    return res.redirect("/login");
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    req.session.success = "Signed in with Google.";
    res.redirect("/account");
  }
);

app.get("/auth/facebook", (req, res, next) => {
  if (!socialAuth.facebook) {
    req.session.error = "Facebook sign-in is not configured yet.";
    return res.redirect("/login");
  }
  passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
});

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    req.session.success = "Signed in with Facebook.";
    res.redirect("/account");
  }
);

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    req.session.error = "Name, email, and password are required.";
    return res.redirect("/register");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (exists) {
    req.session.error = "An account already exists for that email.";
    return res.redirect("/register");
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name.trim(), normalizedEmail, passwordHash);
  const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(result.lastInsertRowid);
  req.session.user = user;
  req.session.success = "Account created. You can now send an order request or question.";
  res.redirect("/account");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db
    .prepare("SELECT id, name, email, role, password_hash FROM users WHERE email = ?")
    .get((email || "").trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
    req.session.error = "Invalid email or password.";
    return res.redirect("/login");
  }

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  req.session.success = user.role === "admin" ? "Admin login successful." : "Welcome back.";
  res.redirect(user.role === "admin" ? "/admin" : "/account");
});

app.post("/logout", (req, res) => {
  const finish = () => req.session.destroy(() => res.redirect("/"));
  if (req.logout) {
    req.logout(() => finish());
  } else {
    finish();
  }
});

app.get("/account", requireAuth, (req, res) => {
  if (req.session.user.role === "admin") {
    return res.redirect("/admin");
  }

  const conversations = db
    .prepare(
      `SELECT id, type, subject, event_date, status, created_at, updated_at
       FROM conversations
       WHERE user_id = ?
       ORDER BY updated_at DESC, id DESC`
    )
    .all(req.session.user.id);

  const selectedId = Number(req.query.thread || conversations[0]?.id || 0);
  let selectedConversation = null;
  if (selectedId) {
    selectedConversation = hydrateConversation(selectedId);
    if (selectedConversation && selectedConversation.user_id !== req.session.user.id) {
      selectedConversation = null;
    }
  }

  res.render("account", { conversations, selectedConversation });
});

app.post("/conversations", requireAuth, (req, res) => {
  if (req.session.user.role === "admin") {
    return res.redirect("/admin");
  }

  const { type, subject, eventDate, message } = req.body;
  if (!type || !subject || !message) {
    req.session.error = "Type, subject, and message are required.";
    return res.redirect("/account");
  }

  const result = db
    .prepare(
      `INSERT INTO conversations (user_id, type, subject, event_date)
       VALUES (?, ?, ?, ?)`
    )
    .run(req.session.user.id, type, subject.trim(), eventDate || null);

  db.prepare(
    `INSERT INTO messages (conversation_id, sender_id, body)
     VALUES (?, ?, ?)`
  ).run(result.lastInsertRowid, req.session.user.id, message.trim());
  db.prepare("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(result.lastInsertRowid);

  req.session.success = "Message sent to Trista.";
  res.redirect(`/account?thread=${result.lastInsertRowid}`);
});

app.post("/conversations/:id/reply", requireAuth, (req, res) => {
  const conversationId = Number(req.params.id);
  const conversation = db.prepare("SELECT * FROM conversations WHERE id = ?").get(conversationId);
  if (!conversation) {
    req.session.error = "Conversation not found.";
    return res.redirect(req.session.user.role === "admin" ? "/admin" : "/account");
  }

  const user = req.session.user;
  if (user.role !== "admin" && conversation.user_id !== user.id) {
    req.session.error = "You do not have access to that conversation.";
    return res.redirect("/");
  }

  const body = (req.body.body || "").trim();
  if (!body) {
    req.session.error = "Reply cannot be empty.";
    return res.redirect(user.role === "admin" ? `/admin?thread=${conversationId}` : `/account?thread=${conversationId}`);
  }

  db.prepare("INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)").run(
    conversationId,
    user.id,
    body
  );
  db.prepare("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(conversationId);

  req.session.success = "Reply sent.";
  res.redirect(user.role === "admin" ? `/admin?thread=${conversationId}` : `/account?thread=${conversationId}`);
});

app.post("/conversations/:id/status", requireAdmin, (req, res) => {
  const conversationId = Number(req.params.id);
  const nextStatus = req.body.status === "closed" ? "closed" : "open";
  db.prepare("UPDATE conversations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
    nextStatus,
    conversationId
  );
  req.session.success = `Thread marked ${nextStatus}.`;
  res.redirect(`/admin?thread=${conversationId}`);
});

app.get("/admin", requireAdmin, (req, res) => {
  const conversations = db
    .prepare(
      `SELECT conversations.*, users.name AS customer_name, users.email AS customer_email
       FROM conversations
       JOIN users ON users.id = conversations.user_id
       ORDER BY CASE conversations.status WHEN 'open' THEN 0 ELSE 1 END,
                conversations.updated_at DESC,
                conversations.id DESC`
    )
    .all();

  const selectedId = Number(req.query.thread || conversations[0]?.id || 0);
  const selectedConversation = selectedId ? hydrateConversation(selectedId) : null;
  const pendingReviews = db.prepare("SELECT * FROM reviews WHERE approved = 0 ORDER BY created_at DESC").all();
  const adminUsers = getAdminUsers();

  res.render("admin", { conversations, selectedConversation, pendingReviews, adminUsers });
});

app.post("/admin/admin-users", requireAdmin, (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!name || !email) {
    req.session.error = "Admin name and email are required.";
    return res.redirect("/admin");
  }

  const existingUser = db.prepare("SELECT id, role FROM users WHERE email = ?").get(email);
  if (existingUser) {
    if (existingUser.role === "admin") {
      req.session.success = "That email already has admin access.";
      return res.redirect("/admin");
    }

    db.prepare("UPDATE users SET name = ?, role = 'admin' WHERE id = ?").run(name, existingUser.id);
    req.session.success = "Existing user promoted to admin.";
    return res.redirect("/admin");
  }

  if (!password) {
    req.session.error = "A password is required when creating a brand-new admin.";
    return res.redirect("/admin");
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')"
  ).run(name, email, passwordHash);

  req.session.success = "New admin created.";
  res.redirect("/admin");
});

app.post("/reviews", (req, res) => {
  const { reviewerName, reviewerEmail, rating, body } = req.body;
  const numericRating = Number(rating);
  if (!reviewerName || !body || numericRating < 1 || numericRating > 5) {
    req.session.error = "Name, rating, and review text are required.";
    return res.redirect("/reviews");
  }

  db.prepare(
    `INSERT INTO reviews (reviewer_name, reviewer_email, rating, body)
     VALUES (?, ?, ?, ?)`
  ).run(reviewerName.trim(), (reviewerEmail || "").trim() || null, numericRating, body.trim());

  req.session.success = "Review submitted for approval.";
  res.redirect("/reviews");
});

app.post("/reviews/:id/approve", requireAdmin, (req, res) => {
  db.prepare("UPDATE reviews SET approved = 1 WHERE id = ?").run(Number(req.params.id));
  req.session.success = "Review approved.";
  res.redirect("/admin#reviews");
});

app.post("/reviews/:id/delete", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM reviews WHERE id = ?").run(Number(req.params.id));
  req.session.success = "Review deleted.";
  res.redirect("/admin#reviews");
});

app.listen(PORT, () => {
  console.log(`Tristas Treats app running at http://localhost:${PORT}`);
});
