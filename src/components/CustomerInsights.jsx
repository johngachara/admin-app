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
            >
                <Text fontSize="sm" fontWeight="bold" mb={1} noOfLines={2}>
                    {label}
                </Text>
                <Text fontSize="sm" color="blue.500">
                    Total: {payload[0].value.toFixed(2)}
                </Text>
            </Box>
        );
    }
    return null;
};

const CustomerInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const chartGridColor = useColorModeValue('gray.200', 'gray.600');
    const chartTextColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.customers.getInsights();
                setData(response);
            } catch (error) {
                toast({
                    title: 'Error fetching customer data',
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

    const totalCustomers = data?.current_year_top_customers?.length || 0;
    const totalSpent = data?.current_year_top_customers?.reduce((sum, c) => sum + c.total_spent, 0) || 0;
    const avgCustomerValue = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
    const topCustomer = data?.current_year_top_customers?.[0];

    return (
        <Box p={{ base: 3, md: 6 }} height="100%" overflow="auto">
            <Heading mb={6} size={{ base: "md", md: "lg" }}>Customer Insights</Heading>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 3, md: 4 }} mb={8}>
                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">Total Customers</StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {totalCustomers}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>Current Year Active</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">Average Customer Value</StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {avgCustomerValue.toFixed(2)}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }}>Per customer</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card boxShadow="sm">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">Top Customer Spent</StatLabel>
                            <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                                {topCustomer?.total_spent.toFixed(2)}
                            </StatNumber>
                            <StatHelpText fontSize={{ base: "xs", md: "sm" }} noOfLines={1}>
                                {topCustomer?.customer_name}
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Card boxShadow="md" mb={{ base: 4, md: 8 }}>
                <CardBody>
                    <Heading size={{ base: "sm", md: "md" }} mb={4}>
                        Top 10 Customer Distribution
                    </Heading>
                    <Box h={{ base: "300px", md: "400px" }} overflowX="auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data?.current_year_top_customers?.slice(0, 10) || []}
                                margin={{ top: 20, right: 10, left: 0, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                <XAxis
                                    dataKey="customer_name"
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
                                    name="Total Spent"
                                    dataKey="total_spent"
                                    fill="#3182ce"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardBody>
            </Card>

            <Card boxShadow="md">
                <CardBody>
                    <Heading size={{ base: "sm", md: "md" }} mb={4}>Top Customer Details</Heading>
                    <Box overflowX="auto">
                        <Table variant="simple" size={{ base: "sm", md: "md" }}>
                            <Thead>
                                <Tr>
                                    <Th fontSize={{ base: "xs", md: "sm" }}>Customer</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Total Spent</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Orders</Th>
                                    <Th isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>Avg Order</Th>
                                    <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>First Purchase</Th>
                                    <Th fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>Last Purchase</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.current_year_top_customers?.map((customer) => (
                                    <Tr key={customer.customer_name}>
                                        <Td fontSize={{ base: "xs", md: "sm" }} maxW={{ base: "120px", md: "200px" }} isTruncated>
                                            {customer.customer_name}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold">
                                            {customer.total_spent.toFixed(2)}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
                                            {customer.purchase_count}
                                        </Td>
                                        <Td isNumeric fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", md: "table-cell" }}>
                                            {customer.average_order_value.toFixed(2)}
                                        </Td>
                                        <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                            {new Date(customer.first_purchase).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Td>
                                        <Td fontSize={{ base: "xs", md: "sm" }} display={{ base: "none", lg: "table-cell" }}>
                                            {new Date(customer.last_purchase).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </CardBody>
            </Card>
        </Box>
    );
};

export default CustomerInsights;