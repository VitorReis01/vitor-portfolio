import FinalExperience from "@/components/prototype/FinalExperience";
import SystemBootLoader from "@/components/prototype/SystemBootLoader";

// SystemBootLoader só na Home real — /prototype/final continua abrindo
// direto, sem cerimônia de entrada (ver comentário no topo do loader).
export default function Home() {
  return (
    <>
      <SystemBootLoader />
      <FinalExperience prototypeChrome={false} />
    </>
  );
}
