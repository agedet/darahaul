import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProfileTab from "./settings/ProfileTab";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences here.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="flex items-center">
          <TabsTrigger value="profile" className="w-fit">
            Profile
          </TabsTrigger>
          {/* <TabsTrigger value="calendar" className="w-fit">
            Link Calendar
          </TabsTrigger>
          <TabsTrigger value="call-hours" className="w-fit">
            Transfer Availability
          </TabsTrigger> */}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="">
          <ProfileTab />
        </TabsContent>

        {/* Link Calendar Tab */}
        {/* <TabsContent value="calendar" className="space-y-6">
          <LinkCalendarTab />
        </TabsContent> */}

        {/* Call Availability Tab */}
        {/* <TabsContent value="call-hours" className="space-y-6">
          <CallAvailabilityTab />
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default SettingsPage;