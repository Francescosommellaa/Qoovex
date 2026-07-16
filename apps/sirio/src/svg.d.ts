declare module "*.svg" {
  const source: import("next/image").StaticImageData;

  export default source;
}
