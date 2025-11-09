import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
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
    Avatar,
    Flex,
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
import { api } from '../utils/api';

const COLORS = ['#3182CE', '#38B2AC', '#805AD5', '#DD6B20', '#D69E2E'];

const StatCardComponent = ({ label, value, subtext, comparison, trend, icon }) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Card
            bg={cardBg}
            boxShadow="lg"
            borderWidth="1px"
            borderColor={borderColor}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
        >
            <CardBody>
                <Stat>
                    <HStack justify="space-between" mb={2}>
                        <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium" color="gray.600">
                            {label}
                        </StatLabel>
                        {icon && (
                            <Box fontSize="2xl" color="blue.500">
                                {icon}
                            </Box>
                        )}
                    </HStack>
                    <StatNumber fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.800" _dark={{ color: "white" }}>
                        {value?.toLocaleString() || 0}
                    </StatNumber>
                    {(comparison || subtext) && (
                        <StatHelpText display="flex" alignItems="center" gap={1} fontSize={{ base: "xs", md: "sm" }} mt={2}>
                            {trend && <StatArrow type={trend} />}
                            <Text>{subtext}</Text>
                        </StatHelpText>
                    )}
                </Stat>
            </CardBody>
        </Card>
    );
};

const ChartContainer = ({ title, subtitle, height = "400px", children }) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Card bg={cardBg} boxShadow="lg" borderWidth="1px" borderColor={borderColor} h="full">
            <CardBody>
                <VStack align="stretch" spacing={3} mb={4}>
                    <Heading size={{ base: "sm", md: "md" }}>{title}</Heading>
                    {subtitle && <Text fontSize="sm" color="gray.600">{subtitle}</Text>}
                </VStack>
                <Box h={height} w="full">
                    <ResponsiveContainer>{children}</ResponsiveContainer>
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
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const chartGridColor = useColorModeValue('#e2e8f0', '#4a5568');
    const chartTextColor = useColorModeValue('#4a5568', '#a0aec0');

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
    const topProducts = products?.current_year_performance?.slice(0, 5) || [];

    // Calculate sales trend
    const todayVsYesterday = dashboard?.today_metrics?.total_sales > dashboard?.yesterday_total_sales ? 'increase' : 'decrease';
    const weekTrend = dashboard?.current_week_sales > dashboard?.last_week_sales ? 'increase' : 'decrease';

    return (
        <Box minH="100vh" bg={bgColor} p={{ base: 3, md: 6 }} overflow="auto">
            <VStack spacing={{ base: 4, md: 8 }} align="stretch" maxW="1600px" mx="auto">
                {/* Header */}
                <Box>
                    <Heading size={{ base: "lg", md: "xl" }} mb={2}>
                        Dashboard Overview
                    </Heading>
                    <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                        Welcome back! Here's what's happening with your sales today.
                    </Text>
                </Box>

                {/* Key Metrics */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 6 }}>
                    <StatCardComponent
                        label="Today's Sales"
                        value={dashboard?.today_metrics?.total_sales}
                        subtext={`vs Yesterday (${dashboard?.yesterday_total_sales?.toLocaleString()})`}
                        trend={todayVsYesterday}
                        icon="💰"
                    />
                    <StatCardComponent
                        label="Today's Orders"
                        value={dashboard?.today_metrics?.sales_count}
                        subtext={`${dashboard?.today_metrics?.total_items_sold} items sold`}
                        icon="📦"
                    />
                    <StatCardComponent
                        label="Weekly Performance"
                        value={dashboard?.current_week_sales}
                        subtext={`Last week: ${dashboard?.last_week_sales?.toLocaleString()}`}
                        trend={weekTrend}
                        icon="📈"
                    />
                    <StatCardComponent
                        label="Top Product"
                        value={topProduct?.total_revenue}
                        subtext={topProduct?.product_name?.substring(0, 30)}
                        icon="⭐"
                    />
                </SimpleGrid>

                {/* Charts Section */}
                <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={{ base: 4, md: 6 }}>
                    {/* Top Products Chart */}
                    <ChartContainer
                        title="Top 5 Products Performance"
                        subtitle="Current year revenue breakdown"
                        height={{ base: "300px", md: "400px" }}
                    >
                        <BarChart
                            data={topProducts}
                            margin={{ top: 20, right: 10, left: 0, bottom: 80 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                            <XAxis
                                dataKey="product_name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fill: chartTextColor, fontSize: 10 }}
                                interval={0}
                            />
                            <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} width={60} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                            <Bar
                                dataKey="total_revenue"
                                fill="#3182CE"
                                name="Revenue"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ChartContainer>

                    {/* Quick Stats Card */}
                    <Card boxShadow="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <Heading size={{ base: "sm", md: "md" }}>Quick Stats</Heading>
                                <Divider />

                                <Box>
                                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                                        Today's Customers
                                    </Text>
                                    <HStack justify="space-between">
                                        <Text fontSize="2xl" fontWeight="bold">
                                            {dashboard?.today_metrics?.unique_customers}
                                        </Text>
                                        <Badge colorScheme="green" fontSize="sm">Active</Badge>
                                    </HStack>
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                                        All Time Revenue
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold">
                                        {dashboard?.all_time_totals?.total_sales?.toLocaleString()}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        {dashboard?.all_time_totals?.total_orders?.toLocaleString()} total orders
                                    </Text>
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                                        Average Order Value
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold">
                                        {(dashboard?.today_metrics?.total_sales / dashboard?.today_metrics?.sales_count || 0).toFixed(2)}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        Today's average
                                    </Text>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Product Performance Details */}
                <Card boxShadow="lg" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                    <CardBody>
                        <Heading size={{ base: "sm", md: "md" }} mb={4}>
                            Top Products Breakdown
                        </Heading>
                        <VStack spacing={4} align="stretch">
                            {topProducts.map((product, index) => {
                                const maxRevenue = topProducts[0]?.total_revenue || 1;
                                const percentage = (product.total_revenue / maxRevenue) * 100;

                                return (
                                    <Box key={index}>
                                        <HStack justify="space-between" mb={2}>
                                            <HStack spacing={3} flex={1}>
                                                <Avatar
                                                    size="sm"
                                                    name={product.product_name}
                                                    bg={COLORS[index % COLORS.length]}
                                                />
                                                <VStack align="start" spacing={0} flex={1}>
                                                    <Text
                                                        fontSize={{ base: "xs", md: "sm" }}
                                                        fontWeight="semibold"
                                                        noOfLines={1}
                                                    >
                                                        {product.product_name}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {product.units_sold} units sold
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <VStack align="end" spacing={0}>
                                                <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                                                    {product.total_revenue.toLocaleString()}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {product.unique_customers} customers
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        <Progress
                                            value={percentage}
                                            size="sm"
                                            colorScheme="blue"
                                            borderRadius="full"
                                        />
                                    </Box>
                                );
                            })}
                        </VStack>
                    </CardBody>
                </Card>

                {/* Additional Insights */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 3, md: 6 }}>
                    <Card boxShadow="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                        <CardBody>
                            <VStack align="start" spacing={3}>
                                <Heading size="sm">📊 Sales Velocity</Heading>
                                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                                    {(dashboard?.today_metrics?.total_sales / Math.max(new Date().getHours(), 1)).toFixed(0)}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    Average sales per hour today
                                </Text>
                            </VStack>
                        </CardBody>
                    </Card>

                    <Card boxShadow="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                        <CardBody>
                            <VStack align="start" spacing={3}>
                                <Heading size="sm">🎯 Conversion Rate</Heading>
                                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                                    {dashboard?.today_metrics?.sales_count > 0
                                        ? ((dashboard?.today_metrics?.unique_customers / dashboard?.today_metrics?.sales_count) * 100).toFixed(1)
                                        : 0}%
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    Customer to order ratio
                                </Text>
                            </VStack>
                        </CardBody>
                    </Card>

                    <Card boxShadow="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                        <CardBody>
                            <VStack align="start" spacing={3}>
                                <Heading size="sm">📦 Items per Order</Heading>
                                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                                    {(dashboard?.today_metrics?.total_items_sold / dashboard?.today_metrics?.sales_count || 0).toFixed(1)}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    Average items per transaction
                                </Text>
                            </VStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>
            </VStack>
        </Box>
    );
};

export default Dashboard;