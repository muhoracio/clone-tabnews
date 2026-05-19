import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import JSConfetti from "js-confetti";

function Home() {
  const audioRef = useRef(null);
  const confettiRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("./i_love_u_tumate.mp3");
    confettiRef.current = new JSConfetti();
  }, []);

  const play = () => {
    setIsPlaying((val) => !val);
    const audio = audioRef.current;
    const confetti = confettiRef.current;

    if (audio.paused) {
      animationRef.current = setInterval(() => {
        confetti.addConfetti();
      }, 1800);
      return audio.play();
    }
    if (animationRef.current) clearInterval(animationRef.current);
    return audio.pause();
  };

  return (
    <div>
      <h1>Tayná, eu amo muito você! Se você me ama, clica no botão.</h1>
      <button onClick={play} style={styles.button}>
        {isPlaying ? "I Love U Tumate ❤️" : "Clique aqui 🙃"}
      </button>
      <div></div>
      {isPlaying && (
        <>
          <Image src="/ted.gif" width="360" height="360" alt="Teddy dancing!" />
          <p>Aumente o som!!! 🔊</p>
        </>
      )}
    </div>
  );
}

const styles = {
  button: {
    fontSize: "18px",
  },
};

export default Home;
