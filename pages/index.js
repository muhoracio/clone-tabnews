import { useEffect, useState } from "react";
import JSConfetti from "js-confetti";

function Home() {
  const [confetti, setConfetti] = useState(null);
  const [animation, setAnimation] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setAudio(new Audio("./i_love_u_tumate.mp3"));
    setConfetti(new JSConfetti());
  }, []);

  const play = (e) => {
    setIsPlaying((val) => !val);
    if (audio.paused) {
      setAnimation(
        setInterval(() => {
          confetti.addConfetti();
        }, 1800),
      );
      return audio.play();
    }
    if (animation) clearInterval(animation);
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
          <img src="./ted.gif" />
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
