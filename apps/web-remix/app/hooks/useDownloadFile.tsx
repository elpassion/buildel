import { useCallback } from 'react';

export function useDownloadFile(
  value: string,
  fileName: string,
  fileType = 'text/plain',
) {
  return useCallback(() => {
    const textBlob = new Blob([value], { type: fileType });

    downloadFile(textBlob, fileName);
  }, [fileName, fileType, value]);
}

export function downloadFile(blob: Blob, fileName: string) {
  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = fileName;

  downloadLink.click();

  window.URL.revokeObjectURL(downloadLink.href);
}
