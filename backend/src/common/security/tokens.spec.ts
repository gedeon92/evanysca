import { describe, expect, it } from "vitest";
import { calculerExpiration, dureeEnMillisecondes, genererJetonRafraichissement, hacherJeton } from "./tokens";

describe("dureeEnMillisecondes", () => {
  it("interprète les formats de TTL du .env", () => {
    expect(dureeEnMillisecondes("15m")).toBe(900_000);
    expect(dureeEnMillisecondes("30d")).toBe(2_592_000_000);
    expect(dureeEnMillisecondes("24h")).toBe(86_400_000);
    expect(dureeEnMillisecondes("45s")).toBe(45_000);
  });

  it("refuse une durée mal écrite plutôt que de deviner", () => {
    // Un TTL silencieusement interprété comme 0 ferait expirer toutes les sessions à la seconde.
    expect(() => dureeEnMillisecondes("30 jours")).toThrow(/Durée invalide/);
    expect(() => dureeEnMillisecondes("30")).toThrow(/Durée invalide/);
    expect(() => dureeEnMillisecondes("")).toThrow(/Durée invalide/);
  });
});

describe("calculerExpiration", () => {
  it("part de la date fournie", () => {
    const depart = new Date("2026-01-01T00:00:00.000Z");
    expect(calculerExpiration("30d", depart).toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
});

describe("jetons de rafraîchissement", () => {
  it("génère des valeurs uniques et sans caractère à échapper en URL", () => {
    const jetons = new Set(Array.from({ length: 200 }, () => genererJetonRafraichissement()));
    expect(jetons.size).toBe(200);
    for (const jeton of jetons) expect(jeton).toMatch(/^[A-Za-z0-9_-]{64}$/);
  });

  it("hache de façon déterministe, pour permettre la recherche par index unique", () => {
    expect(hacherJeton("abc")).toBe(hacherJeton("abc"));
    expect(hacherJeton("abc")).not.toBe(hacherJeton("abd"));
    expect(hacherJeton("abc")).toMatch(/^[a-f0-9]{64}$/);
  });
});
