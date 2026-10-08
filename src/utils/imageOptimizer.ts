export interface OptimizedImageResult {
  dataUrl: string;
  file: File;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export const compressImageFile = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<OptimizedImageResult> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('선택한 파일이 이미지 형식이 아닙니다.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const rawDataUrl = event.target?.result as string;
          resolve({
            dataUrl: rawDataUrl,
            file,
            originalSize: file.size,
            compressedSize: file.size,
            width,
            height,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
              const compressedFile = new File([blob], `${cleanBase}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve({
                dataUrl: compressedDataUrl,
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                width,
                height,
              });
            } else {
              resolve({
                dataUrl: compressedDataUrl,
                file,
                originalSize: file.size,
                compressedSize: file.size,
                width,
                height,
              });
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('이미지를 읽어오는 데 실패했습니다.'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽는 도중 오류가 발생했습니다.'));
    };

    reader.readAsDataURL(file);
  });
};
