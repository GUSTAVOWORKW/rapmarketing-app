import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { allTemplatesPreviewMap } from '../components/Templates';
import { generateDemoProfile } from '../utils';

const templates = [
  {
    id: 'quebrada',
    name: 'Quebrada Style',
    description: 'Estética de periferia com cores vibrantes e grafite',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'minimal',
    name: 'Trap Minimalista',
    description: 'Design limpo e moderno para trap nacional',
    cover: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'neon',
    name: 'Neon Favela',
    description: 'Cyberpunk brasileiro com neon e elementos urbanos',
    cover: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'graffiti',
    name: 'Arte de Rua',
    description: 'Inspirado em grafite e pixação brasileira',
    cover: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'gold',
    name: 'Ouro e Ostentação',
    description: 'Luxo e prosperidade do rap nacional',
    cover: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'retro',
    name: 'Old School BR',
    description: 'Nostalgia do rap brasileiro dos anos 90/2000',
    cover: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
  },
];

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 20px 20px 20px;
  background: #181818;
`;

const Title = styled.h2`
  color: #fff;
  margin-bottom: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
  width: 100%;
  max-width: 1100px;
`;

const Card = styled.div`
  background: #232323;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  padding: 24px 16px 16px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.15s;
  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 6px 24px rgba(0,0,0,0.22);
  }
`;

const TemplateName = styled.h3`
  color: #fff;
  margin: 0 0 8px 0;
  font-size: 1.2rem;
`;

const Description = styled.p`
  color: #bdbdbd;
  font-size: 0.98rem;
  text-align: center;
  margin-bottom: 18px;
`;

const ChooseButton = styled.button`
  background: #00e676;
  color: #181818;
  border: none;
  border-radius: 6px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: auto;
  transition: background 0.2s;
  &:hover {
    background: #00c853;
  }
  // Estilo para botão desabilitado
  &:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
  }
`;

const TemplateSelect = ({ onSelect, disabled }) => {
  const navigate = useNavigate();

  // Gera perfis demo diferentes para cada template
  const demoProfiles = React.useMemo(() => {
    const obj = {};
    templates.forEach((tpl) => {
      obj[tpl.id] = generateDemoProfile(tpl.id);
    });
    return obj;
  }, []);

  const handleChoose = (templateId) => {
    if (disabled) return;
    if (onSelect) {
      onSelect(templateId);
    } else {
      navigate('/streaming-setup', { state: { templateId } });
    }
  };

  return (
    <Container>
      <Title>Escolha um Template</Title>
      <Grid>
        {templates.map((tpl) => {
          const PreviewComponent = allTemplatesPreviewMap[tpl.id];
          const profile = demoProfiles[tpl.id];
          return (
            <Card key={tpl.id}>
              <TemplateName>{tpl.name}</TemplateName>
              <Description>{tpl.description}</Description>
              {/* Remover qualquer container extra, renderizar PreviewComponent diretamente */}
              {PreviewComponent ? <PreviewComponent profile={profile} /> : <span>Preview indisponível</span>}
              <ChooseButton onClick={() => handleChoose(tpl.id)} disabled={disabled}>
                Escolher Template
              </ChooseButton>
            </Card>
          );
        })}
      </Grid>
    </Container>
  );
};

export default TemplateSelect;
