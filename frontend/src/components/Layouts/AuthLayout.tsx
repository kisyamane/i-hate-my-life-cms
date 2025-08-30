import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../NavBar";


export default function AuthLayout() {
    const authorized = !!localStorage.getItem('jwt_sign');

    return (
        <>
            { authorized ? (
                <div className="bg-[#fffbef] text-[#5f471d] min-h-screen font-[Montserrat]">
                    <Navbar authorized={authorized} />
                    <main>
                        <Outlet />
                    </main>
                </div>
            ) : (
                <Navigate to="/login" replace />
            )}
        </>
    )
}