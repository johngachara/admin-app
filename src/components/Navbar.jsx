import React, { useState } from 'react';
import {
    Box,
    Flex,
    Icon,
    Link,
    Text,
    VStack,
    HStack,
    useColorModeValue,
    useBreakpointValue
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiTrendingUp,
    FiCalendar,
    FiUsers,
    FiBox,
    FiBarChart2,
    FiLogOut,
    FiMenu
} from 'react-icons/fi';
import { SignOutButton } from "@clerk/clerk-react";

const NavItem = ({ icon, children, to, isActive, isCollapsed, onClick, isSignOut }) => {
    const Content = (
        <Flex
            align="center"
            p="4"
            mx="4"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            bg={isActive ? 'blue.400' : 'transparent'}
            color={isActive ? 'white' : 'inherit'}
            _hover={{
                bg: 'blue.400',
                color: 'white',
            }}
            justifyContent={isCollapsed ? 'center' : 'flex-start'}
            onClick={onClick}
        >
            {icon && (
                <Icon
                    mr={isCollapsed ? "0" : "4"}
                    fontSize="16"
                    as={icon}
                    transition="all 0.2s"
                />
            )}
            {!isCollapsed && children}
        </Flex>
    );

    if (isSignOut) {
        return <SignOutButton>{Content}</SignOutButton>;
    }

    return (
        <Link
            as={RouterLink}
            to={to}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
        >
            {Content}
        </Link>
    );
};

const Navbar = () => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const isMobile = useBreakpointValue({ base: true, md: false });
    const bgColor = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const navItems = [
        { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
        { icon: FiTrendingUp, label: 'Weekly Analysis', path: '/weekly' },
        { icon: FiCalendar, label: 'Monthly Analysis', path: '/monthly' },
        { icon: FiBarChart2, label: 'Yearly Analysis', path: '/yearly' },
        { icon: FiUsers, label: 'Customer Insights', path: '/customers' },
        { icon: FiBox, label: 'Product Insights', path: '/products' },
        { icon: FiBarChart2, label: 'Sales Patterns', path: '/patterns' }
    ];

    const handleNavItemClick = () => {
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const NavContent = () => (
        <Box w="full">
            <Flex h="20" alignItems="center" justifyContent="space-between" mx="8">
                {!isCollapsed && (
                    <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                        Analytics
                    </Text>
                )}
            </Flex>
            <VStack spacing={0} align="stretch">
                {navItems.map((item) => (
                    <NavItem
                        key={item.path}
                        icon={item.icon}
                        to={item.path}
                        isActive={location.pathname === item.path}
                        isCollapsed={isCollapsed}
                        onClick={handleNavItemClick}
                    >
                        {item.label}
                    </NavItem>
                ))}
                <NavItem
                    icon={FiLogOut}
                    isCollapsed={isCollapsed}
                    onClick={handleNavItemClick}
                    isSignOut
                >
                    Sign Out
                </NavItem>
            </VStack>
        </Box>
    );

    // Mobile sticky navbar
    if (isMobile) {
        return (
            <Box position="relative" h="100vh">
                {/* Header */}
                <Box
                    bg={bgColor}
                    borderBottom="1px"
                    borderBottomColor={borderColor}
                    position="fixed"
                    top="0"
                    left="0"
                    right="0"
                    zIndex="1000"
                >
                    <Flex justify="space-between" align="center" p={4}>
                        <Text fontSize="xl" fontWeight="bold">
                            Analytics
                        </Text>
                        <HStack spacing={4}>
                            <Icon
                                as={FiMenu}
                                boxSize={6}
                                onClick={() => setIsOpen(!isOpen)}
                                cursor="pointer"
                            />
                        </HStack>
                    </Flex>
                </Box>

                {/* Mobile Menu */}
                {isOpen && (
                    <Box
                        position="fixed"
                        top="64px" // Height of the header
                        left="0"
                        right="0"
                        bottom="0"
                        bg={bgColor}
                        zIndex="999"
                        overflowY="auto"
                        borderBottom="1px"
                        borderBottomColor={borderColor}
                    >
                        <NavContent />
                    </Box>
                )}
            </Box>
        );
    }

    // Desktop view
    return (
        <Box
            bg={bgColor}
            borderRight="1px"
            borderRightColor={borderColor}
            w={isCollapsed ? '20' : '60'}
            pos="fixed"
            h="full"
            transition="width 0.2s"
        >
            <NavContent />
        </Box>
    );
};

export default Navbar;