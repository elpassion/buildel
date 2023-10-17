import { useCallback } from "react";

export function useDownloadFile(
  value: string,
  fileName: string,
  fileType = "text/plain"
) {
  return useCallback(() => {
    const textBlob = new Blob([value], { type: fileType });

    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(textBlob);
    downloadLink.download = fileName;

    downloadLink.click();

    window.URL.revokeObjectURL(downloadLink.href);
  }, [fileName, fileType, value]);
}
