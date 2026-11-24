import ForgotPassword from "@/modules/authentication/pages/ForgotPassword"
import { default as LogIn } from "@/modules/authentication/pages/LogIn"
import Register from "@/modules/authentication/pages/Register"
import ResetPassword from "@/modules/authentication/pages/ResetPassword"
import VerifyOTP from "@/modules/authentication/pages/VerifyOTP"
import { Route, Routes } from "react-router-dom"



const AuthIndex = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route 
                path="registration" 
                element={<Register />} 
            />
            <Route 
                path="login" 
                element={<LogIn />} 
            />
            <Route 
                path="verify-otp" 
                element={<VerifyOTP />} 
            />
            <Route 
                path="forgot-password" 
                element={<ForgotPassword />} 
            />
            <Route 
                path="reset-password" 
                element={<ResetPassword />} 
            />
            <Route 
                path="*" 
                element={<LogIn />} 
            />
        </Routes>
    )
}

export default AuthIndex
