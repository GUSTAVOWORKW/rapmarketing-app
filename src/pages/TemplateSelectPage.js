import React, { useEffect, useState } from 'react';
import TemplateSelect from './TemplateSelect';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const TemplateSelectPage = ({ currentUserId, onProfileUpdate, hadTemplate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Se não houver usuário, redireciona para login
    if (!currentUserId) {
      navigate('/login');
    }
  }, [currentUserId, navigate]);

  const handleSelect = async (templateId) => {
    if (!currentUserId) return;
    setIsSaving(true);
    await supabase
      .from('profiles')
      .update({ template_id: templateId, updated_at: new Date().toISOString() })
      .eq('user_id', currentUserId);
    if (onProfileUpdate) {
      await onProfileUpdate();
    }
    setIsSaving(false);
    // Sempre navega para streaming-setup e passa o templateId via state
    navigate('/streaming-setup', { state: { templateId } });
  };

  return <TemplateSelect onSelect={handleSelect} disabled={isSaving} />;
};

export default TemplateSelectPage;
