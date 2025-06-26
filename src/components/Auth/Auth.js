import { supabase } from '../../services/supabase';
import { FaGoogle } from 'react-icons/fa';

const Auth = () => {
  const handleGoogleLogin = async () => {
    try {
      // Usando a chamada simplificada que confia na 'Site URL' do Supabase
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        console.error('Erro ao fazer login com Google:', error.message);
      }
    } catch (error) {
      console.error('Erro inesperado durante o login com Google:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e9e6ff] p-4">
      <div className="bg-[#ffffff] p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1c1c1c] mb-3">
          Bem-vindo ao
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-[#3100ff] mb-8 md:mb-10">
          Rapmarketing.link
        </h2>
        <p className="text-[#1c1c1c]/80 mb-8 md:mb-10">
          Faça login para criar e gerenciar seus smartlinks e smart bios.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center bg-[#3100ff] hover:bg-opacity-80 text-[#ffffff] font-semibold py-3 px-6 rounded-lg text-lg transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3100ff] focus:ring-opacity-50"
        >
          <FaGoogle className="mr-3 text-xl" />
          <span>Login com Google</span>
        </button>
        <p className="mt-8 text-xs text-[#1c1c1c]/70">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de
          Privacidade.
        </p>
      </div>
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-[#1c1c1c]/60 text-sm">
        © {new Date().getFullYear()} Rapmarketing.link. Todos os direitos
        reservados.
      </footer>
    </div>
  );
};

export default Auth;
