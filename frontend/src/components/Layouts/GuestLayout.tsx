import { Outlet } from "react-router-dom";
import Navbar from "../NavBar";


export default function GuestLayout() {
    const authorized = !!localStorage.getItem('jwt_sign');

    return (
        <div className="bg-[#fffbef] text-[#5f471d] min-h-screen font-[Montserrat]">
            <Navbar authorized={authorized} />
            <main>
                <Outlet />
            </main>
        </div>
    )
}