// services/presave/artworkUpload.js
import { supabase } from '../supabase';

export class ArtworkUploadError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ArtworkUploadError';
    this.code = code;
  }
}

export class ArtworkUploadService {
  // Configurações
  static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  static ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  static MAX_DIMENSIONS = { width: 3000, height: 3000 };
  static TARGET_SIZE = { width: 800, height: 800 };

  /**
   * Valida o arquivo de imagem
   */
  static validateFile(file) {
    if (!file) {
      throw new ArtworkUploadError('Nenhum arquivo selecionado', 'NO_FILE');
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new ArtworkUploadError(
        `Tipo de arquivo não suportado. Use: ${this.ALLOWED_TYPES.join(', ')}`,
        'INVALID_TYPE'
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new ArtworkUploadError(
        `Arquivo muito grande. Máximo: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
        'FILE_TOO_LARGE'
      );
    }
  }

  /**
   * Comprime a imagem se necessário
   */
  static async compressIfNeeded(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Verificar se precisa redimensionar
          const needsResize = 
            img.width > this.MAX_DIMENSIONS.width || 
            img.height > this.MAX_DIMENSIONS.height ||
            file.size > this.MAX_FILE_SIZE;

          if (!needsResize) {
            resolve(file);
            return;
          }

          // Calcular novo tamanho mantendo proporção
          const aspectRatio = img.width / img.height;
          let newWidth = this.TARGET_SIZE.width;
          let newHeight = this.TARGET_SIZE.height;

          if (aspectRatio > 1) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }

          // Configurar canvas
          canvas.width = newWidth;
          canvas.height = newHeight;

          // Desenhar imagem redimensionada
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Converter para blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Criar novo arquivo com o nome original
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                reject(new ArtworkUploadError('Erro ao comprimir imagem', 'COMPRESSION_FAILED'));
              }
            },
            'image/jpeg',
            0.85 // Qualidade
          );
        } catch (error) {
          reject(new ArtworkUploadError('Erro ao processar imagem', 'PROCESSING_ERROR'));
        }
      };

      img.onerror = () => {
        reject(new ArtworkUploadError('Erro ao carregar imagem', 'LOAD_ERROR'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Gera um nome único para o arquivo
   */
  static generateFileName(originalName, userId, presaveId) {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'jpg';
    return `${userId}/${presaveId || 'temp'}_${timestamp}.${extension}`;
  }

  /**
   * Obtém URL pública do arquivo
   */
  static getPublicUrl(path) {
    const { data } = supabase.storage
      .from('presave-artworks')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Upload principal
   */
  static async uploadArtwork(file, userId, presaveId = null) {
    try {
      // 1. Validar arquivo
      this.validateFile(file);

      // 2. Comprimir se necessário
      const processedFile = await this.compressIfNeeded(file);

      // 3. Gerar nome único
      const fileName = this.generateFileName(file.name, userId, presaveId);

      // 4. Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('presave-artworks')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload Supabase:', error);
        throw new ArtworkUploadError(
          'Erro ao fazer upload. Tente novamente.',
          'UPLOAD_FAILED'
        );
      }

      // 5. Obter URL pública
      const publicUrl = this.getPublicUrl(data.path);

      return {
        path: data.path,
        url: publicUrl,
        originalSize: file.size,
        processedSize: processedFile.size,
        compressed: processedFile.size < file.size
      };

    } catch (error) {
      if (error instanceof ArtworkUploadError) {
        throw error;
      }
      
      console.error('Erro inesperado no upload:', error);
      throw new ArtworkUploadError(
        'Erro inesperado durante upload',
        'UNEXPECTED_ERROR'
      );
    }
  }

  /**
   * Remove arquivo do storage
   */
  static async removeArtwork(path) {
    try {
      const { error } = await supabase.storage
        .from('presave-artworks')
        .remove([path]);

      if (error) {
        console.error('Erro ao remover arquivo:', error);
        throw new ArtworkUploadError('Erro ao remover arquivo', 'REMOVE_FAILED');
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover artwork:', error);
      return false;
    }
  }

  /**
   * Valida URL de imagem externa
   */
  static async validateImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout após 5 segundos
      setTimeout(() => resolve(false), 5000);
    });
  }

  /**
   * Cria preview local da imagem
   */
  static createPreview(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new ArtworkUploadError('Arquivo não é uma imagem válida', 'INVALID_IMAGE'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new ArtworkUploadError('Erro ao criar preview', 'PREVIEW_FAILED'));
      };
      
      reader.readAsDataURL(file);
    });
  }
}

export default ArtworkUploadService;
