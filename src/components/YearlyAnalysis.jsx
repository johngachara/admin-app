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
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
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

const YearlyAnalysis = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.yearly.getAnalysis();
                setData(response);
            } catch (error) {
                toast({
                    title: 'Error fetching yearly data',
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

    const currentYearData = data?.current_year_summary;
    const previousYearData = data?.yearly_summary?.[1];
    const yearOverYearChange = currentYearData && previousYearData
        ? ((currentYearData.total_sales - previousYearData.total_sales) / previousYearData.total_sales) * 100
        : 0;

    return (
        <Box>
            <Heading mb={6}>Yearly Analysis</Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Annual Revenue</StatLabel>
                            <StatNumber>{currentYearData?.total_sales.toFixed(2)}</StatNumber>
                            <StatHelpText>
                                <StatArrow type={yearOverYearChange >= 0 ? 'increase' : 'decrease'} />
                                {Math.abs(yearOverYearChange).toFixed(1)}% from last year
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Orders</StatLabel>
                            <StatNumber>{currentYearData?.total_orders}</StatNumber>
                            <StatHelpText>{currentYearData?.average_order_value.toFixed(2)} avg. order</StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Total Customers</StatLabel>
                            <StatNumber>{currentYearData?.unique_customers}</StatNumber>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <StatLabel>Items Sold</StatLabel>
                            <StatNumber>{currentYearData?.total_items}</StatNumber>
                            <StatHelpText>
                                {(currentYearData?.total_items / currentYearData?.total_orders).toFixed(1)} items per order
                            </StatHelpText>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={8}>
                <GridItem>
                    <Card>
                        <CardBody>
                            <Heading size="md" mb={4}>Monthly Revenue Distribution</Heading>
                            <Box h="400px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.monthly_breakdown || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [ value.toFixed(2)]} />
                                        <Legend />
                                        <Bar
                                            name="Monthly Sales"
                                            dataKey="sales"
                                            fill="#3182ce"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card>
                        <CardBody>
                            <Heading size="md" mb={4}>Year-over-Year Growth</Heading>
                            <Box h="400px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data?.yearly_summary || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [ value.toFixed(2)]} />
                                        <Legend />
                                        <Line
                                            name="Annual Revenue"
                                            type="monotone"
                                            dataKey="total_sales"
                                            stroke="#3182ce"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>Historical Performance</Heading>
                    <Box overflowX="auto">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Year</Th>
                                    <Th isNumeric>Total Revenue</Th>
                                    <Th isNumeric>Orders</Th>
                                    <Th isNumeric>Customers</Th>
                                    <Th isNumeric>Avg Order Value</Th>
                                    <Th isNumeric>Items Sold</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {data?.yearly_summary?.map((year) => (
                                    <Tr key={year.year}>
                                        <Td>{year.year}</Td>
                                        <Td isNumeric>{year.total_sales.toFixed(2)}</Td>
                                        <Td isNumeric>{year.total_orders}</Td>
                                        <Td isNumeric>{year.unique_customers}</Td>
                                        <Td isNumeric>{year.average_order_value.toFixed(2)}</Td>
                                        <Td isNumeric>{year.total_items}</Td>
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

export default YearlyAnalysis;