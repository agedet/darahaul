import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { CreditBurnRates } from "./CreditBurnRates";
// import { ApiKeys } from "./ApiKeys";
// import { usePermissions } from "@/hooks/usePermissions";

export const AdminSettingsPage = () => {
    // const permissions = usePermissions();

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-semibold text-card-foreground">Settings</h2>
                <p className="text-muted-foreground text-sm font-normal mt-1">
                    Manage your account settings and preferences here.
                </p>
            </div>
            <Tabs defaultValue="credit-burn-rates" className="w-full">
                <TabsList>
                    {/* Only show "Credit Burn Rates" to L1 Admins */}
                    {/* {permissions.canSetBurnRates && (
                        <TabsTrigger value="credit-burn-rates">Credit Burn Rates</TabsTrigger>
                    )} */}
                    <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                </TabsList>

                {/* {permissions.canSetBurnRates && (
                    <TabsContent value="credit-burn-rates" className="mt-6">
                       <CreditBurnRates/>
                    </TabsContent>
                )} */}

                <TabsContent value="api-keys" className="mt-6">
                   {/* <ApiKeys/> */}
                </TabsContent>
            </Tabs>
        </div>
    );
};