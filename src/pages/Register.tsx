import React, { useState } from "react";
import { ApiError, api } from "../lib/api";
import { useNavigate, Navigate, Link } from "react-router";
import { useAuth } from "../auth/AuthContext";

function Register() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confPass, setConfPass] = useState("");
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (isAuthenticated) { return <Navigate to="/" replace />; }

    const handleSubmission = async(e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (!username) {
            setError("Username must not be empty");
            setLoading(false);
            return;
        } else if (username.length >= 50) {
            setError("Username cannot be more than 50 characters long");
            setLoading(false);
            return;
        }
        if (!password) {
            setError("Password must not be empty");
            setLoading(false);
            return;
        } else if (!passwordRegex.test(password)) {
            setError("Password must be at least 8 characters long and include a lowercase and an uppercase letter, a number, and a special character");
            setLoading(false);
            return;
        } else if (!confPass) {
            setError("Confirmation password must not be empty");
            setLoading(false);
            return;
        } else if (password !== confPass) {
            setError("Password and Confirm Password do not match");
            setLoading(false);
            return;
        }
        if (!email) {
            setError("Email must not be empty");
            setLoading(false);
            return;
        } else if (!emailRegex.test(email)) {
            setError("Please enter a valid email");
            setLoading(false);
            return;
        }

        try {
            await api("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ userName: username, email, password })
            })
            navigate("/login");
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status >= 500) {
                    setError("Server might be down. Please try again later!");
                } else if (err.status === 400) {
                    setError("Registration failed. Check the requirements below and try again.")
                }
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
                    placeholder="Username" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email" />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" />
                <input
                    type="password"
                    value={confPass}
                    onChange={(e) => setConfPass(e.target.value)}
                    placeholder="Confirmation Password" />
                <button type="submit" disabled={loading}>{loading ? "Registering..." : "Submit"}</button>
            </form>
            <Link to="/login">Login</Link>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    )
}

export default Register;