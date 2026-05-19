import {LightClassicCardGenerator, DarkClassicCardGenerator} from "./classic";

export function getCardGeneratorFactory(theme: string) {
  switch (theme) {
    case LightClassicCardGenerator.themeIdentifier:
      return new LightClassicCardGenerator();
    case DarkClassicCardGenerator.themeIdentifier:
      return new DarkClassicCardGenerator();
    default:
      throw new Error(`Unknown theme: ${theme}`);
  }
}
