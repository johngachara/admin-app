import React, { useState } from 'react';
import {
    Box,
    Flex,
    Icon,
    Link,
    Text,
    VStack,
    HStack,
    IconButton,
    useColorModeValue,
    useBreakpointValue,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure
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
    FiMenu,
    FiChevronLeft,
    FiChevronRight
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
            w="full"
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
            w="full"
        >
            {Content}
        </Link>
    );
};

const Navbar = () => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const isMobile = useBreakpointValue({ base: true, lg: false });
    const bgColor = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const navItems = [
        { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
        { icon: FiTrendingUp, label: 'Weekly Analysis', path: '/weekly' },
        { icon: FiCalendar, label: 'Monthly Analysis', path: '/monthly' },
        { icon: FiBarChart2, label: 'Yearly Analysis', path: '/yearly' },
        { icon: FiUsers, label: 'Customer Insights', path: '/customers' },
        { icon: FiBox, label: 'Product Insights', path: '/products' },
    ];

    const handleNavItemClick = () => {
        if (isMobile) {
            onClose();
        }
    };

    const NavContent = () => (
        <Box w="full" h="full" overflowY="auto">
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                {!isCollapsed && (
                    <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                        Analytics
                    </Text>
                )}
                {!isMobile && (
                    <IconButton
                        display={{ base: 'none', lg: 'flex' }}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label="Toggle Navigation"
                        icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                        size="sm"
                    />
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

    // Mobile version with Drawer
    if (isMobile) {
        return (
            <>
                <Flex
                    bg={bgColor}
                    borderBottom="1px"
                    borderBottomColor={borderColor}
                    position="fixed"
                    top="0"
                    width="full"
                    zIndex="1000"
                    h="16"
                    alignItems="center"
                    px="4"
                >
                    <IconButton
                        aria-label="Open Menu"
                        icon={<FiMenu />}
                        onClick={onOpen}
                        variant="ghost"
                    />
                    <Text ml="4" fontSize="xl" fontWeight="bold">
                        Alltech Analytics
                    </Text>
                </Flex>

                <Drawer
                    isOpen={isOpen}
                    placement="left"
                    onClose={onClose}
                    size="full"
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader borderBottomWidth="1px">
                            Navigation Menu
                        </DrawerHeader>
                        <DrawerBody p="0">
                            <NavContent />
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                {/* Spacer to prevent content from hiding under the fixed header */}
                <Box h="16" />
            </>
        );
    }

    // Desktop version
    return (
        <Box
            bg={bgColor}
            borderRight="1px"
            borderRightColor={borderColor}
            w={isCollapsed ? '20' : '60'}
            h="100vh"
            pos="fixed"
            transition="width 0.2s"
        >
            <NavContent />
        </Box>
    );
};

export default Navbar;