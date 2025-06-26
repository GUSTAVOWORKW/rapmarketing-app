import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSpotify, FaApple, FaYoutube, FaDeezer, FaSoundcloud, FaFacebookF, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import { MdFlashOn, MdExpandMore, MdMenu, MdClose, MdChevronRight, MdLink } from 'react-icons/md';
import { FiPlayCircle, FiMusic, FiDisc } from 'react-icons/fi';

// Componente 3D Card Effect adaptado de https://ui.aceternity.com/components/3d-card-effect
const ThreeDCard = ({ children, className = "" }) => {
    // O wrapper externo (div do return) NÃO recebe transform do efeito 3D!
    // O efeito 3D é aplicado apenas no div interno (ref), mantendo o layout intacto.
    const ref = React.useRef(null);
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let mouseX = 0;
        let mouseY = 0;
        let cardWidth = 0;
        let cardHeight = 0;
        let requestId;

        el.style.transition = 'transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s cubic-bezier(.22,1,.36,1)';
        el.style.willChange = 'transform, box-shadow';

        const handleMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            cardWidth = rect.width;
            cardHeight = rect.height;
            cancelAnimationFrame(requestId);
            requestId = requestAnimationFrame(update);
        };

        const handleMouseLeave = () => {
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            el.style.boxShadow = '0 0 0 0 rgba(49,0,255,0)';
        };

        const update = () => {
            const rotateX = ((mouseY / cardHeight) - 0.5) * -20;
            const rotateY = ((mouseX / cardWidth) - 0.5) * 20;
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            el.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 40px 0px rgba(49,0,255,0.10)`;
        };

        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(requestId);
        };
    }, []);
    return (
        <div className={className}>
            <div
                ref={ref}
                className="will-change-transform h-full w-full"
                style={{}}
            >
                {children}
            </div>
        </div>
    );
}

// Wrapper para separar transform de posicionamento do efeito 3D
const CardPositionWrapper = ({ className = '', children, highlight = false, blur = false, ...props }) => (
    <div
        className={
            `${className} hero-card-wrapper` +
            (highlight ? ' hero-card-highlight' : '') +
            (blur ? ' hero-card-blur' : '')
        }
        style={{ background: highlight || blur ? '#f8f6f2' : '#f8f6f2', borderRadius: 20, boxShadow: '0 8px 32px rgba(49,0,255,0.07), 0 1.5px 8px rgba(49,0,255,0.04)' }}
        {...props}
    >{children}</div>
);

const LandingPage = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para o menu mobile
    const [highlightedCard, setHighlightedCard] = useState(null); // Novo estado para destaque

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const handleCreateFreeRedirect = () => {
        navigate('/login'); // Ou para a página de registro, se houver uma separada
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Estilo para a seção hero com um fundo genérico
    const heroStyle = {
        // Substitua por um URL de imagem real ou deixe um gradiente/cor
        // backgroundImage: 'url("/assets/images/image-hero-background.png")',
        backgroundColor: '#f0f0f0', // Cor de fallback
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };

    return (
        // Aplicando classes base do index_rap.html (body class="text-gray-800")
        // Tailwind já define a fonte Inter por padrão.
        // A cor de fundo principal é branca, o que é padrão ou pode ser definido com bg-white.
        <div className="text-[#1c1c1c] bg-gradient-to-br from-[#f8f6f2] via-[#e9e6ff] to-[#f8f6f2] min-h-screen">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 shadow-md border-b border-[#e9e6ff]" style={{minHeight: '56px', height: '56px'}}>
                <div className="container mx-auto px-6 py-0 flex justify-between items-center h-full">
                    <Link className="flex items-center h-full" to="/">
                        <img src="/logob.png" alt="Logo Rapmarketing" className="h-20 w-auto object-contain" />
                    </Link>
                    <nav className="hidden md:flex space-x-6 items-center">
                        <button
                            onClick={handleLoginRedirect}
                            className="ml-4 px-6 py-2 bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] hover:from-[#a259ff] hover:to-[#3100ff] text-white font-bold rounded-xl shadow-xl transition-all duration-300 border-2 border-[#a259ff] focus:outline-none focus:ring-2 focus:ring-[#3100ff]"
                        >
                            Login
                        </button>
                    </nav>
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-[#1c1c1c] focus:outline-none"
                        >
                            {isMobileMenuOpen ? <MdClose className="text-3xl" /> : <MdMenu className="text-3xl" />}
                        </button>
                    </div>
                </div>
                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-[#e9e6ff]`}>
                    <nav className="flex flex-col space-y-4 p-6">
                        <button
                            onClick={() => {
                                toggleMobileMenu();
                                handleLoginRedirect();
                            }}
                            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] hover:from-[#a259ff] hover:to-[#3100ff] text-white font-bold rounded-xl shadow-xl transition-all duration-300 border-2 border-[#a259ff] focus:outline-none focus:ring-2 focus:ring-[#3100ff]"
                        >
                            Login
                        </button>
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section
                    className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden bg-cover bg-center bg-no-repeat"
                    style={{ background: 'linear-gradient(135deg, #e9e6ff 0%, #f8f6f2 100%)' }}
                >
                    <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] bg-clip-text text-transparent animate-gradient-x drop-shadow-xl">
                                Smartlinks & Smart Bios: <span className="text-[#3100ff]">Amplifique Sua Música</span>
                            </h1>
                            <p className="text-lg md:text-xl mb-8 leading-relaxed text-[#1c1c1c]/80">
                                Conecte seus fãs com sua música em todas as plataformas. Crie landing pages incríveis com links de streaming, vídeos, turnês e muito mais.
                            </p>
                            <button
                                onClick={handleCreateFreeRedirect}
                                className="bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] hover:from-[#a259ff] hover:to-[#3100ff] text-white font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-[#a259ff] focus:outline-none focus:ring-2 focus:ring-[#3100ff]"
                            >
                                CRIAR GRÁTIS
                            </button>
                        </div>
                        <div className="md:w-1/2 relative flex justify-center items-center mt-10 md:mt-0">
                            <div className="relative w-full max-w-xl h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                    <div className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] border-2 border-[#3100ff] rounded-full opacity-30 animate-pulse"></div>
                                    <div className="w-[380px] h-[380px] sm:w-[450px] sm:h-[450px] md:w-[550px] md:h-[550px] lg:w-[650px] lg:h-[650px] border-2 border-[#3100ff] rounded-full opacity-20 animate-pulse [animation-delay:1s]"></div>
                                </div>
                                {/* Mockup Central (Smart Bio) */}
                                <CardPositionWrapper
                                    className={`absolute w-56 sm:w-64 md:w-72 lg:w-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer shadow-2xl border-2 border-[#e9e6ff] bg-white/90 rounded-2xl`}
                                    highlight={highlightedCard === 'center'}
                                    blur={highlightedCard && highlightedCard !== 'center'}
                                    onMouseEnter={() => setHighlightedCard('center')}
                                    onMouseLeave={() => setHighlightedCard(null)}
                                >
                                    <ThreeDCard>
                                        <div className="h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] overflow-y-auto p-4 space-y-3 scrollbar-hide">
                                            <div className="relative w-full h-40 sm:h-48 rounded-xl overflow-hidden mb-3">
                                                <img alt="Artist Cover Image" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPRbLtXAIg_WpEv_-y1LcfmSUZaOR2sHQZcITxixsu_1lHsQmGtpFkdFLQq7dwy4FaDNEu-2JiztUnol90vu34zTEhV1TpgcaimANYAJJA7lNCenFLOgMZX7HAS8Qhk6lziLBPM5KxW76i9T-utSjEpfKlS-6HARK_WpTRZPeeiA9QYsthBQ3rml96sYePNsAS03CqS8yQX7laRYckCp-pqUMAwZPFtnjJqb9xElnq39tdmTl3wPNO2SwxM5P2q0fGRastCi9knsA"/>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                <div className="absolute bottom-3 left-3">
                                                    <img alt="Artist Profile Picture" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk7qthpu6eYuJAZV1nRea8u31m0svyMdFb4PKyZxl2TYx8suIPaI1RwzAXULU1TjG2SR3vUt-bG_7xZoI0oPiQjToZUgWIDCTk8vcYJ3gVFtjaljdOstMAnyeRLJM_7phzUNj2qORx353sZIbw-hfJciNi-NZvAsHt-OMx_I4ZBWvxJyLbOpR-Y0LxXFh7kT9qs--fKYIsbECpAsBOi3Y4RdThUw7-AFGdrxvhvrlI9EYP-mCXQjVX9jAqRAhViAP2Cy6149ERVJs"/>
                                                    <h3 className="text-white text-lg sm:text-xl font-bold mt-1 drop-shadow-sm">Nome do Artista</h3>
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm text-center px-2 text-[#1c1c1c]/70">Ouça meu novo single em sua plataforma favorita!</p>
                                            <Link className="flex items-center justify-between w-full hover:bg-[#e9e6ff] text-[#1c1c1c] font-medium py-2.5 px-3.5 rounded-xl transition duration-200 border border-[#e9e6ff]" to="#">
                                                <div className="flex items-center"><FaSpotify className="text-xl mr-3 text-green-500" /> Spotify</div>
                                                <MdChevronRight className="text-gray-400" />
                                            </Link>
                                            <Link className="flex items-center justify-between w-full hover:bg-[#e9e6ff] text-[#1c1c1c] font-medium py-2.5 px-3.5 rounded-xl transition duration-200 border border-[#e9e6ff]" to="#">
                                                <div className="flex items-center"><FaApple className="text-xl mr-3 text-black" /> Apple Music</div>
                                                <MdChevronRight className="text-gray-400" />
                                            </Link>
                                            <Link className="flex items-center justify-between w-full hover:bg-[#e9e6ff] text-[#1c1c1c] font-medium py-2.5 px-3.5 rounded-xl transition duration-200 border border-[#e9e6ff]" to="#">
                                                <div className="flex items-center"><FaYoutube className="text-xl mr-3 text-red-600" /> YouTube Music</div>
                                                <MdChevronRight className="text-gray-400" />
                                            </Link>
                                            <Link className="flex items-center justify-between w-full hover:bg-[#e9e6ff] text-[#1c1c1c] font-medium py-2.5 px-3.5 rounded-xl transition duration-200 border border-[#e9e6ff]" to="#">
                                                <div className="flex items-center"><FaDeezer className="text-xl mr-3 text-purple-600" /> Deezer</div>
                                                <MdChevronRight className="text-gray-400" />
                                            </Link>
                                            <Link className="flex items-center justify-between w-full hover:bg-[#e9e6ff] text-[#1c1c1c] font-medium py-2.5 px-3.5 rounded-xl transition duration-200 border border-[#e9e6ff]" to="#">
                                                <div className="flex items-center"><FaSoundcloud className="text-xl mr-3 text-orange-500" /> SoundCloud</div>
                                                <MdChevronRight className="text-gray-400" />
                                            </Link>
                                            <Link className="flex items-center justify-center w-full bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] hover:from-[#a259ff] hover:to-[#3100ff] text-white font-bold py-2.5 px-3.5 rounded-xl transition duration-200 mt-2 shadow-xl border-2 border-[#a259ff]" to="#">
                                                <MdLink className="mr-2" /> Ver Todos os Links
                                            </Link>
                                        </div>
                                    </ThreeDCard>
                                </CardPositionWrapper>
                                {/* Mockup Esquerdo (Single) */}
                                <CardPositionWrapper
                                    className={`absolute w-52 sm:w-56 md:w-64 lg:w-72 top-1/2 left-[calc(50%-110px)] sm:left-[calc(50%-130px)] md:left-[calc(50%-150px)] lg:left-[calc(50%-170px)] transform -translate-x-1/2 -translate-y-[calc(50%-40px)] rotate-[-12deg] transition-all duration-300 cursor-pointer shadow-xl border-2 border-[#e9e6ff] bg-white/90 rounded-2xl`}
                                    highlight={highlightedCard === 'left'}
                                    blur={highlightedCard && highlightedCard !== 'left'}
                                    onMouseEnter={() => setHighlightedCard('left')}
                                    onMouseLeave={() => setHighlightedCard(null)}
                                >
                                    <ThreeDCard>
                                        <div className="h-[420px] sm:h-[450px] md:h-[500px] lg:h-[550px] p-3 space-y-2.5 scrollbar-hide overflow-y-auto">
                                            <img alt="Single Cover Art" className="w-full h-40 sm:h-44 object-cover rounded-xl mb-2 shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwE2Y4V3P3mhl_buSYSNAVXqrWax3D3IPJQhkmgWVHFWs7omwW-SEVkbcmk2H4RbJ2kFt84kTXf5F8_Qpy-Tl8Z4beZ2chIrfPQ-7eORKcVTq6CxMPBUthXpjzs3ElHxwsQv738x-awkjwSndBE46f1kjloZeiEbaZp3-JgxgLFPWGWS0yxfz3Qu2rEEOUR2k1VLW-4EjISrRW2il-FH4C3Ogky9OwfpKzi_Ma0F1oWSrhrPScC9P3kG_eAB9RxKyFS92oRki3MKY"/>
                                            <h4 className="font-semibold text-center truncate text-md sm:text-lg text-[#1c1c1c]">Nome do Single Incrível</h4>
                                            <p className="text-xs sm:text-sm text-center mb-2 text-[#1c1c1c]/70">Artista Talentoso</p>
                                            <Link className="flex items-center w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-2 px-3 rounded-xl transition duration-200 text-sm shadow border border-green-400" to="#">
                                                <FaSpotify className="text-lg mr-2" /> Ouça no Spotify
                                            </Link>
                                            <Link className="flex items-center w-full bg-gradient-to-r from-[#232323] to-[#1c1c1c] hover:from-[#1c1c1c] hover:to-[#232323] text-white font-bold py-2 px-3 rounded-xl transition duration-200 text-sm shadow border border-[#232323]" to="#">
                                                <FaApple className="text-lg mr-2" /> Ouça na Apple Music
                                            </Link>
                                            <Link className="flex items-center w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-2 px-3 rounded-xl transition duration-200 text-sm shadow border border-red-500" to="#">
                                                <FaYoutube className="text-lg mr-2" /> Assista no YouTube
                                            </Link>
                                            <Link className="flex items-center w-full bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-bold py-2 px-3 rounded-xl transition duration-200 text-sm shadow border border-purple-400" to="#">
                                                <FaDeezer className="text-lg mr-2" /> Ouça no Deezer
                                            </Link>
                                        </div>
                                    </ThreeDCard>
                                </CardPositionWrapper>
                                {/* Mockup Direito (Álbum) */}
                                <CardPositionWrapper
                                    className={`absolute w-52 sm:w-56 md:w-64 lg:w-72 top-1/2 right-[calc(50%-110px)] sm:right-[calc(50%-130px)] md:right-[calc(50%-150px)] lg:right-[calc(50%-170px)] transform translate-x-1/2 -translate-y-[calc(50%-40px)] rotate-[12deg] transition-all duration-300 cursor-pointer shadow-xl border-2 border-[#e9e6ff] bg-white/90 rounded-2xl`}
                                    highlight={highlightedCard === 'right'}
                                    blur={highlightedCard && highlightedCard !== 'right'}
                                    onMouseEnter={() => setHighlightedCard('right')}
                                    onMouseLeave={() => setHighlightedCard(null)}
                                >
                                    <ThreeDCard>
                                        <div className="h-[420px] sm:h-[450px] md:h-[500px] lg:h-[550px] p-3 space-y-2.5 scrollbar-hide overflow-y-auto">
                                            <img alt="Album Cover Art" className="w-full h-40 sm:h-44 object-cover rounded-xl mb-2 shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTXHTvdXP279oa0G4sB9QIpNw6IwDQqRBi68Tv8OkWHatM-1-56Z36e34YaB5VcbbxnvwXQZXZzkEnfjJHl6yTKFiNTioP61gJ9585yGXmNB1Uyq15C5muUdZm5uEVTIvacDoul6bI4-cWEBanviznICFe8Y-JYksuM-kaBLkdfYmz7nHcyP57wS1xbu_9z6WZvCsN_KcmBCiwEkDghBbEASzVMaEvWBF3gr__Ye_-RWF_mpS73_d1j601F5xEvRcbNHoHWmYXhGU"/>
                                            <h4 className="font-semibold text-center truncate text-md sm:text-lg text-[#1c1c1c]">Título do Álbum Épico</h4>
                                            <p className="text-xs sm:text-sm text-center mb-2 text-[#1c1c1c]/70">Banda Lendária</p>
                                            <Link className="flex items-center w-full bg-gradient-to-r from-[#e9e6ff] to-[#f8f6f2] hover:from-[#a259ff]/20 hover:to-[#e9e6ff] text-[#3100ff] font-bold py-2 px-3 rounded-xl transition duration-200 text-sm shadow border border-[#e9e6ff]" to="#">
                                                <FiPlayCircle className="text-[#3100ff] text-lg mr-2" /> Pré-Salvar Agora
                                            </Link>
                                            <Link className="flex items-center w-full bg-gradient-to-r from-[#e9e6ff] to-[#f8f6f2] hover:from-[#a259ff]/20 hover:to-[#e9e6ff] text-[#3100ff] font-bold py-2 px-3 rounded-xl transition duration-200 text-sm shadow border border-[#e9e6ff]" to="#">
                                                <FiMusic className="text-[#3100ff] text-lg mr-2" /> Ver Tracklist
                                            </Link>
                                            <Link className="flex items-center w-full bg-gradient-to-r from-[#e9e6ff] to-[#f8f6f2] hover:from-[#a259ff]/20 hover:to-[#e9e6ff] text-[#3100ff] font-bold py-2 px-3 rounded-xl transition duration-200 text-sm shadow border border-[#e9e6ff]" to="#">
                                                <FiDisc className="text-[#3100ff] text-lg mr-2" /> Comprar Vinil
                                            </Link>
                                            <Link className="flex items-center justify-center w-full bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] hover:from-[#a259ff] hover:to-[#3100ff] text-white font-bold py-2 px-3 rounded-xl transition duration-200 mt-2 text-sm shadow-xl border-2 border-[#a259ff]" to="#">
                                                Acessar Todas as Plataformas
                                            </Link>
                                        </div>
                                    </ThreeDCard>
                                </CardPositionWrapper>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Seção de Funcionalidades/Benefícios */}
                <section className="py-16 bg-white/90 border-t border-[#e9e6ff]">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] bg-clip-text text-transparent animate-gradient-x">Por que usar o Rapmarketing?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="bg-gradient-to-br from-[#e9e6ff] to-[#f8f6f2] rounded-2xl shadow-xl border border-[#e9e6ff] p-8 flex flex-col items-center text-center">
                                <MdFlashOn className="text-4xl text-[#3100ff] mb-4" />
                                <h3 className="text-xl font-bold mb-2 text-[#3100ff]">Links Inteligentes</h3>
                                <p className="text-[#1c1c1c]/80">Unifique todos os seus links de música, vídeo, redes e eventos em uma única página moderna e personalizável.</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#e9e6ff] to-[#f8f6f2] rounded-2xl shadow-xl border border-[#e9e6ff] p-8 flex flex-col items-center text-center">
                                <FiMusic className="text-4xl text-[#a259ff] mb-4" />
                                <h3 className="text-xl font-bold mb-2 text-[#a259ff]">Analytics Avançado</h3>
                                <p className="text-[#1c1c1c]/80">Acompanhe cliques, plataformas, localização dos fãs e desempenho em tempo real para turbinar sua estratégia.</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#e9e6ff] to-[#f8f6f2] rounded-2xl shadow-xl border border-[#e9e6ff] p-8 flex flex-col items-center text-center">
                                <MdExpandMore className="text-4xl text-[#ffb300] mb-4" />
                                <h3 className="text-xl font-bold mb-2 text-[#ffb300]">Personalização Total</h3>
                                <p className="text-[#1c1c1c]/80">Escolha templates, cores, imagens e organize seus links do seu jeito. Sua identidade, seu estilo.</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#e9e6ff] to-[#f8f6f2] rounded-2xl shadow-xl border border-[#e9e6ff] p-8 flex flex-col items-center text-center">
                                <MdLink className="text-4xl text-[#3100ff] mb-4" />
                                <h3 className="text-xl font-bold mb-2 text-[#3100ff]">Integração com Plataformas</h3>
                                <p className="text-[#1c1c1c]/80">Compatível com Spotify, YouTube, Deezer, Apple Music, Instagram, TikTok e muito mais.</p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Seção de Depoimentos de Usuários/Artistas */}
                <section className="py-16 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] border-t border-[#e9e6ff]">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-[#3100ff] via-[#a259ff] to-[#ffb300] bg-clip-text text-transparent animate-gradient-x">O que artistas e profissionais dizem</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Depoimento 1 */}
                            <div className="bg-white/90 rounded-2xl shadow-xl border border-[#e9e6ff] p-8 flex flex-col items-center text-center">
                                <img src="/avatars/perfilmulher1.png" alt="Depoimento 1" className="w-20 h-20 rounded-full border-4 border-[#a259ff] shadow-lg mb-4 object-cover" />
                                <h3 className="text-lg font-bold text-[#3100ff] mb-1">Ana Souza</h3>
                                <span className="text-sm text-[#a259ff] mb-3">Cantora & Compositora</span>
                                <p className="text-[#1c1c1c]/80 italic">“O Rapmarketing facilitou muito minha divulgação. Em minutos criei uma página linda com todos meus links!”</p>
                            </div>
                            {/* Depoimento 2 */}
                            <div className="bg-white/90 rounded-2xl shadow-xl border border-[#e9e6ff] p-8 flex flex-col items-center text-center">
                                <img src="/avatars/perfilhomem1.png" alt="Depoimento 2" className="w-20 h-20 rounded-full border-4 border-[#3100ff] shadow-lg mb-4 object-cover" />
                                <h3 className="text-lg font-bold text-[#3100ff] mb-1">Lucas Beatmaker</h3>
                                <span className="text-sm text-[#a259ff] mb-3">Produtor Musical</span>
                                <p className="text-[#1c1c1c]/80 italic">“Analytics detalhado e integração com todas as plataformas. Recomendo para todo artista independente!”</p>
                            </div>
                            {/* Depoimento 3 */}
                            <div className="bg-white/90 rounded-2xl shadow-xl border border-[#e9e6ff] p-8 flex flex-col items-center text-center">
                                <img src="/avatars/perfilmulher2.png" alt="Depoimento 3" className="w-20 h-20 rounded-full border-4 border-[#ffb300] shadow-lg mb-4 object-cover" />
                                <h3 className="text-lg font-bold text-[#3100ff] mb-1">DJ Carol</h3>
                                <span className="text-sm text-[#a259ff] mb-3">DJ & Influencer</span>
                                <p className="text-[#1c1c1c]/80 italic">“A personalização é incrível e meus fãs adoram a experiência. O suporte também é muito rápido!”</p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Seção "Aprovado por" */}
                <section className="py-16 bg-white/90 border-t border-[#e9e6ff]">
                    <div className="container mx-auto px-6 text-center">
                        <p className="text-sm uppercase tracking-widest font-bold text-[#3100ff]/70">
                            Aprovado por líderes da indústria e artistas como você
                        </p>
                    </div>
                </section>
            </main>
            {/* Footer */}
            <footer className="py-12 bg-gradient-to-r from-[#232323] to-[#1c1c1c] border-t border-[#e9e6ff]">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-white/80">© {new Date().getFullYear()} Rapmarketing.link. Todos os direitos reservados.</p>
                    <div className="mt-4 flex justify-center space-x-6">
                        <Link className="text-white/80 hover:text-[#a259ff] transition-colors" to="#"><FaFacebookF className="text-xl" /></Link>
                        <Link className="text-white/80 hover:text-[#a259ff] transition-colors" to="#"><FaInstagram className="text-xl" /></Link>
                        <Link className="text-white/80 hover:text-[#a259ff] transition-colors" to="#"><FaTwitter className="text-xl" /></Link>
                        <Link className="text-white/80 hover:text-[#a259ff] transition-colors" to="#"><FaTiktok className="text-xl" /></Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
