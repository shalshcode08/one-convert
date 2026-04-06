declare module "heic2any" {
  export default function heic2any(options: {
    blob: Blob;
    toType?: "image/png" | "image/jpeg" | "image/gif";
    quality?: number;
    multiple?: boolean;
  }): Promise<Blob | Blob[]>;
}
