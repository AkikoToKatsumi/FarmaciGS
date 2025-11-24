// Hook para manejar rutas de imágenes en Electron
import { useState, useEffect } from 'react';

export const useImagePath = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Detectar si estamos en Electron de múltiples formas
    const checkElectron = () => {
      return !!(
        window.electronAPI?.isElectron ||
        window.process?.versions?.electron ||
        navigator.userAgent.toLowerCase().includes('electron')
      );
    };
    
    setIsElectron(checkElectron());
  }, []);

  const getImagePath = (imageName: string) => {
    // En Electron, usar ruta relativa hacia el directorio public/imagenes
    if (isElectron) {
      return `./imagenes/${imageName}`;
    }
    // En web, usar rutas absolutas
    return `/imagenes/${imageName}`;
  };

  return { getImagePath, isElectron };
};

// Componente de imagen que funciona en Electron y web
interface ElectronImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const ElectronImage: React.FC<ElectronImageProps> = ({ 
  src, 
  alt, 
  className, 
  style, 
  onClick 
}) => {
  const { getImagePath, isElectron } = useImagePath();
  
  // Extraer el nombre del archivo de la ruta
  const imageName = src.replace(/^\/?(imagenes\/)?/, '');
  const imagePath = getImagePath(imageName);

  console.log(`🖼️ ElectronImage - isElectron: ${isElectron}, src: ${src}, imagePath: ${imagePath}`);

  return (
    <img 
      src={imagePath}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
      onError={(e) => {
        console.error(`❌ Error cargando imagen: ${imagePath}`);
        const target = e.target as HTMLImageElement;
        
        // Intentar diferentes rutas como fallback
        if (isElectron) {
          if (!target.src.includes('./imagenes/')) {
            target.src = `./imagenes/${imageName}`;
          } else if (!target.src.includes('../public/imagenes/')) {
            target.src = `../public/imagenes/${imageName}`;
          }
        } else {
          if (!target.src.includes('/imagenes/')) {
            target.src = `/imagenes/${imageName}`;
          }
        }
      }}
      onLoad={() => {
        console.log(`✅ Imagen cargada exitosamente: ${imagePath}`);
      }}
    />
  );
};
