// Utility to handle client-side image processing
// Since we don't have a backend, we must resize and compress images heavily
// so they fit in the URL/Storage without crashing the browser.

const MAX_WIDTH = 400; // Max width in pixels
const QUALITY = 0.6;   // JPEG Quality (0 to 1)

export const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (readerEvent) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to Base64 JPEG with compression
        const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error("Invalid image file"));
      
      if (readerEvent.target?.result) {
        img.src = readerEvent.target.result as string;
      }
    };

    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsDataURL(file);
  });
};