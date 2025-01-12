import {ChakraProvider, Box, useBreakpointValue} from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import WeeklyAnalysis from './components/WeeklyAnalysis';
import MonthlyAnalysis from './components/MonthlyAnalysis';
import YearlyAnalysis from './components/YearlyAnalysis';
import CustomerInsights from './components/CustomerInsights';
import ProductInsights from './components/ProductInsights';
import SalesPatterns from './components/SalesPatterns';
import { theme } from './theme';
import SignInPage from "./components/SigninPage";
import {Protect, useAuth} from "@clerk/clerk-react";
import AuthFallback from "./components/AuthFallack.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";
import {setAuthToken} from "./components/axiosInstance.js";
import {useEffect} from "react";

const ProtectedLayout = () => {
    const isMobile = useBreakpointValue({ base: true, md: false });

    return (
        <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
            <Navbar />

            {/* Main Content */}
            <Box
                as="main"
                flex="1" // Ensures this takes up the remaining available space
                p={4}
                ml={{ base: 0, md: 60 }}
                maxW="100%"
                pt={isMobile ? "64px" : "0"}
                overflowY="auto" // Enables scrolling if content overflows
            >
                <Outlet />
            </Box>
        </Box>
    );
};


function App() {
    const { getToken } = useAuth();

    useEffect(() => {
        setAuthToken(getToken);
    }, [getToken]);
    return (
        <ChakraProvider theme={theme}>
            <Router basename="/">
                <Routes>
                    {/* Public route - Sign In */}
                    <Route path="/" element={<SignInPage />} />

                    {/* Protected routes */}
                    <Route
                        element={
                            <Protect role="org:admin" fallback={<AuthFallback />}>
                                <ProtectedLayout />
                            </Protect>
                        }
                    >
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/weekly" element={<WeeklyAnalysis />} />
                        <Route path="/monthly" element={<MonthlyAnalysis />} />
                        <Route path="/yearly" element={<YearlyAnalysis />} />
                        <Route path="/customers" element={<CustomerInsights />} />
                        <Route path="/products" element={<ProductInsights />} />
                        <Route path="/patterns" element={<SalesPatterns />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </Router>
        </ChakraProvider>
    );
}

export default App;