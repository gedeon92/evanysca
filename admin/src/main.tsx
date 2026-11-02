import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

// Quand la page est grossie au pavé tactile, le navigateur garde la mise en page à la largeur de
// la fenêtre et n'en montre qu'une partie : le côté droit (prix, boutons) sort de l'écran. On
// mesure donc la largeur réellement visible et l'interface s'y limite (voir #root dans index.css).
function mesurerLargeurVisible() {
  const largeur = window.visualViewport?.width ?? window.innerWidth;
  document.documentElement.style.setProperty("--largeur-visible", `${Math.floor(largeur)}px`);
}
mesurerLargeurVisible();
window.visualViewport?.addEventListener("resize", mesurerLargeurVisible);
window.addEventListener("resize", mesurerLargeurVisible);

const racine = document.getElementById("root");
if (!racine) throw new Error("Élément #root introuvable dans index.html.");

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
