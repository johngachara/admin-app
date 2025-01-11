import React, { useEffect, useState } from 'react';
import {
    Box,
    Select,
    Grid,
    GridItem,
    Card,
    CardBody,
    Heading,
    Spinner,
    Center,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Stack,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    SimpleGrid,
    useToast,
} from '@chakra-ui/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
} from 'recharts';
import { api } from '../utils/api';

const WeeklyAnalysis = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weeks, setWeeks] = useState(8);
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.weekly.getAnalysis(weeks);
                setData(response);
            } catch (error) {
                toast({
                    title: 'Error fetching weekly data',
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
    }, [weeks, toast]);

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    const currentWeek = data?.weekly_summary?.[0];
    const previousWeek = data?.weekly_summary?.[1];
    const salesChange = currentWeek && previousWeek
        ? ((currentWeek.total_sales - previousWeek.total_sales) / previousWeek.total_sales) * 100
        : 0;

    return (
        <Box p={4}>
            <Stack spacing={8}>
                <Stack direction="row" justify="space-between" align="center">
                    <Heading>Weekly Analysis ({data?.current_year})</Heading>
                    <Select
                        value={weeks}
                        onChange={(e) => setWeeks(Number(e.target.value))}
                        width="200px"
                    >
                        <option value={4}>Last 4 weeks</option>
                        <option value={8}>Last 8 weeks</option>
                        <option value={12}>Last 12 weeks</option>
                        <option value={26}>Last 26 weeks</option>
                    </Select>
                </Stack>

                {/* Key Metrics */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Weekly Sales</StatLabel>
                                <StatNumber>{currentWeek?.total_sales.toLocaleString()}</StatNumber>
                                <StatHelpText>
                                    <StatArrow type={salesChange >= 0 ? 'increase' : 'decrease'} />
                                    {Math.abs(salesChange).toFixed(1)}% from last week
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Total Orders</StatLabel>
                                <StatNumber>{currentWeek?.total_orders}</StatNumber>
                                <StatHelpText>
                                    {currentWeek?.total_items} items sold
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Unique Customers</StatLabel>
                                <StatNumber>{currentWeek?.unique_customers}</StatNumber>
                                <StatHelpText>
                                    Active buyers this week
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Average Order Value</StatLabel>
                                <StatNumber>
                                    {currentWeek?.average_order_value.toFixed(2)}
                                </StatNumber>
                                <StatHelpText>
                                    Per order average
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Charts Grid */}
                <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                    {/* Weekly Sales Trend */}
                    <GridItem>
                        <Card>
                            <CardBody>
                                <Heading size="md" mb={4}>Weekly Sales Trend</Heading>
                                <Box h="400px">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.weekly_summary || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="week"
                                                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                                formatter={(value) => [ value.toLocaleString()]}
                                            />
                                            <Legend />
                                            <Bar
                                                name="Total Sales"
                                                dataKey="total_sales"
                                                fill="#3182ce"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardBody>
                        </Card>
                    </GridItem>

                    {/* Previous Year Comparison */}
                    <GridItem>
                        <Card>
                            <CardBody>
                                <Heading size="md" mb={4}>Previous Year Sales</Heading>
                                <Box h="400px">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data?.previous_year_comparison || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="week"
                                                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                                formatter={(value) => [ value.toLocaleString()]}
                                            />
                                            <Legend />
                                            <Line
                                                name="Previous Year Sales"
                                                type="monotone"
                                                dataKey="total_sales"
                                                stroke="#805AD5"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardBody>
                        </Card>
                    </GridItem>
                </Grid>

                {/* Weekly Summary Table */}
                <Card>
                    <CardBody>
                        <Heading size="md" mb={4}>Current Period Performance</Heading>
                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Week Starting</Th>
                                        <Th isNumeric>Total Sales</Th>
                                        <Th isNumeric>Orders</Th>
                                        <Th isNumeric>Unique Customers</Th>
                                        <Th isNumeric>Avg Order Value</Th>
                                        <Th>Busiest Day</Th>
                                        <Th>Slowest Day</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {data?.weekly_summary?.map((week) => (
                                        <Tr key={week.week}>
                                            <Td>{new Date(week.week).toLocaleDateString()}</Td>
                                            <Td isNumeric>{week.total_sales.toLocaleString()}</Td>
                                            <Td isNumeric>{week.total_orders}</Td>
                                            <Td isNumeric>{week.unique_customers}</Td>
                                            <Td isNumeric>{week.average_order_value.toFixed(2)}</Td>
                                            <Td>{new Date(week.busiest_day).toLocaleDateString()}</Td>
                                            <Td>{new Date(week.slowest_day).toLocaleDateString()}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>

                {/* Previous Year Table */}
                <Card>
                    <CardBody>
                        <Heading size="md" mb={4}>Previous Year Comparison</Heading>
                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Week Starting</Th>
                                        <Th isNumeric>Total Sales</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {data?.previous_year_comparison?.map((week) => (
                                        <Tr key={week.week}>
                                            <Td>{new Date(week.week).toLocaleDateString()}</Td>
                                            <Td isNumeric>{week.total_sales.toLocaleString()}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>
            </Stack>
        </Box>
    );
};

export default WeeklyAnalysis;