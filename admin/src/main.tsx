import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

// Quand la page est grossie au pavé tactile, le navigateur garde la mise en page à la taille de
// la fenêtre et n'en montre qu'une partie, que l'on peut faire glisser avec deux doigts : le côté
// droit sort de l'écran et le contenu se déplace. On mesure donc la zone réellement visible et sa
// position, et l'interface la suit (voir #root dans index.css et la page de connexion).
function suivreZoneVisible() {
  const zone = window.visualViewport;
  const style = document.documentElement.style;
  style.setProperty("--largeur-visible", `${Math.floor(zone?.width ?? window.innerWidth)}px`);
  style.setProperty("--hauteur-visible", `${Math.floor(zone?.height ?? window.innerHeight)}px`);
  style.setProperty("--decalage-x", `${zone?.offsetLeft ?? 0}px`);
  style.setProperty("--decalage-y", `${zone?.offsetTop ?? 0}px`);
}
suivreZoneVisible();
window.visualViewport?.addEventListener("resize", suivreZoneVisible);
window.visualViewport?.addEventListener("scroll", suivreZoneVisible);
window.addEventListener("resize", suivreZoneVisible);

const racine = document.getElementById("root");
if (!racine) throw new Error("Élément #root introuvable dans index.html.");

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
