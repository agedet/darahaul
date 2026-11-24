import { useNavigate } from "react-router-dom";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import { getDashboardByRole } from "@/utils/routeConfig";
import { URLS } from "@/utils/routes";
import { requiresOnboarding } from "@/lib/roles";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/ui/loading";

const Index = () => {
    const navigate = useNavigate();
    const { user, role, isAuthenticated, isLoading } = useUserAuth();

    const needsOnboarding = Boolean(
        user && requiresOnboarding(role) && !user.onboardingCompleted,
    );

    // Redirect authenticated users to their appropriate dashboard
    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            navigate(
                needsOnboarding ? URLS.ONBOARDING : getDashboardByRole(role),
                { replace: true },
            );
        }
    }, [isAuthenticated, user, role, isLoading, needsOnboarding, navigate]);

    // Show loading state while checking authentication
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Show landing page for unauthenticated users
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col h-screen items-center justify-center">
                <h1 className="text-2xl font-bold">Welcome to DaraHaul</h1>
                <p className="text-gray-600">Your all-in-one business management solution</p>
                <p className="text-gray-600">Please navigate to the appropriate section using the menu</p>
                <button
                    onClick={() => navigate("/auth/login")}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">f xz
                    Get Started
                </button>
            </div>
        );
    }

    // Authenticated users are redirected by the useEffect, so we can return null here
    return null;
}
export default Index;
