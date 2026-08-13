import Nav from "./components/Nav";
import FilmStage from "./components/FilmStage";
import BrandPage from "./components/BrandPage";

export default function App() {
  return (
    <>
      <Nav />
      <main className="overlay">
        {/* The scroll film is the opening act... */}
        <FilmStage />
        {/* ...and the brand page continues the same story below it. */}
        <BrandPage />
      </main>
    </>
  );
}
