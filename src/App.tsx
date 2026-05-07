import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateSurprise from "./pages/CreateSurprise";
import SurpriseView from "./pages/SurpriseView";
import { Navbar } from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateSurprise />} />
        <Route path="/gift/:id" element={<SurpriseView />} />
      </Routes>
    </BrowserRouter>
  );
}
