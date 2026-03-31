async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

function slugTitle(filename, metadata) {
  return metadata?.[filename]?.title || filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
}

function createGalleryCard(image) {
  return `
    <a class="gallery-card" href="/images/${encodeURIComponent(image.name)}" target="_blank" rel="noreferrer">
      <figure>
        <img src="/images/${encodeURIComponent(image.name)}" alt="${image.title}" />
        <figcaption>
          <strong>${image.title}</strong>
          <span>${image.commentCount} Facebook comments</span>
        </figcaption>
      </figure>
    </a>
  `;
}

function createCommentCard(comment) {
  return `
    <article class="card">
      <div class="comment-meta">
        <strong>${comment.author || "Facebook customer"}</strong>
        <span>${comment.date || ""}</span>
      </div>
      <p>${comment.text}</p>
      ${comment.image ? `<p class="muted">Related photo: ${slugTitle(comment.image, {})}</p>` : ""}
    </article>
  `;
}

async function initSite() {
  const [metadata, rawComments] = await Promise.all([
    loadJson("/data/gallery-metadata.json"),
    loadJson("/data/facebook-comments.json")
  ]);

  const priorityImageNames = [
    "horror-movie-themed-cake.jpg",
    "spiderweb-halloween-cake.jpg",
    "purple-rosette-cake.jpg",
    "blue-snowflake-winter-cake.jpg",
    "mm-candy-drip-cake.jpg",
    "banana-pudding-desserts.jpg",
    "pink-pearl-celebration-cake.jpg",
    "dessert-stand-display.jpg"
  ];
  const metadataKeys = Object.keys(metadata || {}).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const imageNames = Array.from(new Set([...priorityImageNames, ...metadataKeys]));

  const comments = Array.isArray(rawComments) ? rawComments : [];
  const commentCounts = comments.reduce((map, comment) => {
    if (comment.image) {
      map[comment.image] = (map[comment.image] || 0) + 1;
    }
    return map;
  }, {});

  const gallery = imageNames.map((name) => ({
    name,
    title: slugTitle(name, metadata || {}),
    commentCount: commentCounts[name] || 0
  }));

  const featured = gallery.slice(0, 8);
  const about = gallery.slice(4, 8);
  const order = gallery.slice(8, 12);

  document.querySelectorAll("[data-gallery-count]").forEach((node) => {
    node.textContent = String(gallery.length);
  });
  document.querySelectorAll("[data-comment-count]").forEach((node) => {
    node.textContent = String(comments.length);
  });

  const featuredWrap = document.querySelector("[data-featured-gallery]");
  if (featuredWrap) {
    featuredWrap.innerHTML = featured.map(createGalleryCard).join("");
  }

  const fullWrap = document.querySelector("[data-full-gallery]");
  if (fullWrap) {
    fullWrap.innerHTML = gallery.map(createGalleryCard).join("");
  }

  const aboutWrap = document.querySelector("[data-about-gallery]");
  if (aboutWrap) {
    aboutWrap.innerHTML = about.map(createGalleryCard).join("");
  }

  const orderWrap = document.querySelector("[data-order-gallery]");
  if (orderWrap) {
    orderWrap.innerHTML = order.map(createGalleryCard).join("");
  }

  const commentsMarkup = comments.length
    ? comments.slice(0, 6).map(createCommentCard).join("")
    : `
      <article class="card">
        <strong>No imported Facebook comments yet</strong>
        <p>Photo comments can be added later by updating <code>data/facebook-comments.json</code>.</p>
      </article>
    `;

  document.querySelectorAll("[data-comments-home], [data-comments-page]").forEach((node) => {
    node.innerHTML = commentsMarkup;
  });
}

initSite();
