/* Local fork of Orbital photo gallery by Paul Noble.
 * https://codepen.io/paulnoble/pen/vENXprg · MIT, see assets/vendor/orbital.LICENSE.txt
 * The sphere, Hammer pan and inertia follow the original Pen.
 */
const SphereApp = (orbit) => {
  const MAX_POLAR_ROT_DEG = 3;
  const PAN_SENSITIVITY = 18;

  const DOM = {
    sphere: orbit.querySelector(".sphere"),
    main: orbit.querySelector(".orbit__viewport"),
    controls: orbit.querySelector(".orbit__controls"),
    viewer: document.querySelector(".lightbox"),
  };
  const originals = [...DOM.sphere.querySelectorAll(".item")];
  const columns = 37;
  const rows = 5;
  const turn = 360 / columns;
  let selected = 0;
  let hammer;
  let tapTimer;

  const state = {
    rotation: { x: 0, y: 0 },
    startRotation: { x: 0, y: 0 },
    inertiaFrame: null,
    cancelTap: false,
  };

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const applyTransform = () => {
    DOM.sphere.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${state.rotation.x}deg) rotateY(${state.rotation.y}deg)`;
  };

  const stopInertia = () => {
    if (state.inertiaFrame) {
      cancelAnimationFrame(state.inertiaFrame);
      state.inertiaFrame = null;
    }
  };

  const startInertia = (velocityX, velocityY) => {
    let vx = velocityX * 100;
    let vy = velocityY * 100;

    const friction = 0.92;
    const minVelocity = 0.1;
    const maxFrames = 120;
    let frameCount = 0;

    const step = () => {
      vx *= friction;
      vy *= friction;

      if (Math.abs(vx) < minVelocity && Math.abs(vy) < minVelocity) {
        state.inertiaFrame = null;
        return;
      }

      const proposedX = state.rotation.x - vy / 200;

      state.rotation.x = clamp(proposedX, -MAX_POLAR_ROT_DEG, MAX_POLAR_ROT_DEG);

      state.rotation.y += vx / 200;

      applyTransform();

      frameCount++;
      if (frameCount > maxFrames) {
        state.inertiaFrame = null;
        return;
      }

      state.inertiaFrame = requestAnimationFrame(step);
    };

    stopInertia();
    state.inertiaFrame = requestAnimationFrame(step);
  };

  const setupGestures = () => {
    hammer = new Hammer(DOM.main, { touchAction: "pan-y" });
    hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });

    hammer.on("panstart", () => {
      clearTimeout(tapTimer);
      state.cancelTap = true;
      stopInertia();
      state.startRotation.x = state.rotation.x;
      state.startRotation.y = state.rotation.y;
    });

    const pan = ({ deltaX, deltaY }) => {
      const proposedX = state.startRotation.x - deltaY / PAN_SENSITIVITY;

      state.rotation.y = state.startRotation.y + deltaX / PAN_SENSITIVITY;
      state.rotation.x = clamp(proposedX, -MAX_POLAR_ROT_DEG, MAX_POLAR_ROT_DEG);

      applyTransform();
    };
    hammer.on("panstart panmove", pan);

    hammer.on("panend pancancel", event => {
      tapTimer = setTimeout(() => { state.cancelTap = false; }, 100);
      if (event.type === "panend") {
        pan(event);
        startInertia(event.velocityX, event.velocityY);
      }
    });
  };

  const wrap = (index, size) => ((index % size) + size) % size;

  function arrange() {
    stopInertia();
    clearTimeout(tapTimer);
    state.cancelTap = false;
    hammer?.destroy();
    DOM.main.style.removeProperty("touch-action");
    const animated = !reducedMotion.matches && typeof Hammer === "function";
    orbit.classList.toggle("is-3d", animated);
    DOM.controls.hidden = !animated;

    if (!animated) {
      DOM.sphere.replaceChildren(...originals);
      DOM.sphere.style.removeProperty("transform");
      return;
    }

    const fragment = document.createDocumentFragment();
    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) {
        const position = column * rows + row;
        const index = position % originals.length;
        const item = position < originals.length ? originals[index] : originals[index].cloneNode(true);
        item.style.setProperty("--offset-x", column * 2 - columns);
        item.style.setProperty("--offset-y", row * 2 - 4 + column % 2);
        if (position >= originals.length) {
          item.setAttribute("aria-hidden", "true");
          item.querySelector("a").tabIndex = -1;
        }
        fragment.appendChild(item);
      }
    }
    DOM.sphere.replaceChildren(fragment);
    applyTransform();
    setupGestures();
  }

  function rotate(direction) {
    stopInertia();
    state.rotation.y += direction * turn * 2;
    applyTransform();
  }

  function showPicture(index) {
    selected = wrap(index, originals.length);
    const tile = originals[selected].querySelector("a");
    const thumb = tile.querySelector("img");
    const picture = DOM.viewer.querySelector("img");
    picture.src = tile.getAttribute("href");
    picture.alt = thumb.alt;
    DOM.viewer.querySelector("h2").textContent = thumb.alt;
    DOM.viewer.querySelector(".lightbox__caption").textContent = tile.dataset.artist || "";
    const source = DOM.viewer.querySelector(".lightbox__source");
    source.hidden = !tile.dataset.source;
    if (!source.hidden) source.href = tile.dataset.source;
    if (!DOM.viewer.open) DOM.viewer.showModal();
  }

  DOM.sphere.addEventListener("dragstart", event => event.preventDefault());
  DOM.sphere.addEventListener("click", event => {
    const tile = event.target.closest(".item__image");
    if (!tile || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    if (state.cancelTap) return;
    stopInertia();
    showPicture(Number(tile.dataset.picture));
  });

  DOM.sphere.addEventListener("focusin", event => {
    const tile = event.target.closest(".item__image");
    if (!tile || !tile.matches(":focus-visible") || !orbit.classList.contains("is-3d")) return;
    stopInertia();
    const longitude = Number(tile.parentElement.style.getPropertyValue("--offset-x")) + .5;
    state.rotation.y = -longitude * turn / 2;
    state.rotation.x = 0;
    applyTransform();
  });

  DOM.controls.querySelectorAll("[data-orbit-step]").forEach(button => {
    button.addEventListener("click", () => rotate(Number(button.dataset.orbitStep)));
  });
  orbit.addEventListener("keydown", event => {
    if (!orbit.classList.contains("is-3d")) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    rotate(event.key === "ArrowLeft" ? 1 : -1);
  });
  DOM.viewer.querySelectorAll("[data-detail-step]").forEach(button => {
    button.addEventListener("click", () => showPicture(selected + Number(button.dataset.detailStep)));
  });
  DOM.viewer.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showPicture(selected + (event.key === "ArrowLeft" ? -1 : 1));
  });
  DOM.viewer.addEventListener("click", event => {
    if (event.target === DOM.viewer) DOM.viewer.close();
  });
  reducedMotion.addEventListener("change", arrange);
  arrange();
};

SphereApp(document.querySelector(".orbit"));
