const endpoint = {
    admin: "/admin",
    dashboard: (period?: string) =>
    `/admin/dashboard${period ? `?period=${period}` : ""}`,
    vehicles: "/admin/vehicles",
    vehicleStatus: (id: string) => `/admin/vehicles/${id}/status`,
    getAvailableVehicles: (branchId: string) =>
    `/admin/branches/${branchId}/vehicles/available`,
    adminCompanyCategories: (companyId: string) =>
    `/admin/companies/${companyId}/categories`,
    billingMonitor: "/admin/billing/monitor",
    billingAnalytics: "/admin/billing/analytics",
    billingMetrics: (entityType: string, entityId: string) =>
    `/admin/billing/${entityType}/${entityId}/metrics`,
    transactionHistory: (entityType: string, entityId: string) =>
    `/admin/billing/${entityType}/${entityId}/transactions`,
    profile: "/admin/profile",
    logout: "/admin/logout",
}

export default endpoint;