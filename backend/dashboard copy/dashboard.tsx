import "boxicons/css/boxicons.min.css";
import React, { useEffect, useState } from "react";
import "./assets/css/dashboard.css";

import profileImg from "./assets/images/profile.png";

const Dashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [content, setContent] = useState("dashboard");
    const [currentTime, setCurrentTime] = useState(new Date());

    /* Sidebar + theme */
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleDarkMode = () => setDarkMode(!darkMode);

    /* Live clock */
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    /* Date & time formatting */
    const formatTime = (date: Date) =>
        date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });

    const formatDate = (date: Date) =>
        date.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    /* Dynamic content */
    const renderContent = () => {
        switch (content) {
            case "profile":
                return (
                    <>
                        <h2>My Profile</h2>
                        <p>This is profile content</p>
                    </>
                );
            case "courier":
                return (
                    <>
                        <h2>Courier Details</h2>
                        <p>Courier details loaded here</p>
                    </>
                );
            default:
                return (
                    <>
                        <h2>Welcome to Dashboard</h2>
                        <p>Select an option from the sidebar</p>
                    </>
                );
        }
    };

    return (
        <div className={darkMode ? "dark" : ""}>
            {/* SIDEBAR */}
            <section id="sidebar" className={sidebarOpen ? "" : "hide"}>
                <a href="#" className="brand">
                    <i className="bx bxs-time"></i>
                    <span className="text">
                        {formatTime(currentTime)}
                        <br />
                        <small>{formatDate(currentTime)}</small>
                    </span>
                </a>

                <ul className="side-menu top">
                    <li className={activeMenu === "dashboard" ? "active" : ""}>
                        <a
                            href="#"
                            onClick={() => {
                                setActiveMenu("dashboard");
                                setContent("dashboard");
                            }}
                        >
                            <i className="bx bxs-dashboard"></i>
                            <span className="text">Dashboard</span>
                        </a>
                    </li>

                    <li className={activeMenu === "profile" ? "active" : ""}>
                        <a
                            href="#"
                            onClick={() => {
                                setActiveMenu("profile");
                                setContent("profile");
                            }}
                        >
                            <i className="bx bxs-user"></i>
                            <span className="text">My Profile</span>
                        </a>
                    </li>

                    <li className={activeMenu === "courier" ? "active" : ""}>
                        <a
                            href="#"
                            onClick={() => {
                                setActiveMenu("courier");
                                setContent("courier");
                            }}
                        >
                            <i className="bx bxs-doughnut-chart"></i>
                            <span className="text">Courier Details</span>
                        </a>
                    </li>
                </ul>

                <ul className="side-menu">
                    <li>
                        <a href="#" className="logout">
                            <i className="bx bxs-log-out-circle"></i>
                            <span className="text">Logout</span>
                        </a>
                    </li>
                </ul>
            </section>

            {/* CONTENT */}
            <section id="content">
                {/* NAVBAR */}
                <nav>
                    <i className="bx bx-menu" onClick={toggleSidebar}></i>

                    <form>
                        <div className="form-input">
                            <input type="search" placeholder="Search..." />
                            <button type="button" className="search-btn">
                                <i className="bx bx-search"></i>
                            </button>
                        </div>
                    </form>

                    <input
                        type="checkbox"
                        id="switch-mode"
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        hidden
                    />
                    <label htmlFor="switch-mode" className="switch-mode"></label>

                    <a href="#" className="profile">
                        <img src={profileImg} alt="profile" />
                    </a>
                </nav>

                {/* MAIN */}
                <main>
                    <div className="dashboard-container">
                        <h1 className="page-title">Dashboard</h1>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Orders</h3>
                                <p>120</p>
                            </div>

                            <div className="stat-card">
                                <h3>Active Couriers</h3>
                                <p>15</p>
                            </div>

                            <div className="stat-card">
                                <h3>Delivered Today</h3>
                                <p>32</p>
                            </div>

                            <div className="stat-card">
                                <h3>Pending</h3>
                                <p>8</p>
                            </div>
                        </div>

                        <div className="content-card">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </section>
        </div>
    );
};

export default Dashboard;
