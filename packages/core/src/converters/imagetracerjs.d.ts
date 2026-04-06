declare module "imagetracerjs" {
  export const imageToSVG: (
    url: string,
    callback: (svgStr: string) => void,
    options?: unknown,
  ) => void;
}
