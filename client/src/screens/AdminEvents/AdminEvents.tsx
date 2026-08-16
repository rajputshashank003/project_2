import React from "react";
import { useAdminEvents } from "./useAdminEvents";
import { AdminEventsContext } from "./context";
import { AdminEventsTable } from "./components/AdminEventComponents";

const AdminEvents: React.FC = () => {
    const state = useAdminEvents();
    return (
        <AdminEventsContext.Provider value={state}>
            <AdminEventsTable />
        </AdminEventsContext.Provider>
    );
};

export default AdminEvents;
