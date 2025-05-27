import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Bar = styled.header`
  width: 100%;
  height: 64px;
  background: #232323;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 2px 8px #0002;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #444;
  border: 2px solid #00e676;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.18s;
  &:hover {
    background: #00e67622;
    color: #00e676;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  right: 32px;
  top: 60px;
  background: #232323;
  border-radius: 8px;
  box-shadow: 0 2px 12px #0005;
  min-width: 160px;
  padding: 8px 0;
  z-index: 200;
`;

const DropdownItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  color: #fff;
  text-align: left;
  padding: 12px 20px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 0;
  &:hover {
    background: #00e67622;
    color: #00e676;
  }
`;

export default function HeaderBar({ user, avatar, onLogout }) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <Bar>
      <div style={{ fontWeight: 'bold', fontSize: 22, color: '#00e676', letterSpacing: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        RAPMARKETING
      </div>
      <UserSection>
        {avatar && <Avatar src={avatar} alt="avatar" />}
        <MenuButton onClick={() => setOpen((v) => !v)}>
          {user?.email || 'Usuário'} &#x25BC;
        </MenuButton>
        {open && (
          <Dropdown>
            <DropdownItem onClick={() => { setOpen(false); navigate('/dashboard'); }}>Dashboard</DropdownItem>
            <DropdownItem onClick={() => { setOpen(false); onLogout && onLogout(); }}>Deslogar</DropdownItem>
          </Dropdown>
        )}
      </UserSection>
    </Bar>
  );
}
