import {getCardGeneratorFactory} from "@/app/api/visualify/generate/themes/factory";
import {
  DarkClassicCardGenerator,
  LightClassicCardGenerator,
} from "@/app/api/visualify/generate/themes/classic";

describe("getCardGeneratorFactory", () => {
  it("returns a LightClassicCardGenerator for 'light-classic' theme", () => {
    const generator = getCardGeneratorFactory("light-classic");
    expect(generator).toBeInstanceOf(LightClassicCardGenerator);
  });

  it("returns a DarkClassicCardGenerator for 'dark-classic' theme", () => {
    const generator = getCardGeneratorFactory("dark-classic");
    expect(generator).toBeInstanceOf(DarkClassicCardGenerator);
  });

  it("throws an error for an unknown theme identifier", () => {
    expect(() => getCardGeneratorFactory("unknown-theme")).toThrow("Unknown theme: unknown-theme");
  });

  it("throws an error for empty string theme", () => {
    expect(() => getCardGeneratorFactory("")).toThrow("Unknown theme: ");
  });

  it("returns a new instance on each call", () => {
    const gen1 = getCardGeneratorFactory("light-classic");
    const gen2 = getCardGeneratorFactory("light-classic");
    expect(gen1).not.toBe(gen2);
  });

  it("uses the static themeIdentifier from LightClassicCardGenerator", () => {
    expect(LightClassicCardGenerator.themeIdentifier).toBe("light-classic");
  });

  it("uses the static themeIdentifier from DarkClassicCardGenerator", () => {
    expect(DarkClassicCardGenerator.themeIdentifier).toBe("dark-classic");
  });
});
