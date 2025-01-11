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
    StatArrow,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from '@chakra-ui/react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { api } from '../utils/api';

const ProductInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

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
                <Spinner size="xl" />
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

    const growthPercent = topProductGrowth.previous
        ? ((topProductGrowth.current - topProductGrowth.previous) / topProductGrowth.previous) * 100
        : 0;

    return (
        <Box p={4}>
            <Heading mb={6}>Product Insights ({data?.current_year})</Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Top Product Revenue</StatLabel>
                            <StatNumber>{topProduct?.total_revenue.toLocaleString()}</StatNumber>
                            <StatHelpText>
                                <StatArrow type={growthPercent >= 0 ? 'increase' : 'decrease'} />
                                {Math.abs(growthPercent).toFixed(1)}% vs last year
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Top Product Units</StatLabel>
                            <StatNumber>{topProduct?.units_sold.toLocaleString()}</StatNumber>
                            <StatHelpText>{topProduct?.product_name}</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Average Price</StatLabel>
                            <StatNumber>{topProduct?.average_price.toFixed(2)}</StatNumber>
                            <StatHelpText>{topProduct?.total_orders} orders</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Customer Reach</StatLabel>
                            <StatNumber>{topProduct?.unique_customers}</StatNumber>
                            <StatHelpText>unique customers</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Grid templateColumns={{ base: "1fr" }} gap={8} mb={8}>
                <GridItem>
                    <Card>
                        <CardBody>
                            <Heading size="md" mb={4}>Year-over-Year Growth</Heading>
                            <Box h="400px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.growth_comparison || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="product_name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [ value.toLocaleString()]} />
                                        <Legend />
                                        <Bar
                                            name="Revenue"
                                            dataKey="total_revenue"
                                            fill="#3182ce"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            <Tabs>
                <TabList>
                    <Tab>Current Year Performance</Tab>
                    <Tab>All-Time Performance</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel p={0} pt={4}>
                        <Card>
                            <CardBody>
                                <Box overflowX="auto">
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Product</Th>
                                                <Th isNumeric>Revenue</Th>
                                                <Th isNumeric>Units Sold</Th>
                                                <Th isNumeric>Avg Price</Th>
                                                <Th isNumeric>Orders</Th>
                                                <Th isNumeric>Customers</Th>
                                                <Th>First Sale</Th>
                                                <Th>Last Sale</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {data?.current_year_performance?.map((product) => (
                                                <Tr key={product.product_name}>
                                                    <Td>{product.product_name}</Td>
                                                    <Td isNumeric>{product.total_revenue.toLocaleString()}</Td>
                                                    <Td isNumeric>{product.units_sold.toLocaleString()}</Td>
                                                    <Td isNumeric>{product.average_price.toFixed(2)}</Td>
                                                    <Td isNumeric>{product.total_orders}</Td>
                                                    <Td isNumeric>{product.unique_customers}</Td>
                                                    <Td>{new Date(product.first_sale).toLocaleDateString()}</Td>
                                                    <Td>{new Date(product.last_sale).toLocaleDateString()}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <Card>
                            <CardBody>
                                <Box overflowX="auto">
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Product</Th>
                                                <Th isNumeric>Revenue</Th>
                                                <Th isNumeric>Units Sold</Th>
                                                <Th isNumeric>Avg Price</Th>
                                                <Th isNumeric>Orders</Th>
                                                <Th isNumeric>Customers</Th>
                                                <Th>First Sale</Th>
                                                <Th>Last Sale</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {data?.all_time_performance?.map((product) => (
                                                <Tr key={product.product_name}>
                                                    <Td>{product.product_name}</Td>
                                                    <Td isNumeric>{product.total_revenue.toLocaleString()}</Td>
                                                    <Td isNumeric>{product.units_sold.toLocaleString()}</Td>
                                                    <Td isNumeric>{product.average_price.toFixed(2)}</Td>
                                                    <Td isNumeric>{product.total_orders}</Td>
                                                    <Td isNumeric>{product.unique_customers}</Td>
                                                    <Td>{new Date(product.first_sale).toLocaleDateString()}</Td>
                                                    <Td>{new Date(product.last_sale).toLocaleDateString()}</Td>
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