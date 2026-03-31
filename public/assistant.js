(() => {
  const widget = document.querySelector("[data-assistant]");
  if (!widget) {
    return;
  }

  const toggle = widget.querySelector("[data-assistant-toggle]");
  const panel = widget.querySelector(".assistant-panel");
  const form = widget.querySelector("[data-assistant-form]");
  const messages = widget.querySelector("[data-assistant-messages]");
  const textarea = form?.querySelector("textarea[name='message']");
  let previousResponseId = "";

  function appendMessage(text, role) {
    const item = document.createElement("article");
    item.className = `assistant-message ${role === "user" ? "assistant-message-user" : "assistant-message-bot"}`;
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  toggle?.addEventListener("click", () => {
    const isHidden = panel.hasAttribute("hidden");
    if (isHidden) {
      panel.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      textarea?.focus();
    } else {
      panel.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = textarea.value.trim();
    if (!message) {
      return;
    }

    appendMessage(message, "user");
    textarea.value = "";

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          previousResponseId
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Assistant unavailable.");
      }

      previousResponseId = payload.responseId || previousResponseId;
      appendMessage(payload.message, "bot");
    } catch (error) {
      appendMessage(error.message || "Assistant unavailable.", "bot");
    }
  });
})();
