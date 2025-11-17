/**
 * Composable para subir archivos a Cloudinary usando un preset 'unsigned'.
 */
export const useCloudinaryUpload = () => {
  // Lee las variables NUXT_PUBLIC_ del .env
  const config = useRuntimeConfig();
  const cloudName = config.public.cloudinaryCloudName as string;
  const uploadPreset = config.public.cloudinaryUploadPreset as string;

  if (!cloudName || !uploadPreset) {
    console.warn('Faltan variables de entorno de Cloudinary (NUXT_PUBLIC_...)');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  /**
   * Sube un archivo a Cloudinary.
   * @param file El archivo (File object) desde el <input type="file">
   * @returns La URL segura (https://) de la imagen subida, o null si falla.
   */
  const upload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      // Nota: 'any' se usa aquí porque la respuesta de Cloudinary es compleja
      const response: any = await $fetch(url, {
        method: 'POST',
        body: formData
      });
      
      return response.secure_url; // Esta es la URL que guardaremos en la BD

    // (CORREGIDO) Añadido el tipo 'any' al 'catch'
    } catch (err: any) { 
      // (MEJORADO) Muestra el error real de Cloudinary si está disponible
      console.error('Error al subir a Cloudinary:', err.data?.error || err);
      return null;
    }
  };

  return { upload };
};