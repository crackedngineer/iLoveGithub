import {CardGeneratorGitRepo} from "@/lib/types";

export interface BaseSVGDetails {
  width: number;
  height: number;
}

export abstract class BaseCardGenerator {
  protected config: BaseSVGDetails;

  constructor() {
    this.config = {} as BaseSVGDetails;
  }

  abstract generateCard(repoDetails: CardGeneratorGitRepo): Promise<string>;

  public setConfig(params: URLSearchParams) {
    const width = parseInt(params.get("width") || "400", 10);
    const height = parseInt(params.get("height") || "200", 10);
    this.config = {width, height};
    this._setConfig(params);
  }

  abstract _setConfig(params: URLSearchParams): void;
}
