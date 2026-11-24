const endpoint = {
    admin: "/admin",
    dashboard: (period?: string) =>
    `/admin/dashboard${period ? `?period=${period}` : ""}`,
    vehicles: "/admin/vehicles",
    vehicleStatus: (id: string) => `/admin/vehicles/${id}/status`,
    getAvailableVehicles: (branchId: string) =>
    `/admin/branches/${branchId}/vehicles/available`,
    profile: "/admin/profile",
    logout: "/admin/logout",
}

export default endpoint;