import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardBody,
    Heading,
    Spinner,
    Center,
    useToast,
    SimpleGrid,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { api } from '../utils/api';

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
                maxW="250px"
            >
                <Text fontSize="sm" fontWeight="bold" mb={1} noOfLines={2}>
                    {label}
                </Text>
                <Text fontSize="sm" color="blue.500">
                    Revenue: {payload[0].value.toLocaleString()}
                </Text>
            </Box>
        );
    }
    return null;
};

const ProductInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const chartGridColor = useColorModeValue('gray.200', 'gray.600');
    const chartTextColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.products.getInsights();
                setData(response);
            } catch (error) {
                toast({
                    title: 'Error fetching product data',
                    description: error.message,
                    status: 'error',
                    duration: 9000,
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
            <Center h="100vh">
                <Spinner size="xl" thickness="4px" color="blue.500" />
            </Center>
        );
    }

    const topProduct = data?.current_year_performance?.[0];
    const topAllTime = data?.all_time_performance?.[0];

    // Calculate year-over-year growth for top product
    const topProductGrowth = data?.growth_comparison?.reduce((acc, item) => {
        if (item.product_name === topProduct?.product_name) {
            if (item.year === data.current_year) acc.current = item.total_revenue;
            else acc.previous = item.total_revenue;
        }
        return acc;
    }, { current: 0, previous: 0 });

    const growthPercent = topProductGrowth?.previous
        ? ((topProductGrowth.current - topProductGrowth.previous) / topProductGrowth.previous) * 100
        : 0;

    return (
        <Box p={{ base: 3, md: 6 }} height="100%" overflow="auto">
            <Heading mb={6} size={{ base: "md", md: "lg" }}>
                Product Insights ({data?.current_year})
            </Heading>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }} mb={8}>
                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Top Product Revenue
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {topProduct?.total_revenue.toLocaleString()}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                <StatArrow type={growthPercent >= 0 ? 'increase' : 'decrease'} />
                                {Math.abs(growthPercent).toFixed(1)}% vs last year
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Top Product Units
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {topProduct?.units_sold.toLocaleString()}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                {topProduct?.product_name}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Average Price
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {topProduct?.average_price.toFixed(2)}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                {topProduct?.total_orders} orders
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                Customer Reach
                            </StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {topProduct?.unique_customers}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                                unique customers
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Card boxShadow="md" mb={{ base: 4, md: 8 }}>
                <CardBody>
                    <Heading size={{ base: "sm", md: "md" }} mb={4}>
                        Year-over-Year Growth
                    </Heading>
                    <Box h={{ base: "300px", md: "400px" }} overflowX="auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data?.growth_comparison || []}
                                margin={{ top: 20, right: 10, left: 0, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                <XAxis
                                    dataKey="product_name"
                                    tick={{ fill: chartTextColor, fontSize: 10 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fill: chartTextColor, fontSize: 11 }}
                                    width={60}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                <Bar
                                    name="Revenue"
                                    dataKey="total_revenue"
                                    fill="#3182ce"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardBody>
            </Card>

            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    <Tab fontSize={{ base: "xs", md: "sm" }}>Current Year Performance</Tab>
                    <Tab fontSize={{ base: "xs", md: "sm" }}>All-Time Performance</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel p={0} pt={4}>
                        <Card boxShadow="md">
                            <CardBody>
                                <Box overflowX="auto">
                                    <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                        <Thead>
                                            <Tr>
                                                <Th fontSize={{ base: "xs", md: "sm" }}>Product</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Revenue</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Units</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Avg Price</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Orders</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Customers</Th>
                                                <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>First Sale</Th>
                                                <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>Last Sale</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {data?.current_year_performance?.map((product) => (
                                                <Tr key={product.product_name}>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} maxW={{ base: "120px", md: "200px" }} isTruncated>
                                                        {product.product_name}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                                        {product.total_revenue.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
                                                        {product.units_sold.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                                        {product.average_price.toFixed(2)}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                        {product.total_orders}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                        {product.unique_customers}
                                                    </Td>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                                                        {new Date(product.first_sale).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Td>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                                                        {new Date(product.last_sale).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <Card boxShadow="md">
                            <CardBody>
                                <Box overflowX="auto">
                                    <Table variant="simple" size={{ base: "sm", md: "md" }}>
                                        <Thead>
                                            <Tr>
                                                <Th fontSize={{ base: "xs", md: "sm" }}>Product</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Revenue</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Units</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Avg Price</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Orders</Th>
                                                <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Customers</Th>
                                                <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>First Sale</Th>
                                                <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>Last Sale</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {data?.all_time_performance?.map((product) => (
                                                <Tr key={product.product_name}>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} maxW={{ base: "120px", md: "200px" }} isTruncated>
                                                        {product.product_name}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                                        {product.total_revenue.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
                                                        {product.units_sold.toLocaleString()}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                                        {product.average_price.toFixed(2)}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                        {product.total_orders}
                                                    </Td>
                                                    <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                                        {product.unique_customers}
                                                    </Td>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                                                        {new Date(product.first_sale).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Td>
                                                    <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", xl: "table-cell" }}>
                                                        {new Date(product.last_sale).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default ProductInsights;