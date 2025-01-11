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
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Text,
    Divider,
    Container,
    useColorModeValue,
    VStack,
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
    ComposedChart,
} from 'recharts';
import { api } from '../utils/api';

// Reusable Components
const StatCardComponent = ({ label, value, subtext, comparison, trend }) => (
    <Card boxShadow="sm" transition="all 0.3s" _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}>
        <CardBody>
            <Stat>
                <StatLabel fontSize="sm" color="gray.600">{label}</StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" my={2}>{value?.toLocaleString() || 0}</StatNumber>
                {(comparison || subtext) && (
                    <StatHelpText display="flex" alignItems="center" gap={1}>
                        {trend && <StatArrow type={trend} />}
                        {subtext}
                    </StatHelpText>
                )}
            </Stat>
        </CardBody>
    </Card>
);

const ChartContainer = ({ title, height = "400px", children }) => (
    <Card h="full">
        <CardBody>
            <Heading size="md" mb={4}>{title}</Heading>
            <Box h={height} w="full">
                <ResponsiveContainer>{children}</ResponsiveContainer>
            </Box>
        </CardBody>
    </Card>
);

const Dashboard = () => {
    // States
    const [data, setData] = useState({
        dashboard: null,
        patterns: null,
        products: null
    });
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    // Theme values
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const chartGridColor = useColorModeValue('#e0e0e0', '#4a5568');
    const lineColor = useColorModeValue('#3182ce', '#63b3ed');

    // Data fetching
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
    }, []);

    if (loading) {
        return (
            <Center h="100vh" bg={bgColor}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
        );
    }

    // Utility functions
    const formatHour = (hour) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}${ampm}`;
    };

    const { dashboard, patterns, products } = data;
    const topProduct = products?.current_year_performance?.[0];
    const peakHour = patterns?.hourly_patterns?.reduce((max, hour) =>
        hour.total_sales > max.total_sales ? hour : max
    );

    return (
        <Box minH="100vh" bg={bgColor} p={{ base: 4, lg: 6 }} maxW="100%">
            <Container  maxWidth="100%">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <Heading>Dashboard Overview</Heading>

                    {/* Key Metrics */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                        <StatCardComponent
                            label="Today's Sales"
                            value={dashboard?.today_metrics?.total_sales}
                            subtext={`vs Yesterday (${dashboard?.yesterday_total_sales?.toLocaleString()})`}
                            trend={dashboard?.today_metrics?.total_sales > dashboard?.yesterday_total_sales ? 'increase' : 'decrease'}
                        />
                        <StatCardComponent
                            label="Peak Hour Sales"
                            value={peakHour?.total_sales}
                            subtext={`at ${formatHour(peakHour?.hour)}`}
                        />
                        <StatCardComponent
                            label="Top Product"
                            value={topProduct?.total_revenue}
                            subtext={topProduct?.product_name}
                        />
                        <StatCardComponent
                            label="Weekly Performance"
                            value={dashboard?.current_week_sales}
                            subtext="vs last week"
                            trend={dashboard?.current_week_sales > dashboard?.last_week_sales ? 'increase' : 'decrease'}
                        />
                    </SimpleGrid>

                    {/* Main Content */}
                    <Tabs isLazy colorScheme="blue">
                        <TabList>
                            <Tab>Sales Overview</Tab>
                            <Tab>Product Performance</Tab>

                        </TabList>

                        <TabPanels>
                            {/* Sales Overview Tab */}
                            <TabPanel p={0} pt={6}>
                                <Grid templateColumns={{ base: "1fr", xl: "3fr 1fr" }} gap={6}>
                                    <VStack spacing={6}>
                                        <Card w="full">
                                            <CardBody>
                                                <VStack align="start" spacing={3}>
                                                    <Text fontWeight="bold">Today's Details</Text>
                                                    <Divider />
                                                    <Text>Orders: {dashboard?.today_metrics?.sales_count}</Text>
                                                    <Text>Items: {dashboard?.today_metrics?.total_items_sold}</Text>
                                                    <Text>Customers: {dashboard?.today_metrics?.unique_customers}</Text>
                                                </VStack>
                                            </CardBody>
                                        </Card>

                                        <Card w="full">
                                            <CardBody>
                                                <Stat>
                                                    <StatLabel>All Time Stats</StatLabel>
                                                    <StatNumber>{dashboard?.all_time_totals?.total_sales?.toLocaleString()}</StatNumber>
                                                    <StatHelpText>
                                                        {dashboard?.all_time_totals?.total_orders?.toLocaleString()} orders
                                                    </StatHelpText>
                                                </Stat>
                                            </CardBody>
                                        </Card>
                                    </VStack>
                                </Grid>
                            </TabPanel>

                            {/* Product Performance Tab */}
                            <TabPanel p={0} pt={6}>
                                <Grid templateColumns={{ base: "1fr", xl: "3fr 2fr" }} gap={6}>
                                    <ChartContainer title="Top Products Revenue">
                                        <BarChart data={products?.current_year_performance?.slice(0, 5)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                            <XAxis dataKey="product_name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                                            <Legend />
                                            <Bar dataKey="total_revenue" fill={lineColor} name="Revenue" />
                                        </BarChart>
                                    </ChartContainer>
                                </Grid>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Container>
        </Box>
    );
};

export default Dashboard;