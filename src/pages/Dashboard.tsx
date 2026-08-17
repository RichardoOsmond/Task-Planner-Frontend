import { useAuth } from "../auth/AuthContext";

function Dashboard() {
    const {user, logout} = useAuth();
    return (
        <div>
            <p>Logged in as {user?.userName} ({user?.email})</p>
            <button onClick={logout}>Log out</button>
        </div>
    )
}

export default Dashboard;