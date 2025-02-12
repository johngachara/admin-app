import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
    Box,
    Select,
    Grid,
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
    VStack,
    HStack,
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
    LineChart,
    Line,
    Legend,
} from 'recharts';
import { api } from '../utils/api';

const formatDateToReadable = (dateString) => {
    const date = parseISO(dateString);
    return format(date, 'do MMM yyyy');
};

const StatCard = ({ label, value, helpText, trend, trendValue }) => (
    <Card height="full">
        <CardBody>
            <Stat>
                <StatLabel fontSize="sm" color="gray.600">{label}</StatLabel>
                <StatNumber fontSize="2xl" my={2}>{value}</StatNumber>
                <StatHelpText display="flex" alignItems="center" gap={1}>
                    {trend && <StatArrow type={trend} />}
                    {helpText}
                    {trendValue && `${Math.abs(trendValue).toFixed(1)}%`}
                </StatHelpText>
            </Stat>
        </CardBody>
    </Card>
);

const ChartCard = ({ title, height = "400px", children }) => (
    <Card height="full">
        <CardBody>
            <Heading size="md" mb={4}>{title}</Heading>
            <Box height={height}>
                <ResponsiveContainer>{children}</ResponsiveContainer>
            </Box>
        </CardBody>
    </Card>
);

const WeeklyAnalysis = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weeks, setWeeks] = useState(8);
    const toast = useToast();
    const chartGridColor = useColorModeValue('gray.200', 'gray.600');

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
                <Spinner size="xl" thickness="4px" />
            </Center>
        );
    }

    const currentWeek = data?.weekly_summary?.[0];
    const previousWeek = data?.weekly_summary?.[1];
    const salesChange = currentWeek && previousWeek
        ? ((currentWeek.total_sales - previousWeek.total_sales) / previousWeek.total_sales) * 100
        : 0;

    return (
        <Box
            height="100%"
            p={6}
            overflow="auto"
        >
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between" align="center">
                    <Heading size="lg">Weekly Analysis ({data?.current_year})</Heading>
                    <Select
                        value={weeks}
                        onChange={(e) => setWeeks(Number(e.target.value))}
                        width="200px"
                        size="md"
                    >
                        <option value={4}>Last 4 weeks</option>
                        <option value={8}>Last 8 weeks</option>
                        <option value={12}>Last 12 weeks</option>
                        <option value={26}>Last 26 weeks</option>
                    </Select>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    <StatCard
                        label="Weekly Sales"
                        value={currentWeek?.total_sales.toLocaleString()}
                        trend={salesChange >= 0 ? 'increase' : 'decrease'}
                        trendValue={salesChange}
                        helpText="from last week"
                    />
                    <StatCard
                        label="Total Orders"
                        value={currentWeek?.total_orders}
                        helpText={`${currentWeek?.total_items} items sold`}
                    />
                    <StatCard
                        label="Unique Customers"
                        value={currentWeek?.unique_customers}
                        helpText="Active buyers this week"
                    />
                    <StatCard
                        label="Average Order Value"
                        value={currentWeek?.average_order_value.toFixed(2)}
                        helpText="Per order average"
                    />
                </SimpleGrid>

                <Box width="full">
                    <ChartCard title="Weekly Sales Trend">
                        <BarChart
                            data={data?.weekly_summary || []}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                            <XAxis
                                dataKey="week"
                                tickFormatter={formatDateToReadable}
                                height={60}
                                tick={{ angle: -45, textAnchor: 'end' }}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={formatDateToReadable}
                                formatter={(value) => [value.toLocaleString(), "Sales"]}
                            />
                            <Legend />
                            <Bar
                                name="Week"
                                dataKey="total_sales"
                                fill="#3182CE"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartCard>
                </Box>

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
                                            <Td>{formatDateToReadable(week.week)}</Td>
                                            <Td isNumeric>{week.total_sales.toLocaleString()}</Td>
                                            <Td isNumeric>{week.total_orders}</Td>
                                            <Td isNumeric>{week.unique_customers}</Td>
                                            <Td isNumeric>{week.average_order_value.toFixed(2)}</Td>
                                            <Td>{formatDateToReadable(week.busiest_day)}</Td>
                                            <Td>{formatDateToReadable(week.slowest_day)}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>

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
                                            <Td>{formatDateToReadable(week.week)}</Td>
                                            <Td isNumeric>{week.total_sales.toLocaleString()}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    );
};

export default WeeklyAnalysis;