import { useNavigate, Navigate, Link } from "react-router";
import { useState } from "react";
import { ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) { return <Navigate to="/" replace />; }

    const handleSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login(username, password);
            navigate("/");
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setError("Invalid Username or Password");
                } else {
                    setError("Something went wrong, please try again later");
                }
            } else {
                setError("Cannot reach server. Server might be down.")
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmission}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"/>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"/>
                <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Submit"}</button>
            </form>
            <Link to="/register">Create an account</Link>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    )
}

export default Login;