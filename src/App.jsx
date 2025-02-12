import {ChakraProvider, Box, useBreakpointValue} from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import WeeklyAnalysis from './components/WeeklyAnalysis';
import MonthlyAnalysis from './components/MonthlyAnalysis';
import YearlyAnalysis from './components/YearlyAnalysis';
import CustomerInsights from './components/CustomerInsights';
import ProductInsights from './components/ProductInsights';
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
        <Box
            height="100vh"
            width="100vw"
            overflow="hidden"
            display="flex"
            flexDirection="column"
        >
            <Navbar />
            <Box
                as="main"
                flex="1"
                ml={{ base: 0, md: 60 }}
                position="relative"
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    top={isMobile ? "64px" : 0}
                    right={0}
                    bottom={0}
                    left={0}
                    overflowY="auto"
                    overflowX="hidden"
                >
                    <Outlet />
                </Box>
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
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </Router>
        </ChakraProvider>
    );
}

export default App;