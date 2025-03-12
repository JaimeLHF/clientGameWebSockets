import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from './components/HomePage.jsx';
import Game from "./components/Game/index.jsx";
import Controller from "./components/Controller/index.jsx";
import App from "./App.jsx";

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/brickbreaker" element={<HomePage />} />
            <Route path="/game" element={<Game />} />
            <Route path="/controller" element={<Controller />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;
