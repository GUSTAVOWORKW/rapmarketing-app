// components/presave/FormSteps/ArtworkUploadStep.js - Versão completamente nova
import React, { useState, useCallback } from 'react';
import { supabase } from '../../../services/supabase';
import { usePresaveForm } from '../../../context/presave/PresaveFormContext';

const ArtworkUploadStep = ({ userId }) => {
  const { state, actions } = usePresaveForm();
  const { setArtwork } = actions;
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    progress: 0,
    error: null,
    preview: null
  });

  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;

    // Validação básica
    if (!file.type.startsWith('image/')) {
      setUploadState(prev => ({ ...prev, error: 'Arquivo deve ser uma imagem', isUploading: false }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadState(prev => ({ ...prev, error: 'Arquivo muito grande (max 5MB)', isUploading: false }));
      return;
    }

    // Definir estado de upload
    setUploadState(prev => ({ ...prev, error: null, isUploading: true, progress: 0 }));

    // Função de upload para Supabase com timeout
    const uploadToSupabase = async (fileToUpload) => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout - operação demorou muito')), 30000);
      });
      
      const uploadPromise = (async () => {
        const timestamp = Date.now();
        const fileName = `${userId}/${timestamp}_${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        console.log('📁 Uploading file:', fileName);
        
        const { error } = await supabase.storage
          .from('presave-artworks')
          .upload(fileName, fileToUpload, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Erro no upload Supabase:', error);
          throw new Error('Erro ao fazer upload para o Supabase');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('presave-artworks')
          .getPublicUrl(fileName);

        console.log('✅ Upload realizado com sucesso:', publicUrl);
        return publicUrl;
      })();
      
      return Promise.race([uploadPromise, timeoutPromise]);
    };

    try {
      // Criar preview local primeiro
      const preview = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
      });

      setUploadState(prev => ({ ...prev, preview, progress: 25 }));

      // Tentar upload para Supabase
      try {
        setUploadState(prev => ({ ...prev, progress: 50 }));
        const publicUrl = await uploadToSupabase(file);
        
        setUploadState(prev => ({ ...prev, progress: 100 }));
        
        // Atualizar estado do formulário com URL do Supabase
        setArtwork(file, publicUrl, userId);
        
        setUploadState(prev => ({ 
          ...prev, 
          isUploading: false, 
          progress: 0
        }));

        console.log('✅ Upload concluído:', publicUrl);
      } catch (uploadError) {
        console.error('⚠️ Erro no upload Supabase, usando preview local:', uploadError);
        
        // Fallback: usar preview local
        setArtwork(file, preview, userId);
        
        setUploadState(prev => ({ 
          ...prev, 
          isUploading: false, 
          progress: 0,
          error: 'Upload falhou, usando preview local'
        }));
      }
    } catch (error) {
      console.error('❌ Erro geral:', error);
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        progress: 0,
        error: error.message || 'Erro inesperado'
      }));
    }
  }, [userId, setArtwork]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFileSelect(files);
    }
  }, [handleFileSelect]);
  // Remove artwork
  const handleRemove = useCallback(() => {
    setArtwork(null, '/assets/defaults/default-cover.png', userId);
    setUploadState(prev => ({ ...prev, preview: null, error: null }));
  }, [setArtwork, userId]);

  const isUsingDefault = state.artworkUrl === '/assets/defaults/default-cover.png';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Capa do Pré-Save
        </h2>
        <p className="text-gray-600">
          Adicione uma imagem que represente sua música
        </p>
      </div>

      {/* Current Artwork Display */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <img
            src={uploadState.preview || state.artworkUrl}
            alt="Artwork preview"
            className="w-64 h-64 object-cover rounded-lg shadow-lg border-2 border-gray-200"
          />
          {!isUsingDefault && !uploadState.isUploading && (
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
              title="Remover imagem"
            >
              ✕
            </button>
          )}
          
          {/* Upload overlay */}
          {uploadState.isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin text-2xl mb-2 mx-auto">⟳</div>
                <p className="text-sm">Fazendo upload...</p>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Error */}
      {uploadState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <span className="text-red-500 mr-3">⚠</span>
          <div>
            <h4 className="font-medium text-red-800">Erro no Upload</h4>
            <p className="text-red-600">{uploadState.error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : uploadState.error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadState.isUploading}
        />
        
        <div className="text-center">
          <div className={`mx-auto text-4xl mb-4 ${
            dragActive ? 'text-blue-500' : 'text-gray-400'
          }`}>📁</div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Solte a imagem aqui' : 'Faça upload da capa'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            Arraste uma imagem ou clique para selecionar
          </p>
          
          <button
            type="button"
            disabled={uploadState.isUploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-2">🖼</span>
            Escolher Arquivo
          </button>
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
          <span className="mr-2">✓</span>
          Requisitos da Imagem
        </h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Formatos aceitos: JPG, PNG, WebP</li>
          <li>• Tamanho máximo: 5MB</li>
          <li>• Dimensões recomendadas: 800x800 pixels (quadrada)</li>
          <li>• A imagem será automaticamente otimizada</li>
          <li>• Evite textos muito pequenos que podem ficar ilegíveis</li>
        </ul>
      </div>

      {/* Status Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Status da Capa:</h4>
        <div className="flex items-center text-sm">
          {isUsingDefault ? (
            <>
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
              <span className="text-yellow-600">Usando capa padrão (opcional)</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <span className="text-green-600">Capa personalizada carregada</span>
            </>
          )}
        </div>
        <p className="text-gray-500 text-xs mt-1">
          A capa é opcional, mas recomendada para melhor engajamento
        </p>
      </div>
    </div>
  );
};

export default ArtworkUploadStep;
