import React, { useState, useRef, useEffect } from "react";
import Spline from "@splinetool/react-spline";
import Swal from "sweetalert2";
import { BsVolumeUpFill, BsVolumeMuteFill } from "react-icons/bs";

import MouseStealing from "./MouseStealer.jsx";
import lovesvg from "./assets/All You Need Is Love SVG Cut File.svg";
import Lovegif from "./assets/GifData/main_temp.gif";
import heartGif from "./assets/GifData/happy.gif";
import sadGif from "./assets/GifData/sad.gif";
import WordMareque from "./MarqueeProposal.jsx";
import purposerose from "./assets/GifData/RoseCute.gif";
import swalbg from "./assets/Lovingbg2_main.jpg";
import loveu from "./assets/GifData/cutieSwal4.gif";

//! yes - Gifs Importing
import yesgif0 from "./assets/GifData/Yes/cake.gif";

//! no - Gifs Importing
import nogif0 from "./assets/GifData/No/breakRej0.gif";
import nogif0_1 from "./assets/GifData/No/breakRej0_1.gif";
import nogif1 from "./assets/GifData/No/breakRej1.gif";
import nogif2 from "./assets/GifData/No/breakRej2.gif";
import nogif3 from "./assets/GifData/No/breakRej3.gif";
import nogif4 from "./assets/GifData/No/breakRej4.gif";
import nogif5 from "./assets/GifData/No/breakRej5.gif";
import nogif6 from "./assets/GifData/No/breakRej6.gif";
import nogif7 from "./assets/GifData/No/RejectNo.gif";
import nogif8 from "./assets/GifData/No/breakRej7.gif";

//! yes - Music Importing
import yesmusic0 from "./assets/AudioTracks/luv.mp3";
import yesmusic1 from "./assets/AudioTracks/day.mp3";
import yesmusic2 from "./assets/AudioTracks/home.mp3";
//! no - Music Importing
import nomusic1 from "./assets/AudioTracks/save.mp3";

// ========= CARGA AUTOMÁTICA DE GALERÍA (Vite: query + import) =========
// Busca ./assets/galeria/foto (n).ext y ordena por n
const galleryImages = (() => {
  const modules = import.meta.glob(
    "./assets/galeria/*.{png,jpg,jpeg,webp,gif}",
    { eager: true, import: "default", query: "?url" }
  );
  const ordered = Object.entries(modules)
    .map(([path, url]) => {
      // path -> "./assets/galeria/foto (12).jpg"
      const m = path.toLowerCase().match(/\/foto\s*\((\d+)\)\.(png|jpe?g|gif|webp)$/i);
      return { url, idx: m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY };
    })
    .filter((it) => isFinite(it.idx))
    .sort((a, b) => a.idx - b.idx)
    .map((it) => it.url);
  return ordered;
})();

// ========= CONSTANTES =========
const YesGifs = [yesgif0];
const NoGifs = [nogif0, nogif0_1, nogif1, nogif2, nogif3, nogif4, nogif5, nogif6, nogif7, nogif8];
const YesMusic = [yesmusic0, yesmusic1, yesmusic2];
const NoMusic = [nomusic1];

export default function Page() {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [popupShown, setPopupShown] = useState(false);
  const [yespopupShown, setYesPopupShown] = useState(false);

  const gifRef = useRef(null);
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 480px)").matches;

  // Tamaño dinámico del botón "Sí" con límite en móvil
  const rawYesSize = noCount * 16 + 16;
  const yesButtonFontSize = Math.min(rawYesSize, isMobile ? 40 : 72); // px

  const [floatingGifs, setFloatingGifs] = useState([]);

  const generateRandomPositionWithSpacing = (existingPositions) => {
    let position;
    let tooClose;
    const minDistance = 15;
    do {
      position = { top: `${Math.random() * 90}vh`, left: `${Math.random() * 90}vw` };
      tooClose = existingPositions.some((p) => {
        const dx = Math.abs(parseFloat(p.left) - parseFloat(position.left));
        const dy = Math.abs(parseFloat(p.top) - parseFloat(position.top));
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });
    } while (tooClose);
    return position;
  };

  const handleMouseEnterYes = () => {
    const gifs = [];
    const positions = [];
    for (let i = 0; i < 10; i++) {
      const newPosition = generateRandomPositionWithSpacing(positions);
      positions.push(newPosition);
      gifs.push({
        id: `heart-${i}`,
        src: heartGif,
        style: { ...newPosition, animationDuration: `${Math.random() * 2 + 1}s` },
      });
    }
    setFloatingGifs(gifs);
  };

  const handleMouseEnterNo = () => {
    const gifs = [];
    const positions = [];
    for (let i = 0; i < 10; i++) {
      const newPosition = generateRandomPositionWithSpacing(positions);
      positions.push(newPosition);
      gifs.push({
        id: `sad-${i}`,
        src: sadGif,
        style: { ...newPosition, animationDuration: `${Math.random() * 2 + 1}s` },
      });
    }
    setFloatingGifs(gifs);
  };

  const handleMouseLeave = () => setFloatingGifs([]);

  // Mantener gif "sí" actualizado
  useEffect(() => {
    if (gifRef.current && yesPressed && noCount > 3) {
      gifRef.current.src = YesGifs[currentGifIndex];
    }
  }, [yesPressed, currentGifIndex, noCount]);

  // Cambiar gif "sí" (si hubiera varios) cada 5s
  useEffect(() => {
    if (yesPressed && noCount > 3) {
      const intervalId = setInterval(() => {
        setCurrentGifIndex((prevIndex) => (prevIndex + 1) % YesGifs.length);
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [yesPressed, noCount]);

  useEffect(() => {
    if (gifRef.current) gifRef.current.src = gifRef.current.src;
  }, [noCount]);

  const handleNoClick = () => {
    const nextCount = noCount + 1;
    setNoCount(nextCount);

    if (nextCount >= 4) {
      const nextGifIndex = (nextCount - 4) % NoGifs.length;
      if (gifRef.current) gifRef.current.src = NoGifs[nextGifIndex];
    }

    if (nextCount === 1 || (nextCount - 1) % 7 === 0) {
      const nextSongIndex = Math.floor(nextCount / 7) % NoMusic.length;
      playMusic(NoMusic[nextSongIndex], NoMusic);
    }
  };

  const handleYesClick = () => {
    if (!popupShown) setYesPressed(true);
    if (noCount > 3) {
      setYesPressed(true);
      playMusic(YesMusic[0], YesMusic);
    }
  };

  const playMusic = (url, musicArray) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const audio = new Audio(url);
    audio.muted = isMuted;
    setCurrentAudio(audio);
    audio.addEventListener("ended", () => {
      const currentIndex = musicArray.indexOf(url);
      const nextIndex = (currentIndex + 1) % musicArray.length;
      playMusic(musicArray[nextIndex], musicArray);
    });
    audio.play();
  };

  const toggleMute = () => {
    if (currentAudio) currentAudio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const getNoButtonText = () => {
    const phrases = [
      "No","¿Segura, mi amor?","¿De verdad segura?","¡Piénsalo otra vez!","Última oportunidad…",
      "¿En serio que no?","Te vas a arrepentir 😼","Dale otra pensadita 🙃","¿Absolutamente segura?",
      "Hmm… puede ser un error 😅","¡Ten corazón! 💕","No seas tan fría 😳","¿Y si lo reconsideras?",
      "¿Respuesta final?","Me rompes el corazón ;(","¿Pero por qué? 😢","¿Un ‘sí’ pequeñito? 💖",
      "Ya me puse nervioso 😫","¿Vas a hacerme esto hoy? 😢","¡Ay mis sentimientos! 😥","Reconsidéralo pliiiis 😓",
      "¡Confío en ti! ❤️","Mi corazón dice sí… ¿y el tuyo?","No me dejes con la duda 😬","Pls :( me rompes el corazón 💔",
    ];
    return phrases[Math.min(noCount, phrases.length - 1)];
  };

  // —— GALERÍA & CANCIÓN para la sorpresa final ——
const openGallery = () => {
  const imgsHtml = galleryImages.length
    ? galleryImages
        .map(
          (u) => `
            <img src="${u}" loading="lazy"
                 style="height:180px;border-radius:14px;
                        box-shadow:0 8px 24px rgba(0,0,0,.25);
                        object-fit:cover;display:inline-block;margin-right:10px"/>
          `
        )
        .join("")
    : `<div style="opacity:.85">No encontré fotos en la carpeta de galería.</div>`;

  Swal.fire({
    title: "Nuestros momentos 📷",
    html: `
      <div style="max-width:920px;margin:0 auto;text-align:center">
        <div style="
          overflow-x:auto;
          overflow-y:hidden;
          white-space:nowrap;
          padding:8px 4px;
          scrollbar-width: thin;
        ">
          ${imgsHtml}
        </div>
        <div style="font-size:12px;opacity:.75;margin-top:6px">
          Desliza hacia la izquierda/derecha para ver más →
        </div>
      </div>
    `,
    width: 960,
    background: `#fff url(${swalbg})`,
    confirmButtonText: "Aww 💕",
    backdrop: `rgba(0,0,0,0.45)`,
  });
};

  const playOurSong = () => {
    // Arranca con tu tercera canción (home.mp3)
    playMusic(YesMusic[2], YesMusic);
  };

  // Popup juguetón al primer "sí" (antes de 4 "no")
  useEffect(() => {
    if (yesPressed && noCount < 4 && !popupShown) {
      Swal.fire({
        title: "¡Ay corazon! 😳💖",
        html: "¿Tan rápido un <b>sí</b>? Jajaja… ¡qué emoción! Pero antes, déjame prepararlo bien… esto es una <b>sorpresa de cumpleaños</b>. 🎂✨",
        showClass: { popup: `animate__animated animate__fadeInUp animate__faster` },
        width: isMobile ? 360 : 700,
        padding: "2em",
        color: "#716add",
        background: `#fff url(${swalbg})`,
        backdrop: `rgba(0,0,123,0.2) url(${loveu}) right no-repeat`,
        confirmButtonText: "Está bien, sigo jugando 😊",
      });
      setPopupShown(true);
      setYesPressed(false);
    }
  }, [yesPressed, noCount, popupShown, isMobile]);

  // Mensaje principal romántico (tras un poco de juego)
  useEffect(() => {
    if (yesPressed && noCount > 3 && !yespopupShown) {
      Swal.fire({
        title: "¡Feliz cumpleaños mi cielo! 🎂✨",
        html: `
          <div style="text-align:left; line-height:1.6">
            <p>Hoy celebro tu vida y la suerte de caminar contigo.</p>
            <p>Gracias por tu risa que me calma, tus abrazos que me encienden y por volver mágico lo cotidiano.</p>
            <p>Que este año nos encuentre creando recuerdos bonitos, con paciencia, ternura y mucha alegría.</p>
            <p style="margin-top:10px"><i>Con amor,</i><br/>Yersi</p>
          </div>
        `,
        width: isMobile ? 380 : 800,
        padding: "2em",
        color: "#716add",
        background: `#fff url(${swalbg})`,
        backdrop: `rgba(0,0,123,0.7) url(${purposerose}) right no-repeat`,
        confirmButtonText: "Abrir la sorpresa 🎁",
      }).then(() => {
        // al cerrar el popup (clic del usuario), arrancamos la canción
        playOurSong();
      });
      setYesPopupShown(true);
      setYesPressed(true);
    }
  }, [yesPressed, noCount, yespopupShown, isMobile]);

  // Mensaje si insiste mucho en "No"
  useEffect(() => {
    if (noCount === 25) {
      Swal.fire({
        title: "Mi amor por ti no se rinde 💫",
        html: `
          <div style="text-align:left; line-height:1.6">
            <p>Como las estrellas que siempre están ahí, incluso cuando no las ves.</p>
            <p>Yo aquí sigo, paciente y feliz de acompañarte. ¿Le decimos que sí a esta sorpresa de cumpleaños?</p>
            <p style="margin-top:10px"><i>“El amor verdadero crece con el tiempo.”</i></p>
          </div>
        `,
        width: isMobile ? 400 : 850,
        padding: "2em",
        color: "#716add",
        background: `#fff url(${swalbg})`,
        backdrop: `rgba(0, 104, 123, 0.7) url(${nogif1}) right no-repeat`,
        confirmButtonText: "Está bien, sí 💘",
      });
    }
  }, [noCount, isMobile]);

  return (
    <>
      {/* Fondo gradiente + Spline atenuado (más ligero en móvil) */}
      <div className="fixed inset-0 -z-20 bg-aurora" />
      <div className={`fixed inset-0 -z-10 ${isMobile ? "opacity-20" : "opacity-[.35]"} pointer-events-none`}>
        <Spline scene="https://prod.spline.design/oSxVDduGPlsuUIvT/scene.splinecode" />
      </div>

      {/* Mouse trap (botón que se escapa) en tramo alto de 'No' */}
      {noCount > 16 && noCount < 25 && yesPressed === false && <MouseStealing />}

      {/* Card central aesthetic */}
      <div className="overflow-hidden flex items-center justify-center px-3 md:px-4 py-6 h-screen text-white">
        <div className="glass w-full max-w-[920px] rounded-3xl p-5 md:p-10 border border-white/20 relative">
          {yesPressed && noCount > 3 ? (
            <>
              {/* Halos suaves */}
              <div className="pointer-events-none absolute -top-10 -left-10 h-24 w-24 md:h-28 md:w-28 rounded-full blur-2xl bg-rose-400/40"></div>
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-28 w-28 md:h-32 md:w-32 rounded-full blur-2xl bg-indigo-400/40"></div>

              {/* Marco con borde degradado */}
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-rose-400/60 via-fuchsia-400/60 to-indigo-400/60">
                <div className="rounded-2xl glass px-4 py-5 md:px-8 md:py-8">
                  <div className="flex flex-col items-center text-center gap-4 md:gap-5">

                    {/* Imagen principal */}
                    <div className="relative">
                      <img
                        ref={gifRef}
                        className="h-[200px] md:h-[260px] rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-white/10 object-cover"
                        src={YesGifs[currentGifIndex]}
                        alt="Yes Response"
                      />
                      <div className="absolute -inset-1 rounded-2xl ring-1 ring-white/10 pointer-events-none"></div>
                    </div>

                    {/* Títulos */}
                    <h2 className="h-hero text-3xl md:text-6xl font-semibold text-gradient">
                      ¡Te amo, Alexa! 💖
                    </h2>
                    <p className="max-w-[780px] text-base md:text-lg subtle">
                      Eres mi persona favorita. Hoy celebro tu vida y lo bonito que traes a la mía. ✨
                    </p>

                    {/* Mini “polaroids” */}
                    <div className="mt-2 grid grid-cols-3 gap-2 md:gap-4">
                      <img
                        src={yesgif0}
                        alt="Moment 1"
                        className="h-20 md:h-28 rounded-xl rotate-[-6deg] shadow-xl ring-1 ring-white/20 object-cover"
                      />
                      <img
                        src={Lovegif}
                        alt="Moment 2"
                        className="h-20 md:h-28 rounded-xl rotate-[2deg] shadow-xl ring-1 ring-white/20 object-cover"
                      />
                      <img
                        src={yesgif0}
                        alt="Moment 3"
                        className="h-20 md:h-28 rounded-xl rotate-[7deg] shadow-xl ring-1 ring-white/20 object-cover"
                      />
                    </div>

                    {/* CTAs */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-3">
                      <button
                        onClick={openGallery}
                        className="btn-glow bg-rose-500/90 hover:bg-rose-500 text-white font-semibold py-2 md:py-3 px-5 md:px-7 rounded-full ring-1 ring-white/20"
                      >
                        Ver galería 📷
                      </button>
                      <button
                        onClick={playOurSong}
                        className="btn-glow-secondary bg-indigo-500/90 hover:bg-indigo-500 text-white font-semibold py-2 md:py-3 px-5 md:px-7 rounded-full ring-1 ring-white/20"
                      >
                        Nuestra canción 🎵
                      </button>
                    </div>

                    {/* Cinta inferior (tu marquesina) */}
                    <div className="mt-3 w-full">
                      <WordMareque />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center gap-5 md:gap-6">
                <img src={lovesvg} className="animate-pulse md:w-40 w-24 opacity-80" alt="Love SVG" />
                <img
                  ref={gifRef}
                  className="h-[200px] md:h-[260px] rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-white/10"
                  src={Lovegif}
                  alt="Love Animation"
                />
                <h1 className="h-hero text-2xl md:text-5xl leading-tight subtle">
                  Alexa, ¿aceptas tu sorpresa de cumpleaños? 🎂💖
                </h1>
              </div>

              <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-3 md:gap-4 items-center">
                <button
                  onMouseEnter={handleMouseEnterYes}
                  onMouseLeave={handleMouseLeave}
                  className="btn-glow bg-rose-500/90 hover:bg-rose-500 text-white font-semibold py-2 md:py-3 px-6 md:px-8 rounded-full ring-1 ring-white/20 max-w-[85vw]"
                  style={{ fontSize: `${yesButtonFontSize}px` }}
                  onClick={handleYesClick}
                >
                  Sí
                </button>

                <button
                  onMouseEnter={handleMouseEnterNo}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleNoClick}
                  className="btn-glow-secondary bg-indigo-500/90 hover:bg-indigo-500 text-white font-semibold py-2 md:py-3 px-6 md:px-8 rounded-full ring-1 ring-white/20"
                >
                  {noCount === 0 ? "No" : getNoButtonText()}
                </button>
              </div>

              {floatingGifs.map((gif) => (
                <img
                  key={gif.id}
                  src={gif.src}
                  alt="Floating Animation"
                  className="absolute w-10 h-10 md:w-12 md:h-12 animate-bounce pointer-events-none"
                  style={gif.style}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Control de sonido (con safe-area para iPhone notch) */}
      <button
        className="fixed glass p-2 rounded-full border border-white/20 hover:opacity-95"
        style={{
          right: "1rem",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
        onClick={toggleMute}
        title={isMuted ? "Activar sonido" : "Silenciar"}
      >
        {isMuted ? <BsVolumeMuteFill size={24} /> : <BsVolumeUpFill size={24} />}
      </button>
    </>
  );
}
