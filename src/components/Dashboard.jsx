import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    GridItem,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    SimpleGrid,
    Card,
    CardBody,
    Heading,
    Spinner,
    Center,
    useToast,
    Text,
    Divider,
    useColorModeValue,
    VStack,
    HStack,
    Badge,
    Progress,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Icon,
    Alert,
    AlertIcon,
    CardHeader,
} from '@chakra-ui/react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import axios from 'axios';
import { api } from '../utils/api';

const COLORS = ['#3182CE', '#38B2AC', '#9F7AEA', '#ED8936', '#F56565', '#48BB78'];

// Get API URL from environment or use a default
const AI_API_URL = import.meta.env.VITE_AI_API_URL ;
const CELERY_KEY = import.meta.env.VITE_CELERY_KEY ;

// Create separate axios instance for AI insights with token management
let aiAuthToken = null;
let aiTokenExpiry = null;

const aiAxiosInstance = axios.create({
    baseURL: AI_API_URL,
});

// Token management interceptor for AI API
aiAxiosInstance.interceptors.request.use(
    async (config) => {
        // Skip token acquisition for the token endpoint itself
        if (config.url === '/api/celery-token/') {
            return config;
        }

        // Check if we need a new token
        const currentTime = new Date().getTime();
        if (!aiAuthToken || !aiTokenExpiry || currentTime >= aiTokenExpiry) {
            try {
                // Get the token
                const tokenResponse = await axios.post(`${AI_API_URL}/api/celery-token/`, {
                    api_key: CELERY_KEY
                });

                // Store token and set expiry (assuming token is valid for 1 hour)
                aiAuthToken = tokenResponse.data.access;
                aiTokenExpiry = new Date().getTime() + (3600 * 1000); // 1 hour in milliseconds

                console.log('New AI authentication token acquired');
            } catch (error) {
                console.error('Error getting AI authentication token:', error);
                return Promise.reject(error);
            }
        }

        // Add the token to the request headers
        config.headers.Authorization = `Bearer ${aiAuthToken}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors
aiAxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If 401, clear token and retry once
        if (error.response && error.response.status === 401) {
            aiAuthToken = null;
            aiTokenExpiry = null;

            // Only retry if this wasn't already a retry
            if (!error.config._retry) {
                error.config._retry = true;
                return aiAxiosInstance(error.config);
            }
        }
        return Promise.reject(error);
    }
);

// AI Icon Component
const AIIcon = (props) => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"></path>
    </svg>
);

// Helper functions for caching
const getCacheKey = (type) => `alltech_ai_${type}`;

const getCachedData = (type) => {
    try {
        const cached = localStorage.getItem(getCacheKey(type));
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = new Date();
        const cacheDate = new Date(timestamp);

        if (type === 'daily') {
            // Check if it's the same day
            if (
                now.getDate() === cacheDate.getDate() &&
                now.getMonth() === cacheDate.getMonth() &&
                now.getFullYear() === cacheDate.getFullYear()
            ) {
                return data;
            }
        } else if (type === 'weekly') {
            // Check if it's the same week (Saturday to Friday)
            const daysSinceCache = Math.floor((now - cacheDate) / (1000 * 60 * 60 * 24));
            if (daysSinceCache < 7 && cacheDate.getDay() === 6) { // 6 = Saturday
                return data;
            }
        }

        return null;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
};

const setCachedData = (type, data) => {
    try {
        localStorage.setItem(
            getCacheKey(type),
            JSON.stringify({
                data,
                timestamp: new Date().toISOString()
            })
        );
    } catch (error) {
        console.error('Error setting cache:', error);
    }
};

const shouldFetchWeeklyInsights = () => {
    const now = new Date();
    return now.getDay() === 6; // 6 = Saturday
};

const StatCardComponent = ({ label, value, subtext, comparison, trend, icon }) => (
    <Card
        boxShadow="md"
        transition="all 0.3s"
        _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
        borderTop="4px solid"
        borderTopColor={trend === 'increase' ? 'green.400' : trend === 'decrease' ? 'red.400' : 'blue.400'}
    >
        <CardBody>
            <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }} color="gray.600" fontWeight="medium">
                    {label}
                </StatLabel>
                <StatNumber fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" my={2}>
                    {value?.toLocaleString() || 0}
                </StatNumber>
                {(comparison || subtext) && (
                    <StatHelpText display="flex" alignItems="center" gap={1} fontSize={{ base: "xs", md: "sm" }}>
                        {trend && <StatArrow type={trend} />}
                        {subtext}
                    </StatHelpText>
                )}
            </Stat>
        </CardBody>
    </Card>
);

const ChartContainer = ({ title, height = "350px", children, badge }) => {
    const bg = useColorModeValue('white', 'gray.800');

    return (
        <Card h="full" boxShadow="lg" bg={bg}>
            <CardBody>
                <HStack justify="space-between" mb={4} flexWrap="wrap">
                    <Heading size={{ base: "sm", md: "md" }}>{title}</Heading>
                    {badge && (
                        <Badge colorScheme="blue" fontSize={{ base: "xs", md: "sm" }}>
                            {badge}
                        </Badge>
                    )}
                </HStack>
                <Box h={height} w="full">
                    <ResponsiveContainer width="100%" height="100%">
                        {children}
                    </ResponsiveContainer>
                </Box>
            </CardBody>
        </Card>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    const bg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    if (active && payload && payload.length) {
        return (
            <Box
                bg={bg}
                p={3}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="lg"
            >
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                    {label}
                </Text>
                {payload.map((entry, index) => (
                    <Text key={index} fontSize="sm" color={entry.color}>
                        {entry.name}: {entry.value.toLocaleString()}
                    </Text>
                ))}
            </Box>
        );
    }
    return null;
};

const Dashboard = () => {
    const [data, setData] = useState({
        dashboard: null,
        patterns: null,
        products: null
    });
    const [aiInsights, setAiInsights] = useState({
        daily: null,
        weekly: null
    });
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState({
        daily: false,
        weekly: false
    });
    const toast = useToast();

    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const chartGridColor = useColorModeValue('#e2e8f0', '#4a5568');
    const chartTextColor = useColorModeValue('#4a5568', '#cbd5e0');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [dashboardData, patternsData, productsData] = await Promise.all([
                    api.dashboard.getMain(),
                    api.patterns.getAnalysis(),
                    api.products.getInsights()
                ]);

                setData({
                    dashboard: dashboardData,
                    patterns: patternsData,
                    products: productsData
                });
            } catch (error) {
                toast({
                    title: 'Error fetching data',
                    description: error.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    // Fetch AI Insights with caching
    useEffect(() => {
        const fetchAIInsights = async () => {
            // Check daily insights
            const cachedDaily = getCachedData('daily');
            if (cachedDaily) {
                setAiInsights(prev => ({ ...prev, daily: cachedDaily }));
            } else {
                try {
                    setAiLoading(prev => ({ ...prev, daily: true }));
                    // Call the daily-ai endpoint using separate axios instance
                    const response = await aiAxiosInstance.get('/api/daily-ai/');
                    const dailyInsight = response.data;
                    setAiInsights(prev => ({ ...prev, daily: dailyInsight }));
                    setCachedData('daily', dailyInsight);
                } catch (error) {
                    console.error('Error fetching daily insights:', error);
                    toast({
                        title: 'Could not load daily insights',
                        description: error.response?.data?.message || error.message || 'Failed to fetch daily insights',
                        status: 'warning',
                        duration: 3000,
                        isClosable: true,
                    });
                } finally {
                    setAiLoading(prev => ({ ...prev, daily: false }));
                }
            }

            // Check weekly insights (only on Saturday)
            if (shouldFetchWeeklyInsights()) {
                const cachedWeekly = getCachedData('weekly');
                if (cachedWeekly) {
                    setAiInsights(prev => ({ ...prev, weekly: cachedWeekly }));
                } else {
                    try {
                        setAiLoading(prev => ({ ...prev, weekly: true }));
                        // Call the weekly-ai endpoint using separate axios instance
                        const response = await aiAxiosInstance.get('/api/weekly-ai/');
                        const weeklyInsight = response.data;
                        setAiInsights(prev => ({ ...prev, weekly: weeklyInsight }));
                        setCachedData('weekly', weeklyInsight);
                    } catch (error) {
                        console.error('Error fetching weekly insights:', error);
                        toast({
                            title: 'Could not load weekly insights',
                            description: error.response?.data?.message || error.message || 'Failed to fetch weekly insights',
                            status: 'warning',
                            duration: 3000,
                            isClosable: true,
                        });
                    } finally {
                        setAiLoading(prev => ({ ...prev, weekly: false }));
                    }
                }
            } else {
                // Load cached weekly insights even if not Saturday
                const cachedWeekly = getCachedData('weekly');
                if (cachedWeekly) {
                    setAiInsights(prev => ({ ...prev, weekly: cachedWeekly }));
                }
            }
        };

        if (!loading) {
            fetchAIInsights();
        }
    }, [loading, toast]);

    if (loading) {
        return (
            <Center h="100vh" bg={bgColor}>
                <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text color="gray.600">Loading dashboard...</Text>
                </VStack>
            </Center>
        );
    }

    const { dashboard, patterns, products } = data;
    const topProduct = products?.current_year_performance?.[0];
    const topProducts = products?.current_year_performance?.slice(0, 6) || [];

    // Calculate total revenue for percentage
    const totalRevenue = topProducts.reduce((sum, p) => sum + p.total_revenue, 0);

    return (
        <Box minH="100vh" bg={bgColor} p={{ base: 3, md: 6 }} overflow="auto">
            <VStack spacing={{ base: 4, md: 8 }} align="stretch" maxW="100%">
                {/* Header */}
                <HStack justify="space-between" flexWrap="wrap" spacing={4}>
                    <VStack align="start" spacing={1}>
                        <Heading size={{ base: "lg", md: "xl" }}>Dashboard Overview</Heading>
                        <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
                            Real-time business analytics
                        </Text>
                    </VStack>
                    <Badge
                        colorScheme="green"
                        fontSize={{ base: "sm", md: "md" }}
                        p={2}
                        borderRadius="md"
                    >
                        Live Data
                    </Badge>
                </HStack>

                {/* Key Metrics - Enhanced Cards */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 6 }}>
                    <StatCardComponent
                        label="Today's Sales"
                        value={dashboard?.today_metrics?.total_sales}
                        subtext={`Yesterday: ${dashboard?.yesterday_total_sales?.toLocaleString()}`}
                        trend={dashboard?.today_metrics?.total_sales > dashboard?.yesterday_total_sales ? 'increase' : 'decrease'}
                    />

                    <StatCardComponent
                        label="Today's Orders"
                        value={dashboard?.today_metrics?.sales_count}
                        subtext={`${dashboard?.today_metrics?.unique_customers} customers`}
                    />

                    <StatCardComponent
                        label="Weekly Performance"
                        value={dashboard?.current_week_sales}
                        subtext={`Last week: ${dashboard?.last_week_sales?.toLocaleString()}`}
                        trend={dashboard?.current_week_sales > dashboard?.last_week_sales ? 'increase' : 'decrease'}
                    />

                    <StatCardComponent
                        label="All Time Revenue"
                        value={dashboard?.all_time_totals?.total_sales}
                        subtext={`${dashboard?.all_time_totals?.total_orders?.toLocaleString()} orders`}
                    />
                </SimpleGrid>

                {/* AI Insights Section */}
                <Grid
                    templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
                    gap={{ base: 4, md: 6 }}
                >
                    {/* Daily Insights */}
                    <Card boxShadow="lg" borderTop="4px solid" borderTopColor="purple.400">
                        <CardHeader pb={2}>
                            <HStack justify="space-between" flexWrap="wrap">
                                <HStack spacing={2}>
                                    <Icon as={AIIcon} boxSize={5} color="purple.500" />
                                    <Heading size={{ base: "sm", md: "md" }}>
                                        Daily Insights
                                    </Heading>
                                </HStack>
                                <Badge colorScheme="purple" fontSize="xs">
                                    AllTech AI
                                </Badge>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={2}>
                            {aiLoading.daily ? (
                                <Center py={8}>
                                    <VStack spacing={3}>
                                        <Spinner size="lg" color="purple.500" thickness="3px" />
                                        <Text fontSize="sm" color="gray.600">
                                            Analyzing today's data...
                                        </Text>
                                    </VStack>
                                </Center>
                            ) : aiInsights.daily ? (
                                <VStack align="stretch" spacing={3}>
                                    <Alert status="info" variant="left-accent" borderRadius="md">
                                        <AlertIcon />
                                        <Box flex="1">
                                            <Text fontSize={{ base: "sm", md: "md" }} whiteSpace="pre-wrap">
                                                {aiInsights.daily.message}
                                            </Text>
                                        </Box>
                                    </Alert>
                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                        Generated once per day • Updates at midnight
                                    </Text>
                                </VStack>
                            ) : (
                                <Center py={8}>
                                    <Text color="gray.500" fontSize="sm">
                                        No insights available yet
                                    </Text>
                                </Center>
                            )}
                        </CardBody>
                    </Card>

                    {/* Weekly Insights */}
                    <Card boxShadow="lg" borderTop="4px solid" borderTopColor="teal.400">
                        <CardHeader pb={2}>
                            <HStack justify="space-between" flexWrap="wrap">
                                <HStack spacing={2}>
                                    <Icon as={AIIcon} boxSize={5} color="teal.500" />
                                    <Heading size={{ base: "sm", md: "md" }}>
                                        Weekly Insights
                                    </Heading>
                                </HStack>
                                <Badge colorScheme="teal" fontSize="xs">
                                    AllTech AI
                                </Badge>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={2}>
                            {aiLoading.weekly ? (
                                <Center py={8}>
                                    <VStack spacing={3}>
                                        <Spinner size="lg" color="teal.500" thickness="3px" />
                                        <Text fontSize="sm" color="gray.600">
                                            Analyzing weekly trends...
                                        </Text>
                                    </VStack>
                                </Center>
                            ) : aiInsights.weekly ? (
                                <VStack align="stretch" spacing={3}>
                                    <Alert status="success" variant="left-accent" borderRadius="md">
                                        <AlertIcon />
                                        <Box flex="1">
                                            <Text fontSize={{ base: "sm", md: "md" }} whiteSpace="pre-wrap">
                                                {aiInsights.weekly.message}
                                            </Text>
                                        </Box>
                                    </Alert>
                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">
                                        Generated weekly on Saturdays • Valid for 7 days
                                    </Text>
                                </VStack>
                            ) : (
                                <Center py={8}>
                                    <VStack spacing={2}>
                                        <Text color="gray.500" fontSize="sm">
                                            Weekly insights available on Saturdays
                                        </Text>
                                        {!shouldFetchWeeklyInsights() && (
                                            <Text color="gray.400" fontSize="xs">
                                                Next update: This Saturday
                                            </Text>
                                        )}
                                    </VStack>
                                </Center>
                            )}
                        </CardBody>
                    </Card>
                </Grid>

                {/* Charts Section */}
                <Grid
                    templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
                    gap={{ base: 4, md: 6 }}
                >
                    {/* Top Products Bar Chart */}
                    <GridItem>
                        <ChartContainer
                            title="Top 5 Products by Revenue"
                            badge="Current Year"
                            height={{ base: "300px", md: "350px" }}
                        >
                            <BarChart
                                data={products?.current_year_performance?.slice(0, 5)}
                                margin={{ top: 20, right: 10, left: 0, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                <XAxis
                                    dataKey="product_name"
                                    tick={{ fill: chartTextColor, fontSize: 10 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar
                                    dataKey="total_revenue"
                                    fill="#3182CE"
                                    name="Revenue"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </GridItem>

                    {/* Product Distribution Pie Chart */}
                    <GridItem>
                        <ChartContainer
                            title="Revenue Distribution"
                            badge="Top 6 Products"
                            height={{ base: "300px", md: "350px" }}
                        >
                            <PieChart>
                                <Pie
                                    data={topProducts}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ product_name, percent }) =>
                                        `${product_name.substring(0, 15)}... ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="total_revenue"
                                    nameKey="product_name"
                                >
                                    {topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ChartContainer>
                    </GridItem>
                </Grid>

                {/* Product Performance Details */}
                <Grid
                    templateColumns={{ base: "1fr", xl: "2fr 1fr" }}
                    gap={{ base: 4, md: 6 }}
                >
                    {/* Top Products Table */}
                    <Card boxShadow="lg">
                        <CardBody>
                            <Heading size={{ base: "sm", md: "md" }} mb={4}>
                                Top 10 Products Performance
                            </Heading>
                            <Box overflowX="auto">
                                <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                    <Thead>
                                        <Tr>
                                            <Th fontSize={{ base: "xs", md: "sm" }}>Rank</Th>
                                            <Th fontSize={{ base: "xs", md: "sm" }}>Product</Th>
                                            <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Revenue</Th>
                                            <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                                Units
                                            </Th>
                                            <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                Share
                                            </Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {products?.current_year_performance?.slice(0, 10).map((product, index) => {
                                            const revenueShare = (product.total_revenue / totalRevenue) * 100;
                                            return (
                                                <Tr key={product.product_name}>
                                                    <Td>
                                                        <Badge
                                                            colorScheme={index < 3 ? 'green' : 'gray'}
                                                            fontSize={{ base: "xs", md: "sm" }}
                                                        >
                                                            #{index + 1}
                                                        </Badge>
                                                    </Td>
                                                    <Td
                                                        fontSize={{ base: "xs", md: "sm" }}
                                                        maxW={{ base: "150px", md: "250px" }}
                                                        isTruncated
                                                        fontWeight="medium"
                                                    >
                                                        {product.product_name}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="bold">
                                                        {product.total_revenue.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                                        {product.units_sold.toLocaleString()}
                                                    </Td>
                                                    <Td display={{ base: "none", lg: "table-cell" }}>
                                                        <VStack align="stretch" spacing={1}>
                                                            <Progress
                                                                value={revenueShare}
                                                                size="sm"
                                                                colorScheme="blue"
                                                                borderRadius="md"
                                                            />
                                                            <Text fontSize="xs" color="gray.600">
                                                                {revenueShare.toFixed(1)}%
                                                            </Text>
                                                        </VStack>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </Box>
                        </CardBody>
                    </Card>

                    {/* Quick Stats Sidebar */}
                    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                        <Card boxShadow="lg">
                            <CardBody>
                                <VStack align="stretch" spacing={3}>
                                    <Heading size={{ base: "xs", md: "sm" }}>Today's Highlights</Heading>
                                    <Divider />
                                    <HStack justify="space-between">
                                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Orders</Text>
                                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                            {dashboard?.today_metrics?.sales_count}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Items Sold</Text>
                                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                            {dashboard?.today_metrics?.total_items_sold}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Customers</Text>
                                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                            {dashboard?.today_metrics?.unique_customers}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Avg. Order</Text>
                                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                            {dashboard?.today_metrics?.sales_count > 0
                                                ? (dashboard?.today_metrics?.total_sales / dashboard?.today_metrics?.sales_count).toFixed(2)
                                                : 0}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Card boxShadow="lg">
                            <CardBody>
                                <VStack align="stretch" spacing={3}>
                                    <Heading size={{ base: "xs", md: "sm" }}>Top Performer</Heading>
                                    <Divider />
                                    <VStack align="stretch" spacing={2}>
                                        <Text
                                            fontSize={{ base: "sm", md: "md" }}
                                            fontWeight="bold"
                                            color="blue.600"
                                            noOfLines={2}
                                        >
                                            {topProduct?.product_name}
                                        </Text>
                                        <HStack justify="space-between">
                                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Revenue</Text>
                                            <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                                {topProduct?.total_revenue?.toLocaleString()}
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Units Sold</Text>
                                            <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                                {topProduct?.units_sold?.toLocaleString()}
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Customers</Text>
                                            <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                                {topProduct?.unique_customers}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Card boxShadow="lg">
                            <CardBody>
                                <Stat>
                                    <StatLabel fontSize={{ base: "xs", md: "sm" }}>All Time Performance</StatLabel>
                                    <StatNumber fontSize={{ base: "xl", md: "2xl" }}>
                                        {dashboard?.all_time_totals?.total_sales?.toLocaleString()}
                                    </StatNumber>
                                    <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                        {dashboard?.all_time_totals?.total_orders?.toLocaleString()} total orders
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    </VStack>
                </Grid>
            </VStack>
        </Box>
    );
};

export default Dashboard;