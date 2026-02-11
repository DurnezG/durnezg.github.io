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

document.addEventListener("DOMContentLoaded", () =>
{
  initProjectCards();
});

function initProjectCards()
{
  layoutCardHand();
  initHoverHand();

  window.addEventListener("resize", () =>
  {
    layoutCardHand();
  });

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

function clamp(value, min, max)
{
  return Math.min(max, Math.max(min, value));
}

function layoutCardHand()
{
  const hand = document.getElementById("projectHand");
  if (!hand)
  {
    return;
  }

  const cards = Array.from(hand.querySelectorAll(".tcg-card"));
  const count = cards.length;

  if (count === 0)
  {
    return;
  }

  const rect = hand.getBoundingClientRect();
  const cardWidth = cards[0].getBoundingClientRect().width || 220;

  // Space available on screen (keep margin)
  const available = Math.max(320, window.innerWidth - 48);

  // We want the full hand to fit:
  // width ≈ cardWidth + (count - 1) * step
  // Solve step so it fits
  const stepIdeal = (count <= 1) ? 0 : (available - cardWidth) / (count - 1);

  // Clamp step to create overlap when needed
  const step = clamp(stepIdeal * 0.78, cardWidth * 0.12, cardWidth * 0.55);

  // Spread: keep subtle. You said it’s too much, so cap low.
  const spreadMax = 10; // degrees
  const spreadMin = 3;  // degrees
  const spread = clamp(8 - count * 0.6, spreadMin, spreadMax);

  const center = (count - 1) / 2;

  for (let i = 0; i < count; i++)
  {
    const card = cards[i];
    const offset = i - center;
    const depth = Math.abs(offset);

    const tx = offset * step;
    const rot = offset * spread;
    const ty = depth * 6;

    card.style.setProperty("--tx", tx.toFixed(2) + "px");
    card.style.setProperty("--rot", rot.toFixed(2) + "deg");
    card.style.setProperty("--ty", ty.toFixed(2) + "px");

    card.style.setProperty("--pushX", "0px");
    card.style.setProperty("--pushR", "0deg");

    // card.style.zIndex = (1000 - Math.round(depth * 10)).toString();
    card.style.zIndex = (1000 + i).toString();
  }
}


function applyHoverSeparation(hoverIndex)
{
  const hand = document.getElementById("projectHand");
  if (!hand)
  {
    return;
  }

  const cards = Array.from(hand.querySelectorAll(".tcg-card"));
  const count = cards.length;

  const pushBase = 34; // px
  const rotBase = 4;   // deg

  for (let i = 0; i < count; i++)
  {
    const card = cards[i];
    const d = i - hoverIndex;
    const ad = Math.abs(d);

    if (ad === 0)
    {
      card.style.setProperty("--pushX", "0px");
      card.style.setProperty("--pushR", "0deg");
      card.style.zIndex = "2000";
      continue;
    }

    const influence = 1 / Math.pow(ad + 1, 1.35);
    const dir = d > 0 ? 1 : -1;

    card.style.setProperty("--pushX", (dir * pushBase * influence).toFixed(2) + "px");
    card.style.setProperty("--pushR", (dir * rotBase * influence).toFixed(2) + "deg");
  }
}

function clearHoverSeparation()
{
  const hand = document.getElementById("projectHand");
  if (!hand)
  {
    return;
  }

  const cards = Array.from(hand.querySelectorAll(".tcg-card"));
  for (const card of cards)
  {
    card.style.setProperty("--pushX", "0px");
    card.style.setProperty("--pushR", "0deg");
  }

  layoutCardHand();
}

function initHoverHand()
{
  const hand = document.getElementById("projectHand");
  if (!hand)
  {
    return;
  }

  const cards = Array.from(hand.querySelectorAll(".tcg-card"));
  cards.forEach((card, index) =>
  {
    card.addEventListener("mouseenter", () => applyHoverSeparation(index));
    card.addEventListener("mouseleave", () => clearHoverSeparation());
  });
}


export { initProjectCards };
