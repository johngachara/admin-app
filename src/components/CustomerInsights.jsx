import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    GridItem,
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
} from '@chakra-ui/react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { api } from '../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CustomerInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

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
                <Spinner size="xl" />
            </Center>
        );
    }

    return (
        <Box>
            <Heading mb={6}>Customer Insights</Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Customers</StatLabel>
                            <StatNumber>
                                {data?.current_year_top_customers?.length}
                            </StatNumber>
                            <StatHelpText>Current Year Active</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Average Customer Value</StatLabel>
                            <StatNumber>
                                {(data?.current_year_top_customers?.[0]?.total_spent / data?.current_year_top_customers?.length || 0).toFixed(2)}
                            </StatNumber>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Top Customer Spent</StatLabel>
                            <StatNumber>
                                {data?.current_year_top_customers?.[0]?.total_spent.toFixed(2)}
                            </StatNumber>
                        </Stat>
                    </CardBody>
                </Card>

            </SimpleGrid>

            <Box width="100%">
                <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={8} width="100%">
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                        <Card>
                            <CardBody>
                                <Heading size="md" mb={4}>
                                    Top Customer Distribution
                                </Heading>
                                <Box h="400px">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.current_year_top_customers?.slice(0, 10) || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="customer_name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => [value.toFixed(2)]} />
                                            <Legend />
                                            <Bar name="Total Spent" dataKey="total_spent" fill="#3182ce" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardBody>
                        </Card>
                    </GridItem>
                </Grid>
            </Box>
            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>Top Customer Details</Heading>
                    <Box overflowX="auto">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Customer</Th>
                                    <Th isNumeric>Total Spent</Th>
                                    <Th isNumeric>Orders</Th>
                                    <Th isNumeric>Avg Order Value</Th>
                                    <Th>First Purchase</Th>
                                    <Th>Last Purchase</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.current_year_top_customers?.map((customer) => (
                                    <Tr key={customer.customer_name}>
                                        <Td>{customer.customer_name}</Td>
                                        <Td isNumeric>{customer.total_spent.toFixed(2)}</Td>
                                        <Td isNumeric>{customer.purchase_count}</Td>
                                        <Td isNumeric>{customer.average_order_value.toFixed(2)}</Td>
                                        <Td>{new Date(customer.first_purchase).toLocaleDateString()}</Td>
                                        <Td>{new Date(customer.last_purchase).toLocaleDateString()}</Td>
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