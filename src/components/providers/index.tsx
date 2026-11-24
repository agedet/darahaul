import React from "react";
import { ReactQueryProvider } from "./reactQueryProvider";
import { TopProgressBar } from "./TopProgressBar";
import { ToastProvider } from "../../components/providers/toast-provider";
import { AuthProvider } from "../../modules/authentication/providers/context/AuthProvider";
// import { useWebPush } from "@/hooks/useWebPush";
// import { usePushNotificationNavigation } from "@/hooks/usePushNotificationNavigation";

// function WebPushInitializer({ children }: { children: React.ReactNode }) {
// //   useWebPush();
// //   usePushNotificationNavigation();
//   return <>{children}</>;
// }

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        {/* <WebPushInitializer> */}
          <TopProgressBar />
          <ToastProvider>{children}</ToastProvider>
        {/* </WebPushInitializer> */}
      </AuthProvider>
    </ReactQueryProvider>
  );
};
