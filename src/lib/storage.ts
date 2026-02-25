import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const uploadFileAndGetUrl = async (file: File) => {
  // 1. Crear un nombre único para el archivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
  const filePath = `records/${fileName}`;

  // 2. Subir el archivo a Supabase
  console.log("Intentando subir archivo al bucket 'expedientes'...", filePath);
  const { error: uploadError } = await supabase.storage
    .from('expedientes')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error de Supabase Storage:", uploadError);
    throw new Error(`Supabase Storage: ${uploadError.message}`);
  }

  console.log("Subida exitosa. Obteniendo URL...");

  // 3. Obtener la URL pública
  const { data } = supabase.storage
    .from('expedientes')
    .getPublicUrl(filePath);

  return data.publicUrl; // Esta es la URL que guardarás en Turso
};

/* VetFiles25%
https://supabase.com/dashboard/new/ixwrrqfetbdyyywfltyf?projectName=owllain%27s%20Project */