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
  initCardSelection();
  initOtherProjectsTabs();

  window.addEventListener("resize", () =>
  {
    layoutCardHand();
  });

  const cards = document.querySelectorAll(".tcg-card");
  const closeBtn = document.getElementById("stageClose");

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
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    });
  }
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

  const pushBase = 100; // px
  const rotBase = 20;   // deg

  for (let i = 0; i < count; i++)
  {
    const card = cards[i];
    const d = i - hoverIndex;
    const ad = Math.abs(d);

    if (ad === 0)
    {
      card.style.setProperty("--pushX", "0px");
      card.style.setProperty("--pushR", "0deg");
      continue;
    }

    const influence = 1 / Math.pow(ad + 1, 1.15);
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

function $(id)
{
  return document.getElementById(id);
}

function setStageFromCard(card)
{
  const title = card.dataset.title || "";
  const state = card.dataset.state || "";
  const languages = card.dataset.languages || "—";
  const framework = card.dataset.framework || "—";
  const desc = card.dataset.desc || "";
  const link = card.dataset.link || "#";
  const role = card.dataset.role || "—";

  $("stageTitle").textContent = title;

  const meta = $("stageMeta");
  meta.innerHTML = "";
  const p1 = document.createElement("span");
  p1.className = "meta-pill";
  p1.textContent = "State: " + state;

  const p2 = document.createElement("span");
  p2.className = "meta-pill";
  p2.textContent = "Languages: " + languages;

  const p3 = document.createElement("span");
  p3.className = "meta-pill";
  p3.textContent = "Framework: " + framework;

  const p4 = document.createElement("span");
  p4.className = "meta-pill";
  p4.textContent = "Role: " + role;

  meta.appendChild(p1);
  meta.appendChild(p2);
  meta.appendChild(p3);
  meta.appendChild(p4);

  $("stageDesc").textContent = desc;

  const a = $("stageLink");
  a.href = link;
  a.hidden = false;

  $("stageClose").hidden = false;
}

function animateCardToStage(card)
{
  const slot = $("stageCardSlot");
  const hand = $("projectHand");

  // Make sure slot is visible in viewport
  $("projectStage").scrollIntoView({ behavior: "smooth", block: "center" });


  // Clone for animation (keeps hand layout intact)
  const first = card.getBoundingClientRect();
  const clone = card.cloneNode(true);

  clone.classList.add("tcg-card-clone");
  clone.style.position = "fixed";
  clone.style.left = first.left + "px";
  clone.style.top = first.top + "px";
  clone.style.width = first.width + "px";
  clone.style.height = first.height + "px";
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.zIndex = "900";
  clone.style.pointerEvents = "none";

  document.body.appendChild(clone);

  // Put a real copy into the slot (static)
  slot.innerHTML = "";
  const staged = card.cloneNode(true);
  staged.classList.add("tcg-card-staged");
  staged.style.position = "relative";
  staged.style.left = "0";
  staged.style.bottom = "0";
  staged.style.transform = "none";
  staged.style.pointerEvents = "none";
  staged.style.removeProperty("z-index");
  staged.style.zIndex = "0";
  slot.appendChild(staged);

  // Now animate clone to the staged card's position
  const last = staged.getBoundingClientRect();

  const dx = last.left - first.left;
  const dy = last.top - first.top;
  const sx = last.width / first.width;
  const sy = last.height / first.height;

  clone.animate(
    [
      { transform: "translate(0px, 0px) scale(1, 1)" },
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }
    ],
    {
      duration: 420,
      easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
      fill: "forwards"
    }
  ).onfinish = () =>
  {
    clone.remove();
  };

  // Hand goes into selected mode (moves away)
  if (hand)
  {
    hand.classList.add("is-selected");
  }

  // Mark selected (optional)
  const cards = Array.from(hand.querySelectorAll(".tcg-card"));
  for (const c of cards)
  {
    c.classList.toggle("is-active", c === card);
  }
}

function clearSelection()
{
  const slot = $("stageCardSlot");
  const hand = $("projectHand");
  slot.innerHTML = "";

  $("stageTitle").textContent = "Select a project";
  $("stageMeta").innerHTML = "<span class=\"meta-pill\">Languages: —</span><span class=\"meta-pill\">Framework: —</span>";
  $("stageDesc").textContent = "Click a card below to view a short summary here.";

  $("stageLink").hidden = true;
  $("stageClose").hidden = true;

  if (hand)
  {
    hand.classList.remove("is-selected");
    const cards = Array.from(hand.querySelectorAll(".tcg-card"));
    for (const c of cards)
    {
      c.classList.remove("is-active");
    }
  }
}

function initCardSelection()
{
  const hand = $("projectHand");
  if (!hand)
  {
    return;
  }

  const cards = Array.from(hand.querySelectorAll(".tcg-card"));
  for (const card of cards)
  {
    card.addEventListener("click", () =>
    {
      setStageFromCard(card);
      animateCardToStage(card);
    });
  }

  const closeBtn = $("stageClose");
  if (closeBtn)
  {
    closeBtn.addEventListener("click", () =>
    {
      clearSelection();
    });
  }
}

function initOtherProjectsTabs()
{
    const tabs = Array.from(document.querySelectorAll(".other-tab"));
    const panels = Array.from(document.querySelectorAll(".other-panel"));

    if (tabs.length === 0 || panels.length === 0)
    {
        return;
    }

    function setActive(name)
    {
        for (const tab of tabs)
        {
            const active = tab.dataset.tab === name;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", active ? "true" : "false");
        }

        for (const panel of panels)
        {
            const active = panel.dataset.panel === name;
            panel.hidden = !active;
        }
    }

    for (const tab of tabs)
    {
        tab.addEventListener("click", () =>
        {
            setActive(tab.dataset.tab);
        });
    }

    setActive(tabs.find(t => t.classList.contains("is-active"))?.dataset.tab || tabs[0].dataset.tab);
}

document.querySelectorAll(".tcg-card .tcg-media").forEach((v) =>
{
    const card = v.closest(".tcg-card");
    if (!card)
    {
        return;
    }

    card.addEventListener("mouseenter", () =>
    {
        v.play().catch(() => {});
    });

    card.addEventListener("mouseleave", () =>
    {
        v.pause();
        v.currentTime = 0;
    });
});


document.addEventListener("DOMContentLoaded", () =>
{
    initOtherProjectsTabs();
});






export { initProjectCards };
