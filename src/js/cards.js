function stateToFill(state)
{
  switch (state)
  {
    case "FINISHED":
      return "85%";
    case "ONGOING":
      return "60%";
    case "WIP":
      return "45%";
    case "DROPPED":
      return "18%";
    default:
      return "50%";
  }
}

function initProjectCards()
{
  const cards = document.querySelectorAll(".tcg-card");
  const overlay = document.getElementById("cardOverlay");
  const closeBtn = document.getElementById("cardClose");

  const focusTitle = document.getElementById("focusTitle");
  const focusState = document.getElementById("focusState");
  const focusDesc = document.getElementById("focusDesc");
  const focusLink = document.getElementById("focusLink");

  for (const card of cards)
  {
    const state = card.dataset.state || "WIP";

    const flask = card.querySelector("[data-state-flask]");
    if (flask)
    {
      flask.style.setProperty("--fill", stateToFill(state));
    }

    const badge = card.querySelector("[data-state-badge]");
    if (badge)
    {
      badge.textContent = state;
    }

    card.addEventListener("click", () =>
    {
      focusTitle.textContent = card.dataset.title || "";
      focusState.textContent = state;
      focusDesc.textContent = card.dataset.desc || "";
      focusLink.href = card.dataset.link || "#";

      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    });
  }

  function closeOverlay()
  {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeOverlay);

  overlay.addEventListener("click", (e) =>
  {
    if (e.target === overlay)
    {
      closeOverlay();
    }
  });

  document.addEventListener("keydown", (e) =>
  {
    if (!overlay.hidden && e.key === "Escape")
    {
      closeOverlay();
    }
  });
}

export { initProjectCards };
