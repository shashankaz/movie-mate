const TYPE_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  ogv: "video/ogg",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  avi: "video/x-msvideo",
};

export const detectVideoType = (file: File): string | null => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const fromExtension = ext ? TYPE_BY_EXTENSION[ext] : undefined;
  if (fromExtension) return fromExtension;
  return file.type.startsWith("video/") ? file.type : null;
};

export const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

export interface UploadHandle {
  done: Promise<void>;
  abort: () => void;
}

export const putFile = (
  url: string,
  file: File,
  contentType: string,
  onProgress: (fraction: number) => void,
): UploadHandle => {
  const xhr = new XMLHttpRequest();

  const done = new Promise<void>((resolve, reject) => {
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else if (xhr.status === 403) {
        reject(
          new Error(
            "Upload was rejected (403). Check the bucket's CORS rule and the signed content type.",
          ),
        );
      } else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "Network error during upload. If this persists, the bucket's CORS policy probably doesn't allow this origin.",
        ),
      );
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.send(file);
  });

  return { done, abort: () => xhr.abort() };
};
